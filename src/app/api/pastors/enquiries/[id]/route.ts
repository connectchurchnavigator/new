import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { createAdminClient } from '@/lib/supabase-admin';

/**
 * PATCH /api/pastors/enquiries/[id]
 * Update the status of an enquiry (new, read, responded, archived).
 * Verifies that the authenticated user owns the pastor to which the enquiry belongs.
 */
export async function PATCH(
  req: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
  const enquiryId = params.id;

  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { status } = body;
  const validStatuses = ['new', 'in_progress', 'read', 'responded', 'archived'];
  if (!status || !validStatuses.includes(status)) {
    return NextResponse.json({ error: 'Invalid status value' }, { status: 422 });
  }

  const adminSb = createAdminClient();

  // Find the enquiry and verify the pastor's owner is this user
  const { data: enquiry, error: fetchErr } = await adminSb
    .from('pastor_enquiries')
    .select('id, pastor_id')
    .eq('id', enquiryId)
    .single();

  if (fetchErr || !enquiry) {
    return NextResponse.json({ error: 'Enquiry not found' }, { status: 404 });
  }

  const { data: pastor, error: pastorErr } = await adminSb
    .from('pastors')
    .select('id, owner_id')
    .eq('id', enquiry.pastor_id)
    .single();

  if (pastorErr || !pastor || pastor.owner_id !== user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { error: updateErr } = await adminSb
    .from('pastor_enquiries')
    .update({ status })
    .eq('id', enquiryId);

  if (updateErr) {
    console.error('Failed to update enquiry status:', updateErr);
    return NextResponse.json({ error: 'Failed to update enquiry' }, { status: 500 });
  }

  return NextResponse.json({ success: true, status });
}
