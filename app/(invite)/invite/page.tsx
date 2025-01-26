'use client';

import { useRouter } from "next/router";
import { SignIn, useUser } from "@clerk/clerk-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";

interface InviteData {
    invite_id: string;
    proj_id: string | null;
    email: string;
    status: string | null;
    created_at: string;
}

const InvitePage = () => {
    const router = useRouter();
    const { query } = router; // Use query from useRouter instead of useSearchParams
    const token = query.token as string; // Get token from query parameters
    const { user } = useUser();
    const [data, setData] = useState<InviteData | null>(null);
    const [error, setError] = useState<string | null>(null);

    // Ensure the fetch only happens on the client side after component mount
    useEffect(() => {
        if (user && token) {
            const validateInvite = async () => {
                try {
                    const response = await fetch(`/api/projects/${token}/invites`);
                    const data = await response.json();
                    if (!response.ok) {
                        setError(data.error);
                        setData(null);
                    } else {
                        setData(data);
                        setError(null);
                    }
                } catch (error) {
                    console.error("Error validating invite:", error);
                    setError("Error fetching invite data.");
                }
            };
            validateInvite();
        }
    }, [token, user]);

    const handleAccept = async () => {
        try {
            const response = await fetch(`/api/projects/${token}/invites`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ firstName: user?.firstName })
            });
            const data = await response.json();
            if (!response.ok) {
                toast.error(data.error, { position: 'top-center' });
                return;
            }
            router.push(`/workspace/${data?.data}`);
        } catch (error) {
            console.log(error);
            toast.error('Error accepting invite', { position: 'top-center' });
        }
    };

    if (!token) {
        return (
            <div className="flex items-center justify-center h-screen">
                <p>Something went wrong</p>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="flex items-center justify-center h-screen">
                <SignIn fallbackRedirectUrl={`/invite?token=${token}`} signUpFallbackRedirectUrl={`/invite?token=${token}`} />
            </div>
        );
    }

    return (
        <div className="flex items-center justify-center h-screen">
            {error && (
                <div className="bg-red-100 text-red-800 px-4 py-3 rounded-lg">
                    <p>{error}</p>
                </div>
            )}
            {data && (
                <div className="bg-white p-6 rounded-lg shadow-lg w-96">
                    <h2 className="text-2xl font-semibold text-center text-gray-700 mb-4">
                        Invite Details
                    </h2>
                    <div className="text-gray-600 space-y-2">
                        <p><strong>You are invited for :</strong> {data?.proj_id}</p>
                    </div>
                    <div className="flex justify-between mt-6">
                        <Button variant="accept" onClick={handleAccept}>
                            Accept
                        </Button>
                        <Button variant="reject">
                            Reject
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default InvitePage;
