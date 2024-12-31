import * as React from "react";
import { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { SignOutButton, useUser } from "@clerk/clerk-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronsLeftRight, PlusCircle, Folder, Trash, Star, MoreHorizontal } from "lucide-react";
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
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Toaster, toast } from "react-hot-toast"; // Import react-hot-toast

const Sidebar = () => {
  const { user } = useUser();
  const [projects, setProjects] = useState([]);
  const [isCreating, setIsCreating] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false); // State to control dialog visibility
  const [projectName, setProjectName] = useState("");
  const [projectDesc, setProjectDesc] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const sidebarRef = useRef<HTMLElement>(null);

  const fetchProjects = async () => {
    try {
      const response = await fetch("/api/projects", {
        method: "GET",
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || "Failed to fetch projects");
      }

      setProjects(result.data); // Set the fetched projects in state
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch projects.");
    }
  };
  useEffect(() => {
        fetchProjects();
  }, []);

  const handleCreateProject = async () => {
    if (!projectName) {
      setErrorMessage("Project name is required.");
      return;
    }

    setIsCreating(true);
    setErrorMessage(""); // Clear previous error messages

    try {
      const response = await fetch("/api/projects", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          project_name: projectName,
          project_desc: projectDesc.trim() === "" ? null : projectDesc,
        }),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || "Failed to create project");
      }

      // Show success toaster
      toast.success("Project created successfully!", { position: "top-center" });
      await fetchProjects();

      setIsDialogOpen(false); // Close the dialog on success
      setProjectName(""); // Reset the form fields
      setProjectDesc("");
    } catch (error) {
      console.error(error);
      toast.error("Failed to create project."); // Show error toaster
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <>
      {/* Toaster Container */}
      <Toaster position="top-right" reverseOrder={false} />

      <aside ref={sidebarRef} className={cn("group/sidebar h-full overflow-y-auto relative flex w-60 flex-col z-[9999]")}>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div role="button" className="flex items-center text-sm p-3 w-full hover:bg-primary/5">
              <div className="gap-x-2 flex items-center max-w-[150px]">
                <Avatar>
                  <AvatarImage src={user?.imageUrl} />
                </Avatar>
                <span className="text-start font-medium line-clamp-1">{user?.fullName}</span>
              </div>
              <ChevronsLeftRight className="rotate-90 ml-2 text-muted-foreground h-4 w-4" />
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-80 z-[99999]" align="start" alignOffset={11} forceMount>
            <div className="flex flex-col space-y-4 p-2">
              <p className="text-xs font-medium leading-none text-muted-foreground">
                {user?.emailAddresses[0].emailAddress}
              </p>
              <div className="flex items-center gap-x-2">
                <Avatar>
                  <AvatarImage src={user?.imageUrl} />
                </Avatar>
                <p className="text-sm line-clamp-1">{user?.fullName}</p>
              </div>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild className="w-full cursor-pointer text-muted-foreground">
              <SignOutButton>Logout</SignOutButton>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button disabled={isCreating} className="ml-2 max-w-56 mt-4">
              New Project<PlusCircle className="h-4 mr-2 w-4" />
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px] z-[999999]">
            <DialogHeader>
              <DialogTitle>Create new project</DialogTitle>
              <DialogDescription>Entering project name is compulsory.</DialogDescription>
            </DialogHeader>
            <div className="flex flex-col gap-4 py-4">
              {/* Project Name */}
              <div className="flex flex-col gap-1">
                <label htmlFor="name" className="text-left font-medium">Project name</label>
                <Input
                  id="name"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  required
                />
              </div>
              {/* Project Description */}
              <div className="flex flex-col gap-1">
                <label htmlFor="description" className="text-left font-medium">Description</label>
                <Textarea
                  id="description"
                  value={projectDesc}
                  onChange={(e) => setProjectDesc(e.target.value)}
                  className="h-24"
                />
              </div>
              {/* Error Message */}
              {errorMessage && (
                <p className="text-red-500 text-sm">{errorMessage}</p>
              )}
            </div>
            <DialogFooter>
              <Button onClick={handleCreateProject} type="button">
              {isCreating ? "Creating..." : "Create"} 
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <div className="flex flex-row ml-2 mt-4">
          <Input placeholder="Search..." className="max-w-56 h-8" />
        </div>

        <div className="flex flex-col mt-4">
          {projects.length === 0 ? (
            <p>No projects found.</p>
          ) : (
            projects.map((project) => (
              <div key={project.id} className="flex hover:rounded-md mr-2 items-center ml-2 mb-2 hover:bg-gray-200 cursor-pointer p-2">
                <Folder className="w-5 h-5 mr-2" fill="#2563eb" />
                <p className="text-sm">{project.name}</p>
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
            ))
          )}
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
