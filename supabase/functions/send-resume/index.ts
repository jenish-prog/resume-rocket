import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { SMTPClient } from "https://deno.land/x/denomailer@1.6.0/mod.ts";
import { encode as base64Encode } from "https://deno.land/std@0.168.0/encoding/base64.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, company } = await req.json();

    if (!email || !company) {
      return new Response(
        JSON.stringify({ error: "Email and company are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const gmailUser = Deno.env.get("GMAIL_USER");
    const gmailPassword = Deno.env.get("GMAIL_APP_PASSWORD");

    if (!gmailUser || !gmailPassword) {
      return new Response(
        JSON.stringify({ error: "Gmail credentials not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fetch resume PDF from Supabase Storage
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const resumeUrl = `${supabaseUrl}/storage/v1/object/public/resumes/resume.pdf`;
    const resumeResponse = await fetch(resumeUrl);

    if (!resumeResponse.ok) {
      throw new Error("Failed to fetch resume from storage");
    }

    const resumeBuffer = await resumeResponse.arrayBuffer();
    const resumeBase64 = base64Encode(new Uint8Array(resumeBuffer));

    const client = new SMTPClient({
      connection: {
        hostname: "smtp.gmail.com",
        port: 465,
        tls: true,
        auth: {
          username: gmailUser,
          password: gmailPassword,
        },
      },
    });

    await client.send({
      from: gmailUser,
      to: email,
      subject: "Application for Internship",
      content: `Dear HR,

I am writing to express my interest in pursuing an internship opportunity. I am eager to contribute to your team and gain practical experience in web development.

Please let me know if there are any available positions or what the application process entails. I have attached my resume for your review and would welcome the opportunity to discuss how I can contribute to your company.

Thank you for your time and consideration.

Best regards,

Jenish .S`,
      html: `<div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
<p>Dear HR,</p>
<p>I am writing to express my interest in pursuing an internship opportunity. I am eager to contribute to your team and gain practical experience in web development.</p>
<p>Please let me know if there are any available positions or what the application process entails. I have attached my resume for your review and would welcome the opportunity to discuss how I can contribute to your company.</p>
<p>Thank you for your time and consideration.</p>
<br/>
<p>Best regards,</p>
<p><strong>Jenish .S</strong></p>
</div>`,
      attachments: [
        {
          filename: "Jenish_Resume.pdf",
          content: resumeBase64,
          encoding: "base64",
          contentType: "application/pdf",
        },
      ],
    });

    await client.close();

    return new Response(
      JSON.stringify({ success: true, message: "Email sent successfully" }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error sending email:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Failed to send email" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
