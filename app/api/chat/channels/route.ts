import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const supabase = createRouteHandlerClient({ cookies });

    const { data: channels, error } = await supabase
      .from("chat_channels")
      .select("*")
      .order("name", { ascending: true });

    if (error) {
      console.error("Error fetching channels:", error);
      return NextResponse.json(
        { error: "Failed to fetch channels" },
        { status: 500 }
      );
    }

    return NextResponse.json(channels);
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export const dynamic = "force-dynamic";
