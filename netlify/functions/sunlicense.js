const defaultCorsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
};

const getBaseUrl = () => process.env.SUNLICENSE_BASE_URL || 'http://25604.mh.sunlicense.hapangama.com';
const getToken = () => process.env.SUNLICENSE_API_TOKEN;

async function doFetch(path) {
  const base = getBaseUrl();
  const url = `${base}${path}`;
  const headers = {};
  if (!path.includes('/healthy')) {
    const token = getToken();
    if (!token) throw new Error('SUNLICENSE_API_TOKEN not configured');
    headers['TOKEN'] = token;
  }
  const res = await fetch(url, { headers, redirect: 'follow' });
  const contentType = res.headers.get('content-type') || '';
  let body;
  try {
    body = contentType.includes('application/json') ? await res.json() : await res.text();
  } catch {
    body = null;
  }
  // Normalize HTML errors (e.g., upstream 404 HTML pages) into simple JSON, include target URL for debugging
  if (res.status === 404 && !contentType.includes('application/json')) {
    body = { error: 'Not found', target: url };
    return { status: 404, headers: { 'content-type': 'application/json' }, body };
  }

  return { status: res.status, headers: { 'content-type': contentType }, body, target: url };
}

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers: defaultCorsHeaders };
  if (event.httpMethod !== 'GET') {
    return { statusCode: 405, headers: defaultCorsHeaders, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  try {
    const params = event.queryStringParameters || {};
    const action = params.action || '';

    let result;
    switch (action) {
      case 'healthy':
        result = await doFetch('/api/v2/healthy');
        break;
      case 'ping':
        result = await doFetch('/api/v2/ping');
        break;
      case 'products': {
        if (params.id) result = await doFetch(`/api/v2/products/${encodeURIComponent(params.id)}`);
        else result = await doFetch('/api/v2/products');
        break;
      }
      case 'licenseByKey': {
        const key = params.licenseKey;
        if (!key) throw new Error('licenseKey is required');
        result = await doFetch(`/api/v2/licenses/by-license-key/${encodeURIComponent(key)}`);
        break;
      }
      case 'licensesByEmail': {
        const email = params.email;
        if (!email) throw new Error('email is required');
        result = await doFetch(`/api/v2/licenses/by-customer-email/${encodeURIComponent(email)}`);
        break;
      }
      case 'licensesByProduct': {
        const productId = params.productId;
        if (!productId) throw new Error('productId is required');
        result = await doFetch(`/api/v2/licenses/by-product-id/${encodeURIComponent(productId)}`);
        break;
      }
      case 'licensesByDiscordId': {
        const discordId = params.discordId;
        if (!discordId) throw new Error('discordId is required');
        result = await doFetch(`/api/v2/licenses/by-discord-id/${encodeURIComponent(discordId)}`);
        break;
      }
      default:
        return {
          statusCode: 400,
          headers: defaultCorsHeaders,
          body: JSON.stringify({ error: 'Unknown action', actions: ['healthy','ping','products','licenseByKey','licensesByEmail','licensesByProduct','licensesByDiscordId'] }),
        };
    }

    const statusCode = result.status || 200;
    const isJson = (result.headers['content-type'] || '').includes('application/json');
    const body = isJson ? JSON.stringify(result.body) : JSON.stringify({ data: result.body, target: result.target });
    return { statusCode, headers: { ...defaultCorsHeaders, 'Content-Type': 'application/json' }, body };
  } catch (err) {
    console.error('sunlicense proxy error', err);
    return { statusCode: 500, headers: defaultCorsHeaders, body: JSON.stringify({ error: err.message }) };
  }
};


