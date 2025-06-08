
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface ContactEmailRequest {
  name: string;
  email: string;
  subject: string;
  message: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { name, email, subject, message }: ContactEmailRequest = await req.json();

    console.log('Sending contact email from:', name, email);

    // Send email to the studio
    const emailResponse = await resend.emails.send({
      from: "Contact Form <onboarding@resend.dev>",
      to: ["info@uprising.ink"],
      subject: `Contact Form: ${subject}`,
      html: `
        <h2>New Contact Form Submission</h2>
        <p><strong>From:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Subject:</strong> ${subject}</p>
        <div>
          <strong>Message:</strong>
          <p style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin-top: 10px;">
            ${message.replace(/\n/g, '<br>')}
          </p>
        </div>
        <hr>
        <p style="color: #666; font-size: 12px;">
          This email was sent from the contact form on your website.
        </p>
      `,
    });

    console.log("Contact email sent successfully:", emailResponse);

    // Send confirmation email to the person who submitted the form
    const confirmationResponse = await resend.emails.send({
      from: "UpRising Ink <onboarding@resend.dev>",
      to: [email],
      subject: "Thank you for contacting UpRising Ink!",
      html: `
        <h1>Thank you for reaching out, ${name}!</h1>
        <p>We have received your message and will get back to you as soon as possible.</p>
        <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <strong>Your message:</strong>
          <p>${message.replace(/\n/g, '<br>')}</p>
        </div>
        <p>Our team typically responds within 24-48 hours during business hours.</p>
        <hr>
        <p><strong>UpRising Ink</strong><br>
        1631 Sunset Rd c103<br>
        Las Vegas, NV 89119<br>
        (725) 204-6609</p>
      `,
    });

    console.log("Confirmation email sent successfully:", confirmationResponse);

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-contact-email function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
