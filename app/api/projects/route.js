import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { currentUser } from '@clerk/nextjs/server'

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_KEY);

export async function POST(request) {
  try {
    const body = await request.json();
    const { project_name,project_desc } = body;
    const user = await currentUser()
    // console.log("User : ",user)

    // Insert project into the database
    const { data, error } = await supabase.rpc('create_project_with_member', {
        created_by : user?.emailAddresses[0].emailAddress,
        member_email : user?.emailAddresses[0].emailAddress,
        member_name : user?.firstName,
        member_role:"owner",
        project_desc:project_desc,
        project_name:project_name
    })
    if (error) {
      throw error
    }

    return NextResponse.json({ data, message: "Project created successfully" });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}