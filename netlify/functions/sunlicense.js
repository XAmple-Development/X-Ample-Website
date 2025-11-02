const defaultCorsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
};

const getBaseUrl = () => process.env.SUNLICENSE_BASE_URL || 'http://25604.mh.sunlicense.hapangama.com';
const getToken = () => process.env.SUNLICENSE_API_TOKEN;

async function doFetch(path) {
  const base = getBaseUrl();
  const url = `${base}${path}`;
  const headers = { 'Accept': 'application/json' };
  if (!path.includes('/healthy')) {
    const token = getToken();
    if (!token) throw new Error('SUNLICENSE_API_TOKEN not configured');
    headers['TOKEN'] = token;
  }
  const res = await fetch(url, { headers, redirect: 'follow' });
  const contentType = res.headers.get('content-type') || '';
  let body;
  try {
    if (contentType.includes('application/json')) {
      body = await res.json();
    } else {
      body = await res.text();
    }
  } catch {
    // Fallback to text to avoid nulls when upstream mislabels content-type
    try { body = await res.text(); } catch { body = ''; }
  }
  // Normalize HTML errors (e.g., upstream 404 HTML pages) into simple JSON, include target URL for debugging
  if (res.status === 404 && !contentType.includes('application/json')) {
    body = { error: 'Not found', target: url };
    return { status: 404, headers: { 'content-type': 'application/json' }, body };
  }

  return { status: res.status, headers: { 'content-type': contentType }, body, target: url };
}

async function doPost(path, payload) {
  const base = getBaseUrl();
  const url = `${base}${path}`;
  const headers = { 'Content-Type': 'application/json', 'Accept': 'application/json' };
  const token = getToken();
  if (!token) throw new Error('SUNLICENSE_API_TOKEN not configured');
  headers['TOKEN'] = token;
  const res = await fetch(url, {
    method: 'POST',
    headers,
    body: typeof payload === 'string' ? payload : JSON.stringify(payload),
    redirect: 'follow',
  });
  const contentType = res.headers.get('content-type') || '';
  let body;
  try {
    if (contentType.includes('application/json')) {
      body = await res.json();
    } else {
      body = await res.text();
    }
  } catch {
    try { body = await res.text(); } catch { body = ''; }
  }
  if (res.status === 404 && !contentType.includes('application/json')) {
    body = { error: 'Not found', target: url };
    return { status: 404, headers: { 'content-type': 'application/json' }, body };
  }
  return { status: res.status, headers: { 'content-type': contentType }, body, target: url };
}

async function doDelete(path) {
  const base = getBaseUrl();
  const url = `${base}${path}`;
  const headers = { 'Accept': 'application/json' };
  const token = getToken();
  if (!token) throw new Error('SUNLICENSE_API_TOKEN not configured');
  headers['TOKEN'] = token;
  const res = await fetch(url, { method: 'DELETE', headers, redirect: 'follow' });
  const contentType = res.headers.get('content-type') || '';
  let body;
  try {
    if (contentType.includes('application/json')) {
      body = await res.json();
    } else {
      body = await res.text();
    }
  } catch {
    try { body = await res.text(); } catch { body = ''; }
  }
  if (res.status === 404 && !contentType.includes('application/json')) {
    body = { error: 'Not found', target: url };
    return { status: 404, headers: { 'content-type': 'application/json' }, body };
  }
  return { status: res.status, headers: { 'content-type': contentType }, body, target: url };
}

