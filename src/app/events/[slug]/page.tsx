import React from "react";
import type { Metadata } from "next";
import { createAdminClient } from "@/lib/supabase-admin";
import EventClientView from "./EventClientView";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const sb = createAdminClient();
  const resolvedParams = await params;
  const { data: event } = await sb
    .from("events")
    .select("title, description, image_url, cover_image_url")
    .eq("slug", resolvedParams.slug)
    .maybeSingle();

  if (!event) return { title: "Event — ChurchNavigator" };

  const title = `${event.title} — ChurchNavigator`;
  const description = event.description?.slice(0, 160) || `${event.title} on ChurchNavigator`;
  const image = event.image_url || event.cover_image_url || "/og-image.jpg";

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [
        {
          url: image,
          width: 800,
          height: 600,
          alt: event.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
  };
}

export default async function EventDetailPage({ params }: PageProps) {
  const resolvedParams = await params;
  return <EventClientView slug={resolvedParams.slug} />;
}
