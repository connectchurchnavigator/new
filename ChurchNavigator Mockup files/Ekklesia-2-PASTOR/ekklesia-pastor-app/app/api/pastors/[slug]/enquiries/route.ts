import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase-admin';
import { pastorEnquirySchema } from '@/lib/validation';

/**
 * POST /api/pastors/[slug]/enquiries
 *
 * Handles the "Send Enquiry" / "Contact Pastor" form. Looks up the
 * pastor by slug (so the frontend never needs to know the internal
 * UUID), validates the submission, and stores it for the pastor (or
 * an admin dashboard) to review later.
 *
 * No email is actually sent from here — wire up a transactional email
 * provider (Resend, Postmark, etc.) in a follow-up if you want the
 * pastor notified immediately rather than checking a dashboard.
 */
export async function POST(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  const supabase = createAdminClient();

  const { data: pastor, error: pastorError } = await supabase
    .from('pastors')
    .select('id')
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

  return NextResponse.json({ success: true }, { status: 201 });
}
