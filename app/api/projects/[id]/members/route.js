import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { currentUser } from '@clerk/nextjs/server';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_KEY);

export async function GET(request,{params}) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: "User not authenticated" }, { status: 401 });
    }
    const { id } = await params; 
    console.log(id," here in api")

    const { data, error } = await supabase
      .from('members')
      .select('id,name')
      .eq('proj_id', id);
      console.log(data," here in api")
    if (error) {
      console.error("Error fetching members:", error);
    } else {
      console.log("Members:", data);
    }

    return NextResponse.json({ data });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
