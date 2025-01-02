import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { currentUser } from '@clerk/nextjs/server';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_KEY);

export async function POST(request,{params}) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: "User not authenticated" }, { status: 401 });
    }
    console.log("here")
    const { task, description, assigned, deadline, priority } = await request.json();

    // Validate the required fields
    const { id } = await params; 
    if (!task || !description || !assigned || !deadline || !priority  ) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Insert task into the 'task' table in Supabase
    const { data, error } = await supabase
      .from('tasks')
      .insert([
        {
          task: task,        // 'task' corresponds to 'name'
          desc: description, // 'description' corresponds to 'desc'
          deadline,
          priority,
          proj_id:id,
          created_at: new Date(), // Optional: automatically use the current timestamp
        }
      ]);

    // Handle any error from Supabase
    if (error) {
      throw error;
    }

    return NextResponse.json({ data });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
export async function GET(request,{params}) {
  try{
  const { id } = await params;
  const user = await currentUser();
  if(!user) {
    return NextResponse.json({error: "User not authenticated"},{status: 401})
  }
  const { data, error } = await supabase.from('tasks').select("*").eq("proj_id",id);
  if(error) {
    console.log(error);
    return NextResponse.json({error:error.message},{status:500})
  }
  return NextResponse.json({data});
  } catch(error) {
    return NextResponse.json({error:error.message},{status:500})
  }
}
