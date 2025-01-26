'use client';

import { useSearchParams, useRouter } from "next/navigation";
import { SignIn, useUser } from "@clerk/clerk-react";
import { useEffect, useState, Suspense } from "react";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";

interface InviteData {
    invite_id: string;
    proj_id: string | null;
    email: string;
    status: string | null;
    created_at: string;
}

const InviteDetails = ({ token, user }: { token: string, user: any }) => {
    const [data, setData] = useState<InviteData | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const validateInvite = async () => {
            if (!user || !token) return; // Prevent running if user or token are not available
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
    }, [token, user]);

    if (error) {
        return <div className="bg-red-100 text-red-800 px-4 py-3 rounded-lg">{error}</div>;
    }

    if (!data) {
        return <div>Loading...</div>; // Or you can customize this to a loader
    }

    return (
        <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h2 className="text-2xl font-semibold text-center text-gray-700 mb-4">
                Invite Details
            </h2>
            <div className="text-gray-600 space-y-2">
                <p><strong>You are invited for :</strong> {data?.proj_id}</p>
            </div>
            <div className="flex justify-between mt-6">
                <Button variant="accept" onClick={() => handleAccept(token, user, data)}>
                    Accept
                </Button>
                <Button variant="reject">
                    Reject
                </Button>
            </div>
        </div>
    );
};

const handleAccept = async (token: string, user: any, data: InviteData) => {
    const router = useRouter()
    try {
        const response = await fetch(`/api/projects/${token}/invites`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ firstName: user?.firstName })
        });
        const responseData = await response.json();
        if (!response.ok) {
            toast.error(responseData.error, { position: 'top-center' });
            return;
        }
        router.push(`/workspace/${responseData?.data}`);
    } catch (error) {
        console.log(error);
        toast.error('Error accepting invite', { position: 'top-center' });
    }
};

const InvitePage = () => {
    const params = useSearchParams();
    const token = params.get("token");
    const { user } = useUser();
    const router = useRouter();

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
            <Suspense fallback={<div>Loading invite...</div>}>
                <InviteDetails token={token} user={user} />
            </Suspense>
        </div>
    );
};

export default InvitePage;
