
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ContactFormData {
  firstName: string;
  lastName: string;
  email: string;
  projectType: string;
  budgetRange: string;
  message: string;
}

const handler = async (req: Request): Promise<Response> => {
  console.log("Contact form submission received");

  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response("Method not allowed", { 
      status: 405, 
      headers: corsHeaders 
    });
  }

  try {
    const formData: ContactFormData = await req.json();
    console.log("Form data received:", formData);

    // Send email to your company
    const emailResponse = await resend.emails.send({
      from: "X-Ample Development <onboarding@resend.dev>",
      to: ["info@x-ampledevelopment.com"],
      subject: `New Contact Form Submission from ${formData.firstName} ${formData.lastName}`,
      html: `
        <h2>New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${formData.firstName} ${formData.lastName}</p>
        <p><strong>Email:</strong> ${formData.email}</p>
        <p><strong>Project Type:</strong> ${formData.projectType}</p>
        <p><strong>Budget Range:</strong> ${formData.budgetRange}</p>
        <p><strong>Message:</strong></p>
        <p>${formData.message.replace(/\n/g, '<br>')}</p>
        
        <hr>
        <p><em>This message was sent from the X-Ample Development contact form.</em></p>
      `,
    });

    console.log("Email sent successfully:", emailResponse);

    // Send confirmation email to the customer
    await resend.emails.send({
      from: "X-Ample Development <onboarding@resend.dev>",
      to: [formData.email],
      subject: "Thank you for contacting X-Ample Development!",
      html: `
        <h2>Thank you for your message, ${formData.firstName}!</h2>
        <p>We have received your inquiry about <strong>${formData.projectType}</strong> and will get back to you within 24 hours.</p>
        
        <h3>Your submission details:</h3>
        <p><strong>Project Type:</strong> ${formData.projectType}</p>
        <p><strong>Budget Range:</strong> ${formData.budgetRange}</p>
        <p><strong>Message:</strong> ${formData.message}</p>
        
        <p>Best regards,<br>
        The X-Ample Development Team</p>
        
        <hr>
        <p><em>If you didn't submit this form, please ignore this email.</em></p>
      `,
    });

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Email sent successfully" 
      }), 
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );

  } catch (error: any) {
    console.error("Error in send-contact-email function:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      {
        status: 500,
        headers: { 
          "Content-Type": "application/json", 
          ...corsHeaders 
        },
      }
    );
  }
};

serve(handler);
