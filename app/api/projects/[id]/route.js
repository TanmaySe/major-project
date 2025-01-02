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
    const { id } = await params; 
    const { data, error } = await supabase
      .from("project")
      .select(`
        id, 
        name, 
        desc 
      `)
      .eq("id", id)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        // Handle case where no project is found
        return NextResponse.json({ error: "Project not found" }, { status: 404 });
      }
      throw error;
    }
    console.log(data);

    return NextResponse.json({ data });
  } catch (error) {
    console.error("Error fetching project by ID:", error.message);
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 });
  }
}
