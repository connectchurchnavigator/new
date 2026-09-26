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
     return { success: false, error: "Email service is temporarily unavailable. Please try again later." };
  }

  const fromEmail = process.env.RESEND_FROM_EMAIL || "Church Navigator <onboarding@resend.dev>";
  const resend = new Resend(process.env.RESEND_API_KEY);

  try {
    let { data, error } = await resend.emails.send({
      from: fromEmail,
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

    // If Resend gives the testing domain restriction error, forward to admin/testing email so message is not lost
    if (error && error.message && error.message.includes("resend.com/domains")) {
      const fallbackTarget = "connect.churchnavigator@gmail.com";
      const fallbackRes = await resend.emails.send({
        from: "Church Navigator <onboarding@resend.dev>",
        to: [fallbackTarget],
        replyTo: email,
        subject: `[FORWARDED for ${churchName}] ${subject}`,
        html: `
          <div style="background:#fef3c7;padding:12px;border-radius:8px;margin-bottom:16px;font-size:13px;color:#92400e;">
            <strong>Note:</strong> Forwarded to admin testing address because domain <em>churchnavigator.com</em> is pending DNS verification in Resend.
            <br /><strong>Intended recipient:</strong> ${targetEmail}
          </div>
          <h2>New message for ${churchName}</h2>
          <p><strong>From:</strong> ${name} (${email})</p>
          <p><strong>Subject:</strong> ${subject}</p>
          <hr />
          <p style="white-space: pre-wrap;">${message}</p>
        `,
      });

      if (!fallbackRes.error) {
        return { success: true, data: fallbackRes.data, notice: "Message delivered to administrator inbox while domain verification is active." };
      }
    }

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
