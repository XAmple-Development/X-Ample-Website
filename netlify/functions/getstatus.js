import { Handler } from '@netlify/functions';

const handler: Handler = async (event) => {
    const pageId = '206174';
    const apiKey = process.env.BETTERSTACK_API_KEY;

    try {
        const res = await fetch(`https://betteruptime.com/api/v2/status-pages/${pageId}`, {
            headers: {
                Authorization: `Bearer ${apiKey}`,
            },
        });

        const data = await res.json();

        return {
            statusCode: 200,
            body: JSON.stringify(data),
            headers: {
                'Access-Control-Allow-Origin': '*',
            },
        };
    } catch (err: any) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Failed to fetch from BetterStack', details: err.message }),
        };
    }
};

export { handler };
