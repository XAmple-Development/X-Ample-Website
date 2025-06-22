import fetch from 'node-fetch';

export const handler = async () => {
    const STATUS_JSON_URL = 'https://status.x-ampledevelopment.com/status.json';

    try {
        const response = await fetch(STATUS_JSON_URL);

        if (!response.ok) {
            throw new Error(`Failed to fetch public status JSON - Status: ${response.status}`);
        }

        const data = await response.json();

        return {
            statusCode: 200,
            body: JSON.stringify(data),
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json',
            },
        };
    } catch (error) {
        console.error('Error fetching status JSON:', error);

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
