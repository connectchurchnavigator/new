import React from "react";
import EventClientView from "./EventClientView";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function EventDetailPage({ params }: PageProps) {
  const resolvedParams = await params;
  return <EventClientView slug={resolvedParams.slug} />;
}
