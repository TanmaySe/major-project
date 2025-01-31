'use client';
import * as React from "react";
import { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { SignOutButton, useUser } from "@clerk/clerk-react";
import { useRouter } from 'next/navigation';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronsUpDown, PlusCircle, FolderClosed, Trash2, Star, MoreHorizontal, Search, FolderPlus, MessageCircle } from "lucide-react";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Toaster, toast } from "react-hot-toast";
import Loading from "./Loading";

const Sidebar = () => {
  const router = useRouter();
  const { user } = useUser();
  const [projects, setProjects] = useState([]);
  const [isCreating, setIsCreating] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [projectName, setProjectName] = useState("");
  const [projectDesc, setProjectDesc] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const sidebarRef = useRef<HTMLElement>(null);

  // Chat members state
  const [members, setMembers] = useState([]);
  const [isLoadingMembers, setIsLoadingMembers] = useState(false);

  const fetchProjects = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/projects", {
        method: "GET",
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Failed to fetch projects");
      setProjects(result.data);
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch projects.");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMembers = async () => {
    try {
      setIsLoadingMembers(true);
      const response = await fetch("/api/chat/members");
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Failed to fetch members");
      setMembers(result.data);
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch members.");
    } finally {
      setIsLoadingMembers(false);
    }
  };

  useEffect(() => {
    fetchProjects();
    fetchMembers();
  }, []);

  const handleCreateProject = async () => {
    if (!projectName) {
      setErrorMessage("Project name is required.");
      return;
    }

    setIsCreating(true);
    setErrorMessage("");

    try {
      const response = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          project_name: projectName,
          project_desc: projectDesc.trim() === "" ? null : projectDesc,
        }),
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Failed to create project");

      toast.success("Project created successfully!");
      await fetchProjects();
      setIsDialogOpen(false);
      setProjectName("");
      setProjectDesc("");
    } catch (error) {
      console.error(error);
      toast.error("Failed to create project.");
    } finally {
      setIsCreating(false);
    }
  };

  const handleProjectClick = (id) => {
    router.push(`/workspace/${id}`);
  };

  const handleChatClick = (member) => {
    const {member_id,name} = member;
    router.push(`/workspace/chat/${member_id}?name=${name}`);
  };

  return (
    <>
      <Toaster position="top-right" reverseOrder={false} />
      
      <aside ref={sidebarRef} className="group/sidebar h-full bg-gray-50 border-r border-gray-200 overflow-y-auto relative flex w-64 flex-col z-[99999]">
        {/* User Profile Section */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div role="button" className="flex items-center text-sm p-4 w-full hover:bg-gray-100 transition-colors duration-200">
              <div className="gap-x-3 flex items-center max-w-[150px]">
                <Avatar className="border-2 border-white shadow-sm">
                  <AvatarImage src={user?.imageUrl} />
                </Avatar>
                <span className="text-start font-medium line-clamp-1 text-gray-700">{user?.fullName}</span>
              </div>
              <ChevronsUpDown className="ml-auto text-gray-400 h-4 w-4" />
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-80 z-[99999]" align="start" alignOffset={11} forceMount>
            <div className="flex flex-col space-y-4 p-3">
              <p className="text-xs font-medium leading-none text-gray-500">
                {user?.emailAddresses[0].emailAddress}
              </p>
              <div className="flex items-center gap-x-3">
                <Avatar className="border-2 border-white shadow-sm">
                  <AvatarImage src={user?.imageUrl} />
                </Avatar>
                <p className="text-sm font-medium text-gray-700">{user?.fullName}</p>
              </div>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild className="w-full cursor-pointer text-red-500 font-medium">
              <SignOutButton>Logout</SignOutButton>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* New Project Button */}
        <div className="px-3 mt-2">
          <Button 
            disabled={isCreating} 
            onClick={() => setIsDialogOpen(true)}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
          >
            <PlusCircle className="h-4 w-4 mr-2" />
            New Project
          </Button>
        </div>

        {/* Projects List */}
        {isLoading ? <Loading/> : 
        <div className="flex flex-col mt-4 px-2">
          {projects.length === 0 ? (
            <p className="text-gray-500 text-center mt-4">No projects found.</p>
          ) : (
            projects.map((project) => (
              <div 
                key={project.id} 
                onClick={() => handleProjectClick(project.id)} 
                className="flex items-center px-2 py-2 mb-1 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors duration-200"
              >
                <FolderClosed className="w-5 h-5 mr-3 text-blue-600" />
                <p className="text-sm text-gray-700 font-medium">{project.name}</p>
              </div>
            ))
          )}
        </div>
        }

        {/* Chat Members */}
        <div className="chat px-3 mt-4">
          <h2 className="text-lg font-semibold text-gray-700 mb-2">Chat</h2>
          {isLoadingMembers ? (
            <p className="text-gray-500">Loading members...</p>
          ) : members.length === 0 ? (
            <p className="text-gray-500">No members found.</p>
          ) : (
            <ul className="space-y-2">
              {members.map((member) => (
                <li 
                  key={member.member_id} 
                  onClick={() => handleChatClick(member)}
                  className="flex items-center cursor-pointer p-2 rounded-lg hover:bg-gray-100"
                >
                  <MessageCircle className="w-5 h-5 text-gray-600 mr-2" />
                  <span className="text-sm font-medium text-gray-700">{member.name}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
