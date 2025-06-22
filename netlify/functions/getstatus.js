import fetch from 'node-fetch';

const API_KEY = process.env.BETTERSTACK_API_KEY;
const BASE_URL = 'https://betteruptime.com/api/v2';

async function fetchFromAPI(path) {
    const res = await fetch(`${BASE_URL}${path}`, {
        headers: { Authorization: `Bearer ${API_KEY}` },
    });

    if (!res.ok) {
        throw new Error(`Failed to fetch ${path}: ${res.status}`);
    }

    return res.json();
}

export const handler = async () => {
    try {
        const [monitorsRes, incidentsRes, maintenanceRes] = await Promise.allSettled([
            fetchFromAPI('/monitors'),
            fetchFromAPI('/incidents'),
            fetchFromAPI('/scheduled-maintenances'),
        ]);

        const monitors =
            monitorsRes.status === 'fulfilled' ? monitorsRes.value.data : [];
        const incidents =
            incidentsRes.status === 'fulfilled' ? incidentsRes.value.data : [];
        const maintenances =
            maintenanceRes.status === 'fulfilled' ? maintenanceRes.value.data : [];

        const response = {
            monitors,
            incidents,
            scheduled_maintenances: maintenances,
        };

        return {
            statusCode: 200,
            body: JSON.stringify(response),
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json',
            },
        };
    } catch (error) {
        console.error('Netlify function error:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message }),
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json',
            },
        };
    }
};
