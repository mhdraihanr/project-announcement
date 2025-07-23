import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const payload = await request.json();

    // Verify webhook signature (you should add your webhook secret here)
    const webhookSecret = process.env.SUPABASE_WEBHOOK_SECRET;
    const signature = request.headers.get("x-supabase-signature");

    // Add signature verification here if needed
    // if (!verifySignature(payload, signature, webhookSecret)) {
    //   return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    // }

    // Handle user role changes
    if (payload.table === "users" && payload.type === "UPDATE") {
      const oldRole = payload.old_record.role;
      const newRole = payload.record.role;
      const userId = payload.record.id;

      if (oldRole !== newRole) {
        console.log(
          `User ${userId} role changed from ${oldRole} to ${newRole}`
        );

        // Update user metadata in auth.users if needed
        const supabase = createRouteHandlerClient({ cookies });
        await supabase.auth.admin.updateUserById(userId, {
          user_metadata: { role: newRole },
        });

        // You could also emit an event or trigger other actions here
        // For example, send a notification, update other services, etc.

        return NextResponse.json({
          success: true,
          message: "Role update processed",
          user: userId,
          oldRole,
          newRole,
        });
      }
    }

    return NextResponse.json({ success: true, message: "Webhook processed" });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}

// Optional: Add a GET endpoint for testing
export async function GET() {
  return NextResponse.json({
    message: "Supabase webhook endpoint is active",
    timestamp: new Date().toISOString(),
  });
}