async function doPut(path, payload) {
  const base = getBaseUrl();
  const url = `${base}${path}`;
  const headers = { 'Content-Type': 'application/json', 'Accept': 'application/json' };
  const token = getToken();
  if (!token) throw new Error('SUNLICENSE_API_TOKEN not configured');
  headers['TOKEN'] = token;
  const res = await fetch(url, { method: 'PUT', headers, body: JSON.stringify(payload ?? {}), redirect: 'follow' });
  const contentType = res.headers.get('content-type') || '';
  let body;
  try {
    if (contentType.includes('application/json')) body = await res.json(); else body = await res.text();
  } catch { try { body = await res.text(); } catch { body = ''; } }
  return { status: res.status, headers: { 'content-type': contentType }, body, target: url };
}

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers: defaultCorsHeaders };

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
      case 'validate': {
        if (event.httpMethod !== 'POST') {
          return { statusCode: 405, headers: defaultCorsHeaders, body: JSON.stringify({ error: 'Use POST for validate' }) };
        }
        const payload = event.body ? JSON.parse(event.body) : {};
        // SunLicense bots use v1 validate endpoint
        result = await doPost('/api/v1/validate', payload);
        const format = (event.queryStringParameters?.format || '').toLowerCase();
        if (format === 'text') {
          const statusCode = result.status || 200;
          const message = (result.body && (result.body.message || result.body.error)) || (statusCode === 200 ? 'License validated' : 'Request failed');
          return {
            statusCode,
            headers: { ...defaultCorsHeaders, 'Content-Type': 'text/plain; charset=utf-8' },
            body: String(message),
          };
        }
        break;
      }
      case 'products': {
        if (params.id) result = await doFetch(`/api/v2/products/${encodeURIComponent(params.id)}`);
        else result = await doFetch('/api/v2/products');
        break;
      }
      case 'licenses': {
        if (params.email) {
          result = await doFetch(`/api/v2/licenses/by-customer-email/${encodeURIComponent(params.email)}`);
        } else if (params.discordId) {
          result = await doFetch(`/api/v2/licenses/by-discord-id/${encodeURIComponent(params.discordId)}`);
        } else if (params.productId) {
          result = await doFetch(`/api/v2/licenses/by-product-id/${encodeURIComponent(params.productId)}`);
        } else {
          result = await doFetch('/api/v2/licenses');
        }
        break;
      }
      case 'licenseGet': {
        if (!params.id) return { statusCode: 400, headers: defaultCorsHeaders, body: JSON.stringify({ error: 'id required' }) };
        result = await doFetch(`/api/v2/licenses/${encodeURIComponent(params.id)}`);
        break;
      }
      case 'licenseByKey': {
        const key = params.licenseKey;
        if (!key) throw new Error('licenseKey is required');
        result = await doFetch(`/api/v2/licenses/by-license-key/${encodeURIComponent(key)}`);
        break;
      }
      case 'licenseSetStatus': {
        if (event.httpMethod !== 'POST') return { statusCode: 405, headers: defaultCorsHeaders, body: JSON.stringify({ error: 'Use POST for licenseSetStatus' }) };
        const payload = event.body ? JSON.parse(event.body) : {};
        const id = payload.id;
        const newStatus = payload.status;
        if (!id || !newStatus) return { statusCode: 400, headers: defaultCorsHeaders, body: JSON.stringify({ error: 'id and status required' }) };
        // GET current license
        const current = await doFetch(`/api/v2/licenses/${encodeURIComponent(String(id))}`);
        if (current.status !== 200 || !current.body) {
          return { statusCode: current.status || 500, headers: defaultCorsHeaders, body: JSON.stringify({ error: 'Failed to fetch license before update' }) };
        }
        const full = current.body;
        // Update status per API rules (send all fields back)
        const updated = { ...full, licenseStatus: newStatus };
        const putRes = await doPut(`/api/v2/licenses/${encodeURIComponent(String(id))}`, updated);
        const code = putRes.status || 200;
        const outIsJson = (putRes.headers['content-type'] || '').includes('application/json');
        const outBody = outIsJson ? JSON.stringify(putRes.body) : JSON.stringify({ data: putRes.body });
        return { statusCode: code, headers: { ...defaultCorsHeaders, 'Content-Type': 'application/json' }, body: outBody };
      }
      case 'customers': {
        if (params.id) result = await doFetch(`/api/v2/customers/${encodeURIComponent(params.id)}`);
        else result = await doFetch('/api/v2/customers');
        break;
      }
      case 'blacklists': {
        result = await doFetch('/api/v2/blacklists');
        break;
      }
      case 'blacklistAdd': {
        if (event.httpMethod !== 'POST') return { statusCode: 405, headers: defaultCorsHeaders, body: JSON.stringify({ error: 'Use POST for blacklistAdd' }) };
        const payload = event.body ? JSON.parse(event.body) : {};
        result = await doPost('/api/v2/blacklists', payload);
        break;
      }
      case 'blacklistDelete': {
        if (!params.id) return { statusCode: 400, headers: defaultCorsHeaders, body: JSON.stringify({ error: 'id required' }) };
        result = await doDelete(`/api/v2/blacklists/${encodeURIComponent(params.id)}`);
        break;
      }
      case 'requests': {
        result = await doFetch('/api/v2/requests');
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
          body: JSON.stringify({ error: 'Unknown action', actions: ['healthy','ping','products','licenses','licenseByKey','customers','blacklists','blacklistAdd','blacklistDelete','requests','validate'] }),
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


