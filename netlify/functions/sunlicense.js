const defaultCorsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
};

const getBaseUrl = () => process.env.SUNLICENSE_BASE_URL || 'https://sunlicense.hapangama.com';
const getToken = () => process.env.SUNLICENSE_API_TOKEN;

async function doFetch(path) {
  const url = `${getBaseUrl()}${path}`;
  const headers = {};
  if (!path.includes('/healthy')) {
    const token = getToken();
    if (!token) throw new Error('SUNLICENSE_API_TOKEN not configured');
    headers['TOKEN'] = token;
  }
  const res = await fetch(url, { headers });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Upstream ${res.status}: ${text}`);
  }
  const contentType = res.headers.get('content-type') || '';
  if (contentType.includes('application/json')) return res.json();
  return res.text();
}

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers: defaultCorsHeaders };
  if (event.httpMethod !== 'GET') {
    return { statusCode: 405, headers: defaultCorsHeaders, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  try {
    const params = event.queryStringParameters || {};
    const action = params.action || '';

    let data;
    switch (action) {
      case 'healthy':
        data = await doFetch('/api/v2/healthy');
        break;
      case 'ping':
        data = await doFetch('/api/v2/ping');
        break;
      case 'products': {
        if (params.id) data = await doFetch(`/api/v2/products/${encodeURIComponent(params.id)}`);
        else data = await doFetch('/api/v2/products');
        break;
      }
      case 'licenseByKey': {
        const key = params.licenseKey;
        if (!key) throw new Error('licenseKey is required');
        data = await doFetch(`/api/v2/licenses/by-license-key/${encodeURIComponent(key)}`);
        break;
      }
      case 'licensesByEmail': {
        const email = params.email;
        if (!email) throw new Error('email is required');
        data = await doFetch(`/api/v2/licenses/by-customer-email/${encodeURIComponent(email)}`);
        break;
      }
      case 'licensesByProduct': {
        const productId = params.productId;
        if (!productId) throw new Error('productId is required');
        data = await doFetch(`/api/v2/licenses/by-product-id/${encodeURIComponent(productId)}`);
        break;
      }
      case 'licensesByDiscordId': {
        const discordId = params.discordId;
        if (!discordId) throw new Error('discordId is required');
        data = await doFetch(`/api/v2/licenses/by-discord-id/${encodeURIComponent(discordId)}`);
        break;
      }
      default:
        return {
          statusCode: 400,
          headers: defaultCorsHeaders,
          body: JSON.stringify({ error: 'Unknown action', actions: ['healthy','ping','products','licenseByKey','licensesByEmail','licensesByProduct','licensesByDiscordId'] }),
        };
    }

    return {
      statusCode: 200,
      headers: { ...defaultCorsHeaders, 'Content-Type': 'application/json' },
      body: typeof data === 'string' ? JSON.stringify({ data }) : JSON.stringify(data),
    };
  } catch (err) {
    console.error('sunlicense proxy error', err);
    return { statusCode: 500, headers: defaultCorsHeaders, body: JSON.stringify({ error: err.message }) };
  }
};


