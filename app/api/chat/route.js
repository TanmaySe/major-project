import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { currentUser } from '@clerk/nextjs/server';
import crypto from 'crypto'; 

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_KEY);



export async function POST(request,{params}) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: "User not authenticated" }, { status: 401 });
    }
    const body = await request.json();
    const { message,receiver } = body;
    const sender = crypto.createHash('sha256').update(user?.emailAddresses[0]?.emailAddress).digest('hex');
    console.log(message,receiver,sender);
    const { data, error } = await supabase
        .from("messages")
        .insert([
        { 
            sender_id:sender, 
            member_id: receiver, 
            text: message 
        }
        ]);

    if (error) {
        throw error;
    }

    return NextResponse.json({ data });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  
}