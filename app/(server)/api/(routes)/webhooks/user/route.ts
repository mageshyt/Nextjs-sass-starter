import { CreateOrUpdateUser } from "@/action/user/create-user";
import { env } from "@/env";
import { IncomingHttpHeaders } from "http";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { Webhook, WebhookRequiredHeaders } from "svix";

const webhookSecret = env.WEBHOOK_SECRET || "";

async function handler(request: Request) {
  if (!webhookSecret) {
    console.error("No webhook secret provided");
    return NextResponse.json({}, { status: 400 });
  }
  const payload = await request.json();

  const headersList = await headers();
  const heads = {
    "svix-id": headersList.get("svix-id"),
    "svix-timestamp": headersList.get("svix-timestamp"),
    "svix-signature": headersList.get("svix-signature"),
  };
  const wh = new Webhook(webhookSecret);
  let evt: Event | null = null;

  try {
    evt = wh.verify(
      JSON.stringify(payload),
      heads as IncomingHttpHeaders & WebhookRequiredHeaders
    ) as Event;
  } catch (err) {
    console.error((err as Error).message);
    return NextResponse.json({}, { status: 400 });
  }

  const eventType: EventType = evt.type;

  console.log("[CREATE USER] EVENT", eventType);

  switch (eventType) {
    case "user.created": {
      await CreateOrUpdateUser({
        email: payload?.data?.email_addresses?.[0]?.email_address,
        first_name: payload?.data?.first_name,
        last_name: payload?.data?.last_name,
        profile_image_url: payload?.data?.profile_image_url,
        user_id: payload?.data?.id,
        type: "CREATE"
      })

      return NextResponse.json({ message: "User created" });
    }
    case "user.updated": {
      const { data } = payload;
      await CreateOrUpdateUser({
        email: data?.email_addresses?.[0]?.email_address,
        first_name: data?.first_name,
        last_name: data?.last_name,
        profile_image_url: data?.profile_image_url,
        user_id: data?.id,
        type: "UPDATE"
      })
      return NextResponse.json({ message: "User updated" });
    }

    default: {
      return NextResponse.json({ message: "Event not found" }, { status: 404 });
    }

  }
}
type EventType = "user.created" | "user.updated" | "*";

type Event = {
  data: Record<string, string | any>;
  object: "event";
  type: EventType;
};

export const GET = handler;
export const POST = handler;
export const PUT = handler;
