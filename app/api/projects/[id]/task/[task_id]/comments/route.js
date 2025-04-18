import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { currentUser } from '@clerk/nextjs/server';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_KEY);

export async function GET(request, { params }) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: "User not authenticated" }, { status: 401 });
    }

    const { task_id } = await params;
    const { data: comments, error } = await supabase
      .from('comments')
      .select(`
        id,
        content,
        created_at,
        user_id,
        user_name,
        user_image,
        task_id
      `)
      .eq('task_id', task_id)
      .order('created_at', { ascending: true });

    if (error) throw error;

    return NextResponse.json({ comments });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request, { params }) {
  try {
    const { content } = await request.json();
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: "User not authenticated" }, { status: 401 });
    }

    const { task_id } = params;

    const { data, error } = await supabase
      .from('comments')
      .insert({
        content,
        task_id,
        user_id: user.id,
        user_name: user.firstName + ' ' + user.lastName,
        user_image: user.imageUrl
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ comment: data });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
