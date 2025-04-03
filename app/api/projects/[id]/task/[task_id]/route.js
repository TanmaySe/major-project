import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { currentUser } from '@clerk/nextjs/server'

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_KEY);

export async function PATCH(request,{params}) {
  try {
    console.log("Here updtate task")
    const { task, description, assigned, deadline, priority,category } = await request.json();
    const user = await currentUser();
    if (!user) {
        return NextResponse.json({ error: "User not authenticated" }, { status: 401 });
      }
    // console.log("User : ",user)
    const { task_id } = await params; 
    if (!task) {
        return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
      }
      console.log(task,description,assigned,deadline,priority,category );

      const { data, error } = await supabase
      .from('tasks')
      .update({
        task: task,        
        desc: description || null, 
        deadline: deadline || null,
        priority: priority || null,
        assigned: Array.isArray(assigned) && assigned.length === 0 ? null : assigned, 
        category: category || "todo"
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

export async function DELETE(request,{params}) {
  try {
    const user = await currentUser();
    if (!user) {
        return NextResponse.json({ error: "User not authenticated" }, { status: 401 });
      }
    // console.log("User : ",user)
    const { task_id } = await params; 
      console.log(task_id);
      const { count, error: countError } = await supabase
        .from('tasks')
        .select('id', { count: 'exact' })
        .eq('id', task_id)
        .eq('created_by', user?.emailAddresses[0]?.emailAddress);
      console.log(count);
      if (countError|| count!=1) {        
        return NextResponse.json({error: "Unauthorized" },{status:400});
      }

      const { data, error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', task_id)
      .eq('created_by', user?.emailAddresses[0]?.emailAddress);
      console.log("data",data);
          
    if (error) {
      throw error
    }

    return NextResponse.json({ data, message: "Project deleted successfully" });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}