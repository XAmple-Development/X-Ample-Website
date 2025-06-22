export const handler = async () => {
    const pageId = '206174';
    const apiKey = process.env.BETTERSTACK_API_KEY;
    const baseUrl = 'https://betteruptime.com/api/v2/status-pages';

    try {
           const endpoints = [
            { name: 'page', url: `${baseUrl}/${pageId}` },
            { name: 'monitors', url: `https://betteruptime.com/api/v2/monitors` },
            { name: 'incidents', url: `${baseUrl}/${pageId}/incidents` },
            { name: 'maintenance', url: `${baseUrl}/${pageId}/scheduled-maintenances` },
        ];

        const results = {};

        for (const endpoint of endpoints) {
            const res = await fetch(endpoint.url, {
                headers: { Authorization: `Bearer ${apiKey}` },
            });

            if (!res.ok) {
                console.error(`Failed to fetch ${endpoint.name} - Status: ${res.status}`);
                throw new Error(`Failed to fetch ${endpoint.name} - Status: ${res.status}`);
            }

            results[endpoint.name] = await res.json();
        }

        const combined = {
            page: results.page.data.attributes,
            summary: results.monitors.data,              
            incidents: results.incidents.data,
            scheduled_maintenances: results.maintenance.data,
        };

        return {
            statusCode: 200,
            body: JSON.stringify(combined),
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json',
            },
        };
    } catch (err) {
        console.error('Error in BetterStack fetch:', err);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: err.message }),
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json',
            },
        };
    }
};
