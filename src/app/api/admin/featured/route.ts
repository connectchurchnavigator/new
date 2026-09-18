import { NextRequest, NextResponse } from "next/server";
import { getFeaturedConfig, saveFeaturedConfig, FeaturedConfig } from "@/lib/featured";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const config = await getFeaturedConfig();
    return NextResponse.json({ success: true, featured: config });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Failed to load featured config" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { type, id, isFeatured } = body as {
      type: "church" | "pastor" | "worship_leader" | "event";
      id: string;
      isFeatured: boolean;
    };

    if (!type || !id) {
      return NextResponse.json({ error: "Missing type or id" }, { status: 400 });
    }

    const currentConfig = await getFeaturedConfig();
    const keyMap: Record<string, keyof FeaturedConfig> = {
      church: "churchIds",
      pastor: "pastorIds",
      worship_leader: "worshipLeaderIds",
      event: "eventIds",
    };

    const targetKey = keyMap[type];
    if (!targetKey) {
      return NextResponse.json({ error: "Invalid type" }, { status: 400 });
    }

    let currentList = currentConfig[targetKey] || [];
    if (isFeatured) {
      if (!currentList.includes(id)) {
        currentList = [...currentList, id];
      }
    } else {
      currentList = currentList.filter((item) => item !== id);
    }

    const updatedConfig: FeaturedConfig = {
      ...currentConfig,
      [targetKey]: currentList,
    };

    const ok = await saveFeaturedConfig(updatedConfig);
    if (!ok) {
      return NextResponse.json({ error: "Failed to persist featured update" }, { status: 500 });
    }

    return NextResponse.json({ success: true, featured: updatedConfig });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Internal server error" }, { status: 500 });
  }
}
