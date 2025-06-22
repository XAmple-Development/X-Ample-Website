export const handler = async (event) => {
    const pageId = '206174';
    const apiKey = process.env.BETTERSTACK_API_KEY;

    try {
        const res = await fetch(`https://betteruptime.com/api/v2/status-pages/${pageId}`, {
            headers: {
                Authorization: `Bearer ${apiKey}`,
            },
        });

        if (!res.ok) {
            throw new Error(`BetterStack API responded with status ${res.status}`);
        }

        const data = await res.json();

        return {
            statusCode: 200,
            body: JSON.stringify(data),
            headers: {
                'Access-Control-Allow-Origin': '*', // or your domain
                'Content-Type': 'application/json',
            },
        };
    } catch (err) {
        console.error('Error fetching BetterStack data:', err);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Failed to fetch from BetterStack', details: err.message }),
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json',
            },
        };
    }
};
