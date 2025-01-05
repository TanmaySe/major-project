import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { currentUser } from '@clerk/nextjs/server';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_KEY);
const GMAIL_USER = process.env.GMAIL_USER
const GMAIL_PASSWORD = process.env.GMAIL_PASSWORD
const smtpTransporter = nodemailer.createTransport({
  service: 'gmail', // Use your email provider or SMTP settings
  auth: {
    user: GMAIL_USER,
    pass: GMAIL_PASSWORD,
  },
});

export async function POST(request, { params }) {
  const { id } = await params; // Assuming proj_id matches the table's column name
  const user = await currentUser();
  if (!user) {
    return NextResponse.json({ error: "User not authenticated" }, { status: 401 });
  }

  const { invited } = await request.json();
  if (!Array.isArray(invited)) {
    return NextResponse.json({ error: "Invalid invitee list" }, { status: 400 });
  }

  try {
    const inviteEntries = await Promise.all(
      invited.map(async email => {
        return {
          proj_id:id,
          email,
          status: 'pending', // Default status
        };
      })
    );

    // Insert rows into the invites table
    const { data, error } = await supabase.from('invites').insert(inviteEntries).select();
    console.log("data : ",data)
    if (error) {
      throw new Error(error);
    }

    // Send invitation emails
    await Promise.all(
      invited.map(async email => {
        const token = data.find(invite => invite.email === email).invite_id;
        await smtpTransporter.sendMail({
          from: GMAIL_USER,
          to: email,
          subject: `You are invited to project ${id}`,
          text: `You have been invited to join the project. Use the following link to accept the invitation: 
          http://localhost:3000/invite?token=${token}`,
        });
      })
    );

    return NextResponse.json({ message: "Invites sent successfully" });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET(request, { params }) {
  try{
  const user = await currentUser()
  const { id } = await params;
  if(!user) {
    return NextResponse.json({error:"User not authenticated"},{status:401})
  }
  if(!id) {
    return NextResponse.json({error:"Could not validate invitation"},{status:500})
  }
  const { data, error } = await supabase.from('invites').select("*").eq('invite_id',id)
  console.log(data)
  if(error) {
    return NextResponse.json({error:"Cannot validate invitation"},{status:500})
  }
  if(data.length === 0) {
    return NextResponse.json({error:"Invalid invitation"},{status:400})
  }
  if(data[0]?.email != user?.emailAddresses[0]?.emailAddress) {
    return NextResponse.json({error:"You are not authorized to accept invitation"},{status:400})
  }
  return NextResponse.json({data},{status:200})
}catch(error) {
  return NextResponse.json({error:error.message},{status:500})
}

}

export async function PATCH(request,{ params }) {
  try{
    console.log("99")
  const user = await currentUser()
  const { id } = await params
  const body = await request.json()
  const { firstName } = body
  if(!user) {
    console.log("105")
    return NextResponse.json({error:"User not autenticated"},{status:401})
  }
  const { data, error } = await supabase.from("invites").select("*").eq('invite_id',id)
  console.log("109")
  if(error) {
    console.log("111")
    return NextResponse.json({error:error.message},{status:500})
  }
  if(data.length === 0) {
    return NextResponse.json({error:"Invalid invitation"},{status:400})
  }

  let { data:d, error:e } = await supabase
  .rpc('handle_invitation', {
    m_email:data[0].email, 
    m_name:firstName, 
    m_role:"member", 
    p_invite_id:id, 
    proj_id:data[0].proj_id
  })
  
  if(e) {
    console.log("error from supabase : ",e)
    return NextResponse.json({error:"Issue in procedure execution"},{status:500})
  }
  return NextResponse.json({data:data[0].proj_id},{status:200})
}catch(error) {
  return NextResponse.json({error:error.message},{status:500})
}
  

}
