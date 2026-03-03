import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { SMTPClient } from "https://deno.land/x/denomailer@1.6.0/mod.ts";
import { encode as base64Encode } from "https://deno.land/std@0.168.0/encoding/base64.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY")!;

    if (!gmailUser || !gmailPassword) {
      return new Response(
        JSON.stringify({ error: "Gmail credentials not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fetch email template from DB
    const sb = createClient(supabaseUrl, supabaseKey);
    const { data: template } = await sb
      .from("email_template")
      .select("*")
      .limit(1)
      .maybeSingle();

    const subject = template?.subject || "Application for Internship";
    const messageText = template?.message || "";
    const resumeFilename = template?.resume_filename || "resume.pdf";

    // Fetch resume PDF from storage
    const resumeUrl = `${supabaseUrl}/storage/v1/object/public/resumes/${resumeFilename}`;
    const resumeResponse = await fetch(resumeUrl);

    if (!resumeResponse.ok) {
      throw new Error("Failed to fetch resume from storage");
    }

    const resumeBuffer = await resumeResponse.arrayBuffer();
    const resumeBase64 = base64Encode(new Uint8Array(resumeBuffer));

    // Convert plain text message to HTML
    const htmlMessage = messageText
      .split("\n")
      .map((line: string) => (line.trim() === "" ? "<br/>" : `<p>${line}</p>`))
      .join("\n");

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
      subject,
      content: messageText,
      html: `<div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">${htmlMessage}</div>`,
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
