import { createCheckout } from "@lemonsqueezy/lemonsqueezy.js";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { variantId } = body;

    if (!variantId) {
      return new NextResponse("Variant ID is required", { status: 400 });
    }

    const checkout = await createCheckout(
      process.env.LEMONSQUEEZY_STORE_ID!,
      variantId,
      {
        // Optionally pass custom data, discounts, etc.
        // For example, to pass a user ID:
        // custom: {
        //   userId: "user_123",
        // },
      }
    );

    return NextResponse.json(checkout);
  } catch (error) {
    console.error("[LEMONSQUEEZY_CHECKOUT_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
