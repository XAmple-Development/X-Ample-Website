const axios = require('axios');

exports.handler = async (event) => {
    const serverId = event.queryStringParameters.id;

    if (!serverId) {
        return {
            statusCode: 400,
            body: JSON.stringify({ error: 'Server ID is required' }),
        };
    }

    try {
        const response = await axios.get(
            `https://panel.YOUR_DOMAIN.com/api/client/servers/83921b2c/resources`,
            {
                headers: {
                    Authorization: `Bearer ${process.env.PTERO_API_KEY}`,
                    Accept: 'application/json',
                },
            }
        );

        return {
            statusCode: 200,
            body: JSON.stringify(response.data),
        };
    } catch (error) {
        return {
            statusCode: error.response?.status || 500,
            body: JSON.stringify({ error: error.message }),
        };
    }
};
