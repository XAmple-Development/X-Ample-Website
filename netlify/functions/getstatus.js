export const handler = async () => {
    const pageId = '206174';
    const apiKey = process.env.BETTERSTACK_API_KEY;
    const baseUrl = 'https://betteruptime.com/api/v2/status-pages';

    try {
        const [pageRes, componentsRes, incidentsRes, maintenanceRes] = await Promise.all([
            fetch(`${baseUrl}/${pageId}`, { headers: { Authorization: `Bearer ${apiKey}` } }),
            fetch(`${baseUrl}/${pageId}/components`, { headers: { Authorization: `Bearer ${apiKey}` } }),
            fetch(`${baseUrl}/${pageId}/incidents`, { headers: { Authorization: `Bearer ${apiKey}` } }),
            fetch(`${baseUrl}/${pageId}/scheduled-maintenances`, { headers: { Authorization: `Bearer ${apiKey}` } }),
        ]);

        if (![pageRes, componentsRes, incidentsRes, maintenanceRes].every(r => r.ok)) {
            throw new Error('One or more BetterStack API calls failed');
        }

        const pageData = await pageRes.json();
        const componentsData = await componentsRes.json();
        const incidentsData = await incidentsRes.json();
        const maintenanceData = await maintenanceRes.json();

        // Combine into one object your frontend expects
        const combined = {
            page: pageData.data.attributes,
            summary: componentsData.data,               // array of components/monitors
            incidents: incidentsData.data,              // array of incidents
            scheduled_maintenances: maintenanceData.data,  // array of maintenance events
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
        console.error(err);
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
