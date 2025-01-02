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
import { Toaster, toast } from "react-hot-toast"; 

const ProjectPage = () => {
  const { projectId } = useParams();
  const [projectName, setProjectName] = useState('');
  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState([
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
  ]);
  const [showModal, setShowModal] = useState(false);
  const [newTask, setNewTask] = useState({
    task: '',
    description: '',
    assigned: '',
    deadline: '',
    priority: '',
  });
  const [members, setMembers] = useState([]);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const fetchProjectName = async () => {
      try {
        const response = await fetch(`/api/projects/${projectId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch project');
        }
        const data = await response.json();
        setProjectName(data.data.name);
      } catch (error) {
        console.error('Error fetching project name:', error);
      } finally {
        setLoading(false);
      }
    };

    const fetchMembers = async () => {
      try {
        const response = await fetch(`/api/projects/${projectId}/members`);
        if (!response.ok) {
          throw new Error('Failed to fetch members');
        }
        const data = await response.json();
        console.log(data);
        setMembers(data.data);
      } catch (error) {
        console.error('Error fetching members:', error);
      }
    };

    fetchProjectName();
    fetchMembers();
  }, [projectId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewTask((prev) => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!newTask.task) newErrors.task = 'Task name is required';
    if (!newTask.description) newErrors.description = 'Description is required';
    if (!newTask.assigned) newErrors.assigned = 'Assigned person is required';
    if (!newTask.deadline) newErrors.deadline = 'Deadline is required';
    if (!newTask.priority) newErrors.priority = 'Priority is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddTask = async () => {
    if (!validateForm()) return;

    try {
      const response = await fetch(`/api/projects/${projectId}/task`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newTask),
      });

      if (!response.ok) {
        throw new Error('Failed to create task');
      }

    //   const data = await response.json();
    //   console.log(data);
    //   setTasks((prevTasks) => [...prevTasks, data.task]);
      setShowModal(false);
      toast.success("Task created successfully!", { position: "top-center" });
      setNewTask({
        task: '',
        description: '',
        assigned: '',
        deadline: '',
        priority: '',
      });
    } catch (error) {
      console.error('Error adding task:', error);
    }
  };

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
          <Button variant="outline" onClick={() => setShowModal(true)}>
            Add Task
          </Button>
        </div>
      </div>

      {/* Add Task Modal */}
      {showModal && (
        <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-md w-1/3">
            <h2 className="text-lg font-semibold mb-4">Add New Task</h2>
            <form onSubmit={(e) => e.preventDefault()}>
              <div className="mb-4">
                <label className="block">Task</label>
                <input
                  type="text"
                  name="task"
                  value={newTask.task}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded"
                />
                {errors.task && <span className="text-red-500 text-sm">{errors.task}</span>}
              </div>
              <div className="mb-4">
                <label className="block">Description</label>
                <input
                  type="text"
                  name="description"
                  value={newTask.description}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded"
                />
                {errors.description && <span className="text-red-500 text-sm">{errors.description}</span>}
              </div>
              <div className="mb-4">
                <label className="block">Assigned</label>
                <select
                  name="assigned"
                  value={newTask.assigned}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded"
                >
                  <option value="">Select Member</option>
                  {members.map((member) => (
                    <option key={member.id} value={member.name}>
                      {member.name}
                    </option>
                  ))}
                </select>
                {errors.assigned && <span className="text-red-500 text-sm">{errors.assigned}</span>}
              </div>
              <div className="mb-4">
                <label className="block">Deadline</label>
                <input
                  type="date"
                  name="deadline"
                  value={newTask.deadline}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded"
                />
                {errors.deadline && <span className="text-red-500 text-sm">{errors.deadline}</span>}
              </div>
              <div className="mb-4">
                <label className="block">Priority</label>
                <select
                  name="priority"
                  value={newTask.priority}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded"
                >
                  <option value="">Select Priority</option>
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
                {errors.priority && <span className="text-red-500 text-sm">{errors.priority}</span>}
              </div>
              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setShowModal(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddTask}>Add Task</Button>
              </div>
            </form>
          </div>
        </div>
      )}

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
