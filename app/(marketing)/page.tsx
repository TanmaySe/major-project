"use client";

import {useConvexAuth} from "convex/react"
import { SignInButton , UserButton} from "@clerk/clerk-react";
import { Button } from "@/components/ui/button";
import Link from "next/link"
const Marketing = () => {
    const {isAuthenticated,isLoading} = useConvexAuth()
    return(
            <div>
                {!isAuthenticated && !isLoading && (
                    <>
                        <SignInButton mode="modal">
                            <Button variant="ghost" size="sm">
                                Log in
                            </Button>
                        </SignInButton>
             
                    </>
                )}
                {isAuthenticated && !isLoading && (
                    <>
                        <Button variant="ghost" size="sm" asChild>
                            <Link href="/protected">
                                Enter Protected page
                            </Link>
                        </Button>
                    </>
                )}
            </div>
    )
}
export default Marketing;