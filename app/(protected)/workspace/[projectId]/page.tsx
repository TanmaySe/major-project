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
  const [detailsFetchedSuccess, setDetailsFetchedSuccess] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [newTask, setNewTask] = useState({
    task: '',
    description: '',
    assigned: [],
    deadline: '',
    priority: '',
  });
  const [members, setMembers] = useState([]);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const fetchProjectName = async () => {
      try {
        const response = await fetch(`/api/projects/${projectId}`);
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error);
        }
        setProjectName(data.projectData.name);
        setMembers(data.membersData);
        setDetailsFetchedSuccess(true);
      } catch (error) {
        toast.error(error.message, { position: 'top-center' });
      } finally {
        setLoading(false);
      }
    };

    fetchProjectName();
  }, [projectId]);

  const fetchTasks = async () => {
    try {
      const response = await fetch(`/api/projects/${projectId}/task`);
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error);
      }
      setTasks(data.data);
    } catch (error) {
      toast.error(error.message, { position: 'top-center' });
    }
  };
  useEffect(() => {
    if (detailsFetchedSuccess) {
      
      fetchTasks();
    }
  }, [detailsFetchedSuccess]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewTask((prev) => ({ ...prev, [name]: value }));
  };

  const handleAssigneeChange = (e) => {
    const selectedAssignee = e.target.value;
    if (selectedAssignee && !newTask.assigned.includes(selectedAssignee)) {
      setNewTask((prev) => ({
        ...prev,
        assigned: [...prev.assigned, selectedAssignee],
      }));
    }
  };

  const removeAssignee = (assignee) => {
    setNewTask((prev) => ({
      ...prev,
      assigned: prev.assigned.filter((a) => a !== assignee),
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!newTask.task) newErrors.task = 'Task name is required';
    if (!newTask.description) newErrors.description = 'Description is required';
    if (!newTask.assigned.length) newErrors.assigned = 'At least one assignee is required';
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

      toast.success("Task created successfully!", { position: "top-center" });
      // setTasks((prevTasks) => [...prevTasks, newTask]);
      console.log(tasks);
      setShowModal(false);
      setNewTask({
        task: '',
        description: '',
        assigned: [],
        deadline: '',
        priority: '',
      });
      fetchTasks();      
    } catch (error) {
      toast.error(error.message, { position: "top-center" });
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <>
      {detailsFetchedSuccess && (
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
      )}

      {showModal && detailsFetchedSuccess && (
        <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50 z-[999999]">
          <div className="bg-white p-6 rounded-md w-1/3 z-[999999]">
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
                  onChange={handleAssigneeChange}
                  className="w-full p-2 border border-gray-300 rounded"
                >
                  <option value="">Select Member</option>
                  {members
                    .filter((member) => !newTask.assigned.includes(member.name))
                    .map((member) => (
                      <option key={member.id} value={member.name}>
                        {member.name}
                      </option>
                    ))}
                </select>
                {errors.assigned && <span className="text-red-500 text-sm">{errors.assigned}</span>}

                <div className="flex flex-wrap gap-2 mt-2">
                  {newTask.assigned.map((assignee, index) => (
                    <div
                      key={index}
                      className="flex items-center bg-blue-500 text-white px-3 py-1 rounded-full"
                    >
                      <span>{assignee}</span>
                      <button
                        type="button"
                        onClick={() => removeAssignee(assignee)}
                        className="ml-2 text-red-500 hover:text-red-700"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
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

      {detailsFetchedSuccess && (
        <>
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
                  {tasks.filter(task => task.category === 'todo').map((task, index) => (
                    <TableRow key={index}>
                      <TableCell>{task.task}</TableCell>
                      <TableCell>{task.desc}</TableCell>
                      <TableCell>{task.assigned ? task.assigned.join(','): task.assigned}</TableCell>
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
        
      )}
      <Toaster />
    </>
  );
};

export default ProjectPage;
