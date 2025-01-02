'use client';
import * as Collapsible from '@radix-ui/react-collapsible';
import { Button } from "@/components/ui/button";
import { CalendarDays, Folder, LayoutList, NotebookPen, ShieldQuestion, User, UsersRound } from "lucide-react";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';

const ProjectPage = () => {
  const { projectId } = useParams();
  const [projectName, setProjectName] = useState('');
  const [loading, setLoading] = useState(true);
  
  // Tasks data
  const tasks = [
    {
      task: "Create Wireframes",
      description: "Design the initial wireframes for the new feature",
      assigned: "John Doe",
      deadline: "2025-01-10",
      priority: "High",
    },
    {
      task: "Database Optimization",
      description: "Optimize the database queries to improve performance",
      assigned: "Jane Smith",
      deadline: "2025-01-15",
      priority: "Medium",
    },
    {
      task: "Write Test Cases",
      description: "Create detailed test cases for the user authentication module",
      assigned: "Alex Johnson",
      deadline: "2025-01-12",
      priority: "High",
    },
    {
      task: "Update Documentation",
      description: "Revise and update project documentation for the API endpoints",
      assigned: "Emily Davis",
      deadline: "2025-01-20",
      priority: "Low",
    },
    {
      task: "UI Bug Fixes",
      description: "Fix layout and responsiveness issues in the dashboard UI",
      assigned: "Michael Brown",
      deadline: "2025-01-08",
      priority: "High",
    },
    {
      task: "Prepare Presentation",
      description: "Create a slide deck for the upcoming stakeholder meeting",
      assigned: "Sophia Wilson",
      deadline: "2025-01-18",
      priority: "Medium",
    },
    {
      task: "Code Review",
      description: "Review the new code pushed by the team and suggest improvements",
      assigned: "Chris Taylor",
      deadline: "2025-01-14",
      priority: "Low",
    },
  ];

  useEffect(() => {
    const fetchProjectName = async () => {
      try {
        console.log(projectId);
        const response = await fetch(`/api/projects/${projectId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch project');
        }
        const data = await response.json();
        // console.log(data);
        setProjectName(data.data.name);
      } catch (error) {
        console.error('Error fetching project name:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProjectName();
  }, [projectId]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <div className="flex flex-row p-3 justify-between">
        <div className="text-xl flex flex-row">
          <Folder size={24} /> {projectName}
        </div>
        <div className="flex flex-row gap-4 justify-evenly">
          <Button variant="outline">Ask AI</Button>
          <Button variant="outline">
            <User size={32} color="black" /> Invite
          </Button>
        </div>
      </div>

      {/* Collapsible Section for To-do */}
      <div className="mr-3">
        <Collapsible.Root>
          <Collapsible.Trigger className="bg-gray-100 mr-3 ml-3 p-2 rounded-md mb-3 text-muted-foreground cursor-pointer w-full text-left">
            To-do
          </Collapsible.Trigger>
          <Collapsible.Content>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead><LayoutList /> Task</TableHead>
                  <TableHead><NotebookPen /> Description</TableHead>
                  <TableHead><UsersRound /> Assigned</TableHead>
                  <TableHead><CalendarDays /> Deadline</TableHead>
                  <TableHead><ShieldQuestion /> Priority</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tasks.map((task, index) => (
                  <TableRow key={index}>
                    <TableCell>{task.task}</TableCell>
                    <TableCell>{task.description}</TableCell>
                    <TableCell>{task.assigned}</TableCell>
                    <TableCell>{task.deadline}</TableCell>
                    <TableCell>{task.priority}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Collapsible.Content>
        </Collapsible.Root>
      </div>

      {/* Collapsible Section for In Progress */}
      <div className="mr-3">
        <Collapsible.Root>
          <Collapsible.Trigger className="bg-gray-100 mr-3 ml-3 p-2 rounded-md mb-3 text-muted-foreground cursor-pointer w-full text-left">
            In Progress
          </Collapsible.Trigger>
          <Collapsible.Content className="bg-gray-200 ml-3 p-2 rounded-md mb-3 text-muted-foreground">
            <p>In progress task 1</p>
            <p>In progress task 2</p>
          </Collapsible.Content>
        </Collapsible.Root>
      </div>

      {/* Collapsible Section for Done */}
      <div className="mr-3">
        <Collapsible.Root>
          <Collapsible.Trigger className="bg-gray-100 ml-3 mr-3 p-2 rounded-md mb-3 text-muted-foreground cursor-pointer w-full text-left">
            Done
          </Collapsible.Trigger>
          <Collapsible.Content className="bg-gray-200 ml-3 p-2 rounded-md mb-3 text-muted-foreground">
            <p>Done task 1</p>
            <p>Done task 2</p>
          </Collapsible.Content>
        </Collapsible.Root>
      </div>
    </>
  );
};

export default ProjectPage;
