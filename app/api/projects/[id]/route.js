import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { currentUser } from "@clerk/nextjs/server";

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_KEY);

export async function GET(request, { params }) {
  try {
    const user = await currentUser();

    if (!user) {
      return NextResponse.json({ error: "User not authenticated" }, { status: 401 });
    }

    const { id } = await params; // Get project ID from params
    const userEmail = user.emailAddresses[0].emailAddress; // Current user's email

    // Fetch members of the project
    const { data: membersData, error: membersError } = await supabase
      .from("members")
      .select("id,name,email")
      .eq("proj_id", id);

    if (membersError) {
      throw membersError;
    }

    // Check if current user's email exists in the members' list
    const isMember = membersData.some((member) => member.email === userEmail);

    if (!isMember) {
      return NextResponse.json({ error: "Not authorized" }, { status: 403 });
    }

    // Fetch project details if the user is authorized
    const { data: projectData, error: projectError } = await supabase
      .from("project")
      .select(`
        id,
        name,
        desc
      `)
      .eq("id", id)
      .single();

    if (projectError) {
      if (projectError.code === "PGRST116") {
        return NextResponse.json({ error: "Project not found" }, { status: 404 });
      }
    }

    return NextResponse.json({ projectData: projectData,membersData:membersData });
  } catch (error) {
    console.error("Error fetching project or authorization:", error.message);
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 });
  }
}
