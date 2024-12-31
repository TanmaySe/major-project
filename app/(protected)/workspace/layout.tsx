"use client";

import { useConvexAuth } from "convex/react";
import { redirect } from "next/navigation";
import Sidebar from "./_components/Sidebar";

const WorkspaceLayout = ({
    children
}:{
    children:React.ReactNode;
}) => {
    const {isAuthenticated,isLoading} = useConvexAuth()
    if(isLoading){
        return (
            <div className="h-full flex items-center justify-center">
                Loading this page for you...
            </div>
        );
    }
    if(!isAuthenticated){
        return redirect("/");
    }
    return (
        <div className="h-full flex">
            <Sidebar/>
            <main className="h-full flex-1 overflow-y-auto">
            {children}
            </main>
        </div>
    );
}
export default WorkspaceLayout