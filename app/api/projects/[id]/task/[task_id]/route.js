import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { currentUser } from '@clerk/nextjs/server'

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_KEY);

export async function PATCH(request,{params}) {
  try {
    const { task, description, assigned, deadline, priority } = await request.json();
    const user = await currentUser();
    if (!user) {
        return NextResponse.json({ error: "User not authenticated" }, { status: 401 });
      }
    // console.log("User : ",user)
    const { task_id } = await params; 
    if (!task || !description || !assigned || !deadline || !priority  ) {
        return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
      }
      console.log(task,description,assigned,deadline,priority );

      const { data, error } = await supabase
      .from('tasks')
      .update({
        task: task,        
        desc: description, 
        deadline,
        priority,
        assigned: assigned, 
      })
      .eq('id', task_id);
    
          
    if (error) {
      throw error
    }

    return NextResponse.json({ data, message: "Project created successfully" });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}