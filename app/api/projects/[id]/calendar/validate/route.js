import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js";
import { currentUser } from '@clerk/nextjs/server'

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_KEY);

export async function POST (request,{params}) {
  try{
    const user = await currentUser()
    if(!user) {
      return NextResponse.json({error:"User not authenticated"},{status:401})
    }
    const email = user?.emailAddresses[0]?.emailAddress;
    const { data, error } = await supabase
    .from("tokens")
    .select(`
      id, 
      email, 
      access_token,
    `)
    .eq("email", email);
    if(error) {
      return NextResponse.json({error:"Internal server error"},{status:500})
    }
    if(data.length === 0) {
      return NextResponse.json({error:"No token exists"},{status:401})
    }
    const response = await fetch(`https://www.googleapis.com/oauth2/v3/tokeninfo?access_token=${data[0]?.access_token}`)
    if(!response.ok) {
      const { data, error} = await supabase.from("tokens").delete().eq("email",email)
      return NextResponse.json({error:"Invalid token"},{status:401})
    }
    return NextResponse.json({data:"Access token is valid"},{status:200})
  }catch(error) {
    return NextResponse.json({error:"Internal server error"},{status:500})
  }
}
export async function PUT(request,{params}) {
  //Get token from code and save to database
  try{
    const { code } = await request.json()
    const user = await currentUser()
    if(!user) {
      return NextResponse.json({error:"Not authenticated user"},{status:401})
    }
    const email = user?.emailAddresses[0]?.emailAddress
    const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token'
    const tokenRes = await fetch(GOOGLE_TOKEN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code:decodeURIComponent(code),
        client_id: process.env.NEXT_PUBLIC_GOOGLE_OAUTH_CLIENT_ID,
        client_secret: process.env.GOOGLE_OAUTH_CLIENT_SECRET,
        redirect_uri: 'https://222dd688-5f37-4540-b3ef-9d1f88adfa81-00-7v1xrx9ksb3d.sisko.replit.dev/auth/callback',
        grant_type: 'authorization_code',
      }),
    })
    const tokenData = await tokenRes.json()

    if (!tokenRes.ok) {
      console.error('Token Exchange Failed:', tokenData)
      return NextResponse.json({ error: 'Failed to get access token' }, { status: 401 })
    }
    const access_token = tokenData.access_token
    const { data, error } = await supabase.from('tokens').insert([
      {
        email,
        access_token,
      },
    ]);
    if(error) {
      return NextResponse.json({error:"Error while adding token to db"},{status:500})
    }
    return NextResponse.json({data:"Successfully asked and insert token into db"},{status:200})
    
  }catch(error) {
    return NextResponse.json({error:"Internal server error"},{status:500})
  }
}