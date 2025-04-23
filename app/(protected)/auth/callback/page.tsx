'use client'
import { useSearchParams } from 'next/navigation'
import { useEffect } from 'react'
export default function AuthCallback() {
  const searchParams = useSearchParams()
  const getAccessToken = async({projectId,code}) => {
    const response = await fetch(`/api/projects/${projectId}/calendar/validate`,{
      method:'PUT',
      headers:{
        "Content-Type":"application/json"
      },
      body: JSON.stringify({code})
    })
    const data = await response.json()
    if(!response.ok) {
      console.log(data.error)
      return
    }    
    console.log("success : ",data.data)
  }
  useEffect(() => {
    const code = searchParams.get('code')
    const state = searchParams.get('state')
    if (code && state) {
      const { projectId } = JSON.parse(decodeURIComponent(state))
      console.log('Code:', code)
      console.log('Project ID:', projectId)
      getAccessToken({projectId, code})
      
      // Now exchange code and redirect to `/workspace/${workspaceId}`
      window.location.href = `https://222dd688-5f37-4540-b3ef-9d1f88adfa81-00-7v1xrx9ksb3d.sisko.replit.dev/workspace/${projectId}?code=${code}`
    }
  }, [searchParams])
}