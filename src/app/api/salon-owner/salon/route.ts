import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

async function getSupabase() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll(); },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        },
      },
    }
  );
}

function getServiceRoleSupabase() {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey || !process.env.NEXT_PUBLIC_SUPABASE_URL) return null;
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, serviceKey);
}

// GET /api/salon-owner/salon — fetch owner's full salon data
export async function GET() {
  try {
    const supabase = await getSupabase();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const { data: salon, error } = await supabase
      .from("salons")
      .select("*")
      .eq("owner_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      // Try service role fallback if RLS blocks query
      const adminClient = getServiceRoleSupabase();
      if (adminClient) {
        const { data: adminSalon } = await adminClient
          .from("salons")
          .select("*")
          .eq("owner_id", user.id)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();
        return NextResponse.json({ salon: adminSalon || null });
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ salon: salon || null });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Internal server error" }, { status: 500 });
  }
}

// PATCH /api/salon-owner/salon — update salon info
export async function PATCH(req: NextRequest) {
  try {
    const supabase = await getSupabase();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    // Verify salon belongs to this owner
    let { data: existingSalon } = await supabase
      .from("salons")
      .select("id, owner_id")
      .eq("owner_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    // Fallback to service role if SSR client cannot find via RLS
    if (!existingSalon) {
      const adminClient = getServiceRoleSupabase();
      if (adminClient) {
        const { data: adminExisting } = await adminClient
          .from("salons")
          .select("id, owner_id")
          .eq("owner_id", user.id)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();
        existingSalon = adminExisting;
      }
    }

    if (!existingSalon) {
      return NextResponse.json({ error: "No salon found for this owner" }, { status: 404 });
    }

    const body = await req.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "Invalid JSON request body" }, { status: 400 });
    }

    // Whitelist of updatable fields
    const allowed = [
      "name", "tagline", "description", "category",
      "address", "area", "city", "pincode", "phone", "email",
      "website", "cover_image", "gallery_images",
      "amenities", "working_hours", "is_active",
      "instagram", "social_links", "cancellation_policy",
      "starting_price", "lat", "lng", "google_maps_url",
    ];

    const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
    for (const key of allowed) {
      if (key in body) {
        updates[key] = body[key];
      }
    }

    // Normalize coordinates & numeric types to prevent Postgres type errors
    if ("lat" in updates) {
      const val = updates.lat;
      updates.lat = val !== null && val !== undefined && val !== "" && !isNaN(Number(val)) ? Number(val) : null;
    }
    if ("lng" in updates) {
      const val = updates.lng;
      updates.lng = val !== null && val !== undefined && val !== "" && !isNaN(Number(val)) ? Number(val) : null;
    }
    if ("starting_price" in updates) {
      const val = updates.starting_price;
      updates.starting_price = val !== null && val !== undefined && val !== "" && !isNaN(Number(val)) ? Number(val) : 0;
    }
    if ("gallery_images" in updates && !Array.isArray(updates.gallery_images)) {
      updates.gallery_images = [];
    }
    if ("amenities" in updates && !Array.isArray(updates.amenities)) {
      updates.amenities = [];
    }

    // Update using verified existingSalon.id
    let { data: salon, error } = await supabase
      .from("salons")
      .update(updates)
      .eq("id", existingSalon.id)
      .select("*")
      .single();

    // Fallback to service role if user client hit RLS update restrictions
    if (error) {
      const adminClient = getServiceRoleSupabase();
      if (adminClient) {
        const { data: adminUpdated, error: adminError } = await adminClient
          .from("salons")
          .update(updates)
          .eq("id", existingSalon.id)
          .select("*")
          .single();

        if (adminError) {
          return NextResponse.json({ error: adminError.message }, { status: 500 });
        }
        salon = adminUpdated;
        error = null;
      }
    }

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ salon, message: "Salon updated successfully" });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Internal server error" }, { status: 500 });
  }
}
