import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { currentUser } from '@clerk/nextjs/server'

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_KEY);

export async function GET(request) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: "User not authenticated" }, { status: 401 });
    }

    const { data, error } = await supabase.rpc("get_unique_members");


    if (error) {
      throw error;
    }

    return NextResponse.json({ data });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  
}