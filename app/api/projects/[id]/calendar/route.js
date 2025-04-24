import { currentUser } from '@clerk/nextjs/server'
import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_KEY);

export async function POST (request,{params}) {
  try{
  const {id} = await params
  const { event } = await request.json()
  console.log("Event : ",event)
  const user = await currentUser()
  if(!user) {
    return NextResponse.json({error:"User not authenticated"},{status:401})
  }
    const email = user?.emailAddresses[0]?.emailAddress
  const { data:supabaseData, error:supabaseError } = await supabase.from("tokens").select("*").eq("email",email)
  if(supabaseError) {
    return NextResponse.json({error:"Error in supabase"},{status:500})
  }
  if(supabaseData.length === 0) {
    return NextResponse.json({error:"No token"},{status:401})
  }
  const res = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/primary/events?key=${process.env.GOOGLE_CLOUD_API_KEY}`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${supabaseData[0]?.access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(event),
    }
  )
  const data = await res.json()
  console.log("Data from API : ",data)
  if(!res.ok) {
    console.log("Error : ",data)
    return NextResponse.json({ error: data?.error?.message || 'Google API error' }, { status: 500 })
  }
  return NextResponse.json({ event: data }, { status: 200 })
  }catch(err) {
  console.log("43",err)
    return NextResponse.json({error:'Internal server error'},{status:500})
  }

}