'use client'
import { Suspense } from 'react';
import AuthCallback from './_components/AuthCallback'; // your actual client component

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={<p>Loading...</p>}>
      <AuthCallback />
    </Suspense>
  );
}
