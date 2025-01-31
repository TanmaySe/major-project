import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { currentUser } from '@clerk/nextjs/server';
import crypto from 'crypto'; 

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_KEY);


export async function GET(request, { params }) {
    try {
      const user = await currentUser();
      if (!user) {
        return NextResponse.json({ error: "User not authenticated" }, { status: 401 });
      }
      
      const sender_id = crypto.createHash('sha256').update(user?.emailAddresses[0]?.emailAddress).digest('hex');
      const { member_id } = await params;
      const receiver_id = member_id;
      console.log('here',receiver_id);
  
      // Query for messages where sender is the current user and receiver is the member
      const { data: sentMessages, error: sentMessagesError } = await supabase
  .from("messages")
  .select("*")
  .or(`sender_id.eq.${sender_id},member_id.eq.${receiver_id}`)
  .order("created_at", { ascending: true });

const { data: receivedMessages, error: receivedMessagesError } = await supabase
  .from("messages")
  .select("*")
  .or(`sender_id.eq.${receiver_id},member_id.eq.${sender_id}`)
  .order("created_at", { ascending: true });

  
      if (sentMessagesError || receivedMessagesError) {
        throw new Error(sentMessagesError?.message || receivedMessagesError?.message);
      }
      const allMessages = [...sentMessages, ...receivedMessages].sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
      console.log("messg",allMessages);
  
      return NextResponse.json({ data: allMessages });
    } catch (error) {
        console.log(error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }
