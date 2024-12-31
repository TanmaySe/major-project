import { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { SignOutButton, useUser,UserButton } from "@clerk/clerk-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ChevronsLeftRight, PlusCircle, Folder, Trash, Star, MoreHorizontal } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const Sidebar = () => {
    const { user } = useUser()
    const sidebarRef = useRef<HTMLElement>(null);
    return (
        <aside ref={sidebarRef} className={
            cn("group/sidebar h-full overflow-y-auto relative flex w-60 flex-col z-[9999]",
            )
        }>
        <DropdownMenu>
        <DropdownMenuTrigger asChild>
            <div role="button" className="flex items-center text-sm p-3 w-full hover:bg-primary/5 ">
                <div className="gap-x-2 flex items-center max-w-[150px]">
                    <Avatar className="h-5 w-5">
                        <AvatarImage src={user?.imageUrl}/>
                    </Avatar>
                    <span className="text-start font-medium line-clamp-1"> 
                        {user?.fullName}
                    </span>
                </div>
                <ChevronsLeftRight className="rotate-90 ml-2 text-muted-foreground h-4 w-4"/>
            </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent
        className="w-80 z-[99999]"
        align="start"
        alignOffset={11}
        forceMount
        >
            <div className="flex flex-col space-y-4 p-2">
                <p className="text-xs font-medium leading-none text-muted-foreground">
                    {user?.emailAddresses[0].emailAddress}
                </p>
                <div className="flex items-center gap-x-2">
                    <div className="rounded-d bg-secondary p-1">
                        <Avatar className="h-8 w-8">
                            <AvatarImage src={user?.imageUrl}/>
                        </Avatar>
                    </div>
                    <div className="space-y-1">
                        <p className="text-sm line-clamp-1">
                            {user?.fullName}
                        </p>
                    </div>
                   
                </div>
            </div>
            <DropdownMenuSeparator/>
            <DropdownMenuItem asChild className="w-full cursor-pointer text-muted-foreground">
                <SignOutButton>
                    Logout
                </SignOutButton>
            </DropdownMenuItem>
        </DropdownMenuContent>
        </DropdownMenu>

        <Button className="ml-2 max-w-56 mt-4">
            New Project <PlusCircle className="h-4 mr-2 w-4"/>
        </Button>

        <div className="flex flex-row ml-2 mt-4">
            <Input placeholder="Search..." className="max-w-56 h-8"/>
        </div>

        <div className="flex flex-col mt-4">
            {[
            "Bitfluencer",
            "Discord bot",
            "Slack bot",
            "Whatsapp bot",
            "Launch campaign",
        ].map((item, index) => (
            <div key={index} className="flex hover:rounded-md mr-2 items-center ml-2 mb-2 hover:bg-gray-200 cursor-pointer p-2">
            {/* Folder Icon */}
            <Folder className="w-5 h-5 mr-2" fill="#2563eb"/>
            {/* Text */}
            <p className="text-sm">{item}</p>
            <DropdownMenu>
                            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                <div role="button" className="h-full ml-auto rounded-sm hover:bg-neutral-300">
                                    <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                                </div>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-60" align="start" side="right" forceMount>
                                <DropdownMenuItem>
                                    <Trash className="h-4 w-4 mr-2" />
                                    Delete project
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem>
                                    <Star className="h-4 w-4 mr-2" />
                                    Star this project
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
            </div>
        ))}

        </div>


            
        </aside>
    );
};

export default Sidebar;
