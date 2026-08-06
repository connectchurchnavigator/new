"use server";

import { Resend } from "resend";

export async function sendEmailAction(formData: FormData) {
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const subject = formData.get("subject") as string;
  const message = formData.get("message") as string;
  const targetEmail = formData.get("targetEmail") as string;
  const churchName = formData.get("churchName") as string;

  if (!targetEmail) {
    return { success: false, error: "Church email not provided." };
  }
  
  if (!process.env.RESEND_API_KEY) {
     return { success: false, error: "Resend API key is missing. Please add RESEND_API_KEY to your environment variables." };
  }

  const resend = new Resend(process.env.RESEND_API_KEY);

  try {
    const { data, error } = await resend.emails.send({
      from: "Church Navigator <onboarding@resend.dev>", // In production, use your own verified domain
      to: [targetEmail],
      replyTo: email,
      subject: `New message for ${churchName}: ${subject}`,
      html: `
        <h2>You have a new message from Church Navigator!</h2>
        <p><strong>From:</strong> ${name} (${email})</p>
        <p><strong>Subject:</strong> ${subject}</p>
        <hr />
        <p style="white-space: pre-wrap;">${message}</p>
      `,
    });

    if (error) {
      console.error("Resend error:", error);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error: any) {
    console.error("Error sending email:", error);
    return { success: false, error: error.message || "Failed to send email" };
  }
}
