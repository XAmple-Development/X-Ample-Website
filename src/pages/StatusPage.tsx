import fetch from 'node-fetch';

const API_KEY = process.env.BETTERSTACK_API_KEY;
const PAGE_ID = '206174';
const BASE_URL = 'https://betteruptime.com/api/v2';

async function fetchFromAPI(path) {
    const res = await fetch(`${BASE_URL}${path}`, {
        headers: { Authorization: `Bearer ${API_KEY}` },
    });
    if (!res.ok) throw new Error(`Failed to fetch ${path}: ${res.status}`);
    return res.json();
}

export const handler = async () => {
    try {
        const [pageRes, monitorsRes] = await Promise.all([
            fetchFromAPI(`/status-pages/${PAGE_ID}`),
            fetchFromAPI('/monitors'),
        ]);

        const data = {
            page: pageRes.data.attributes,
            monitors: monitorsRes.data,
        };

        return {
            statusCode: 200,
            body: JSON.stringify(data),
            headers: { 'Access-Control-Allow-Origin': '*' },
        };
    } catch (error) {
        console.error(error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message }),
            headers: { 'Access-Control-Allow-Origin': '*' },
        };
    }
};
