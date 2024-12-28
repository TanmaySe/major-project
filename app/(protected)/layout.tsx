"use client";

import { useConvexAuth } from "convex/react";
import { redirect } from "next/navigation";
const MainLayout = ({
    children
}:{
    children:React.ReactNode;
}) => {
    const {isAuthenticated,isLoading} = useConvexAuth()
    if(isLoading){
        return (
            <div className="h-full flex items-center justify-center">
                Loading page for you...
            </div>
        );
    }
    if(!isAuthenticated){
        return redirect("/");
    }
    return (
        <div className="h-full flex">
            <main className="h-full flex-1 overflow-y-auto">
            {children}
            </main>
            
        </div>
    );
}
export default MainLayout