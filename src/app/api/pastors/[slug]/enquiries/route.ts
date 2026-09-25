import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase-admin';
import { pastorEnquirySchema } from '@/lib/validation';

/**
 * POST /api/pastors/[slug]/enquiries
 *
 * Handles the "Send Enquiry" / "Contact Pastor" form.
 */
export async function POST(
  req: NextRequest,
  props: { params: Promise<{ slug: string }> }
) {
  const params = await props.params;
  const supabase = createAdminClient();

  const { data: pastor, error: pastorError } = await supabase
    .from('pastors')
    .select('id, name, full_name, email, contact_email')
    .eq('slug', params.slug)
    .eq('is_published', true)
    .maybeSingle();

  if (pastorError) {
    console.error('Failed to look up pastor for enquiry:', pastorError);
    return NextResponse.json({ error: 'Failed to submit enquiry' }, { status: 500 });
  }

  if (!pastor) {
    return NextResponse.json({ error: 'Pastor not found' }, { status: 404 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const parsed = pastorEnquirySchema.safeParse({ ...(body as object), pastor_id: pastor.id });
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation failed', issues: parsed.error.flatten() },
      { status: 422 }
    );
  }

  const { error: insertError } = await supabase.from('pastor_enquiries').insert(parsed.data);

  if (insertError) {
    console.error('Failed to insert enquiry:', insertError);
    return NextResponse.json({ error: 'Failed to submit enquiry' }, { status: 500 });
  }

  // Asynchronously dispatch Resend email notifications (non-blocking)
  (async () => {
    try {
      const { sendEnquiryNotificationEmail, sendEnquiryReceiptEmail } = await import('@/emails');
      const pastorName = pastor.name || 'Pastor';
      const recipientEmail = pastor.email || pastor.contact_email;

      // 1. Email notification to pastor/church
      if (recipientEmail) {
        await sendEnquiryNotificationEmail(recipientEmail, {
          recipientName: pastorName,
          senderName: parsed.data.sender_name,
          senderEmail: parsed.data.sender_email,
          subject: parsed.data.event_type ? `Enquiry regarding ${parsed.data.event_type}` : undefined,
          message: parsed.data.message,
          entityName: pastorName,
          entityType: 'pastor',
        });
      }

      // 2. Instant receipt back to the visitor
      if (parsed.data.sender_email) {
        await sendEnquiryReceiptEmail(parsed.data.sender_email, {
          senderName: parsed.data.sender_name,
          entityName: pastorName,
          message: parsed.data.message,
        });
      }
    } catch (emailErr) {
      console.error('[Email Notification Error]', emailErr);
    }
  })();

  return NextResponse.json({ success: true }, { status: 201 });
}
