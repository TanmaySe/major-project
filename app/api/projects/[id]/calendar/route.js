import { NextResponse } from "next/server"

export async function POST (request,{params}) {
  try{
  const {id} = await params
  const { token } = await request.json()
  
  const event = {
    summary: 'Do major project',
    description: 'Discuss cool projects and AI ideas.',
    start: {
      dateTime: '2025-04-23T10:00:00+05:30', // ISO format with timezone
      timeZone: 'Asia/Kolkata',
    },
    end: {
      dateTime: '2025-04-23T11:00:00+05:30',
      timeZone: 'Asia/Kolkata',
    },
    attendees: [
      { email: 'semwaltanmay88@gmail.com' },
      { email: 'tsemwal29@gmail.com' },
    ],
    reminders: {
      useDefault: false,
      overrides: [
        { method: 'popup', minutes: 10 },
      ],
    },
  }
    // Add this at the top of your backend file
//     const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token'
//     const tokenRes = await fetch(GOOGLE_TOKEN_URL, {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
//       body: new URLSearchParams({
//         code:decodeURIComponent(token)
// ,
//         client_id: process.env.NEXT_PUBLIC_GOOGLE_OAUTH_CLIENT_ID,
//         client_secret: '',
//         redirect_uri: 'https://222dd688-5f37-4540-b3ef-9d1f88adfa81-00-7v1xrx9ksb3d.sisko.replit.dev/auth/callback', // must match your OAuth settings
//         grant_type: 'authorization_code',
//       }),
//     })

    const tokenData = await tokenRes.json()

    if (!tokenRes.ok) {
      console.error('Token Exchange Failed:', tokenData)
      return NextResponse.json({ error: 'Failed to get access token' }, { status: 401 })
    }

    const accessToken = tokenData.access_token
    console.log("access_Token : ",accessToken)

  const res = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/primary/events?key=${process.env.GOOGLE_CLOUD_API_KEY}`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(event),
    }
  )
  const data = await res.json()
  console.log("Data from API : ",data)
  if(!res.ok) {
    console.log("Error : ",data)
    return NextResponse.json({ error: data?.error || 'Google API error' }, { status: 500 })
  }
  return NextResponse.json({ event: data }, { status: 200 })
  }catch(err) {
    return NextResponse.json({error:data?.error || 'Internal server error'})
  }

}