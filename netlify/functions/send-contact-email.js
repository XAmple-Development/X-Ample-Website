const nodemailer = require('nodemailer');

const defaultCorsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
};

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: defaultCorsHeaders };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: defaultCorsHeaders,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    const body = JSON.parse(event.body || '{}');

    const {
      firstName = '',
      lastName = '',
      email = '',
      projectType = '',
      budgetRange = '',
      message = '',
    } = body;

    if (!firstName || !lastName || !email || !message) {
      return {
        statusCode: 400,
        headers: defaultCorsHeaders,
        body: JSON.stringify({ error: 'Missing required fields' }),
      };
    }

    const host = process.env.SMTP_HOST || 'mail.zvapor.xyz';
    const port = parseInt(process.env.SMTP_PORT || '587', 10);
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;
    const from = process.env.MAIL_FROM || 'no-reply@x-ampledevelopment.co.uk';
    const to = process.env.MAIL_TO || 'info@x-ampledevelopment.co.uk';

    if (!user || !pass) {
      console.error('Missing SMTP credentials');
      return {
        statusCode: 500,
        headers: defaultCorsHeaders,
        body: JSON.stringify({ error: 'Server mail configuration not set' }),
      };
    }

    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: false, // STARTTLS on 587
      requireTLS: true,
      auth: { user, pass },
    });

    // Company notification
    await transporter.sendMail({
      from,
      to,
      replyTo: email,
      subject: `New Contact Form Submission from ${firstName} ${lastName}`,
      html: `
        <h2>New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${firstName} ${lastName}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Project Type:</strong> ${projectType}</p>
        <p><strong>Budget Range:</strong> ${budgetRange}</p>
        <p><strong>Message:</strong></p>
        <p>${String(message).replace(/\n/g, '<br>')}</p>
        <hr>
        <p><em>This message was sent from the X-Ample Development contact form.</em></p>
      `,
    });

    // Customer confirmation
    await transporter.sendMail({
      from,
      to: email,
      subject: 'Thank you for contacting X-Ample Development!',
      html: `
        <h2>Thank you for your message, ${firstName}!</h2>
        <p>We have received your inquiry about <strong>${projectType || 'your project'}</strong> and will get back to you within 24 hours.</p>
        <h3>Your submission details:</h3>
        <p><strong>Project Type:</strong> ${projectType}</p>
        <p><strong>Budget Range:</strong> ${budgetRange}</p>
        <p><strong>Message:</strong> ${String(message).replace(/\n/g, '<br>')}</p>
        <p>Best regards,<br/>The X-Ample Development Team</p>
      `,
    });

    return {
      statusCode: 200,
      headers: { ...defaultCorsHeaders, 'Content-Type': 'application/json' },
      body: JSON.stringify({ success: true }),
    };
  } catch (err) {
    console.error('send-contact-email error', err);
    return {
      statusCode: 500,
      headers: defaultCorsHeaders,
      body: JSON.stringify({ error: 'Failed to send email' }),
    };
  }
};


