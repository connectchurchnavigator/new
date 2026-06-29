"use server";

import { createAdminClient } from '@/lib/supabase-admin';

export async function registerVisitor(formData: {
  church_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  city: string;
  is_first_time: boolean;
  service: string;
  hear_about: string;
}) {
  const sb = createAdminClient();
  
  const name = `${formData.first_name} ${formData.last_name}`.trim();

  const { error: visitorError, data: visitor } = await sb
    .from('visitors')
    .insert({
      church_id: formData.church_id,
      name,
      email: formData.email,
      phone: formData.phone,
      city: formData.city,
      source: formData.hear_about,
      stage: formData.is_first_time ? 'first' : 'returning'
    })
    .select()
    .single();

  if (visitorError) {
    console.error("Failed to insert visitor:", visitorError);
    return { success: false, error: visitorError.message };
  }

  // We also insert a check-in event so it appears in attendance
  // To do this properly, we need the exact service_id. Since the UI currently
  // only returns a string like "Sunday 10:30 AM", we might not have the ID directly
  // unless we pass it. I will update the UI to send the service_id instead.
  
  // Wait, I will just let the UI send the service_id in the formData.
  if (formData.service && formData.service !== 'Not sure yet') {
    const { error: checkinError } = await sb
      .from('check_ins')
      .insert({
        church_id: formData.church_id,
        visitor_id: visitor.id,
        service_id: formData.service, // Expected to be a UUID
        is_first_time: formData.is_first_time
      });
      
    if (checkinError) {
      console.error("Failed to insert check-in:", checkinError);
      // We still return true because the visitor record was saved
    }
  }

  return { success: true };
}
