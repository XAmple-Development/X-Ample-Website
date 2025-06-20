// netlify/functions/control.js

exports.handler = async function(event, context) {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method Not Allowed' }),
    };
  }

  try {
    const { id, action } = JSON.parse(event.body);

    // Validate inputs
    if (!id || !['start', 'stop', 'restart'].includes(action)) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Invalid server id or action' }),
      };
    }

    // TODO: Integrate with your actual server control API here.
    // For example, call Pterodactyl API or your custom backend
    // to start/stop/restart the server with id `id`.

    // Simulate success for now:
    console.log(`Received control request for server ${id} with action ${action}`);

    return {
      statusCode: 200,
      body: JSON.stringify({ message: `Server ${id} ${action} command executed` }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal Server Error', details: error.message }),
    };
  }
};
