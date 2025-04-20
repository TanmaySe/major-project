import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { currentUser } from '@clerk/nextjs/server'

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_KEY);

export async function GET(request,{params}) {
  try {
    console.log("Reached here")
    const user = await currentUser();
    if (!user) {
        return NextResponse.json({ error: "User not authenticated" }, { status: 401 });
      }
    const { task_id } = await params;
    console.log(task_id)
    const { data, error } = await supabase
      .from('comments')
      .select('*')
      .eq('task_id', task_id)
      .order('created_at', { ascending: true })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    console.log("Data from comments : ",data)
    return NextResponse.json(data)
  }
  catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request,{params}) {
  try{
    const { taskId, content, parentCommentId } = await request.json();
    const user = await currentUser();
    if (!user) {
        return NextResponse.json({ error: "User not authenticated" }, { status: 401 });
      }
    const { data, error } = await supabase
    .from('comments')
    .insert([
      {
        content,
        task_id:taskId,
        user_id:user?.id,
        user_name:user?.firstName,
        user_image:user?.imageUrl,
        user_email:user?.emailAddresses[0]?.emailAddress,
        parent_comment_id:parentCommentId
      }
    ])
    if(!error){
    return NextResponse.json({data:"Successfully created comment"},{status:200})
    }
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  catch(error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
