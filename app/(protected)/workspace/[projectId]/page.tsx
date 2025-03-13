'use client';
import * as Collapsible from '@radix-ui/react-collapsible';
import { Button } from "@/components/ui/button";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import dayjs from "dayjs";
import { CalendarDays, Folder, LayoutList, NotebookPen, ShieldQuestion, User, Edit, Trash2, Plus, ChevronDown, CheckCircle,AlertTriangle } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Toaster, toast } from "react-hot-toast";
import Loading from '../_components/Loading';
import {AiPopup} from '../_components/AiPopup';
import AvatarStack from '../_components/AvatarStack';
interface Errors {
  priority?: string;
  task?: string;
  description?:string;
  assigned?:string;
  deadline?:string;
}
interface Task {
  id: number; // bigint is mapped to number in TypeScript
  created_at: string; // timestamp with time zone, which will be a string (ISO 8601 format)
  task: string; // task name (text)
  desc: string | null; // description, can be null (text)
  deadline: string | null; // deadline, can be null (date)
  priority: string | null; // priority (text)
  proj_id: string; // proj_id (uuid), typically stored as a string
  category: string; // category (character varying), default value 'todo'
  created_by: string | null; // created_by (character varying), can be null
  assigned: string[] | null; // assigned (text[]), array of strings, can be null
}



const ProjectPage = () => {
  const { projectId } = useParams();
  const [token, setToken] = useState<string | null>(null);
  const [newEmail, setNewEmail] = useState('');
  const [projectName, setProjectName] = useState('');
  const [loading, setLoading] = useState(true);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [detailsFetchedSuccess, setDetailsFetchedSuccess] = useState(false);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [invited, setInvited] = useState<string[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [newTask, setNewTask] = useState({
    task: '',
    description: '',
    assigned: [],
    deadline: '',
    priority: '',
  });
  const [members, setMembers] = useState([]);
  const [errors, setErrors] = useState<Errors>({});
  const [isEditing, setIsEditing] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [delTaskId, setDelTaskId] = useState(null);
  const [aiPopup,setAiPopup] = useState(false);
  const onOpen = () => {
    setAiPopup(true)
  };
  const onClose = () => {
    setAiPopup(false)
  }

  // Priority color mapping
  const getPriorityColor = (priority) => {
    const colors = {
      High: 'bg-red-100 text-red-800',
      Medium: 'bg-yellow-100 text-yellow-800',
      Low: 'bg-green-100 text-green-800'
    };
    return colors[priority] || 'bg-gray-100 text-gray-800';
  };

  // Open modal for editing
  const openEditModal = (task) => {
    setSelectedTask(task);
    setNewTask({
      task: task.task,
      description: task.desc,
      assigned: task.assigned || [],
      deadline: task.deadline,
      priority: task.priority,
    });
    setIsEditing(true);
    setShowModal(true);
  };

  const openDeleteModal = (task) => {
    setShowDeleteModal(true);
    setDelTaskId(task.id);
  };

  // Handle task update
  const handleUpdateTask = async () => {
    if (!validateForm()) return;

    try {
      const response = await fetch(`/api/projects/${projectId}/task/${selectedTask.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newTask),
      });

      if (!response.ok) {
        toast.error("Failed to update task", { position: 'top-center' });
        return;
      }

      toast.success("Task updated successfully!", { position: "top-center" });
      setShowModal(false);
      setNewTask({
        task: '',
        description: '',
        assigned: [],
        deadline: '',
        priority: '',
      });
      setIsEditing(false);
      setSelectedTask(null);
      fetchTasks();
    } catch (error) {
      toast.error(error, { position: "top-center" });
    }
  };

  useEffect(() => {
    const fetchProjectName = async () => {
      try {
        const response = await fetch(`/api/projects/${projectId}`);
        const data = await response.json();
        if (!response.ok) {
          toast.error(data.error, { position: 'top-center' });
          return;
        }
        setProjectName(data.projectData.name);
        setMembers(data.membersData);
        setDetailsFetchedSuccess(true);
      } catch (error) {
        toast.error(error, { position: 'top-center' });
      } finally {
        setLoading(false);
      }
    };

    fetchProjectName();
    if (typeof window !== "undefined") {
      const hash = window.location.hash; // Get the fragment part (#token=...)
      const tokenValue = new URLSearchParams(hash.replace("#", "?")).get("token");
      setToken(tokenValue);
    }
  }, [projectId]);

  useEffect(() => {
    if(token) {
      setAiPopup(true)
    }
  },[token])

  const fetchTasks = async () => {
    try {
      const response = await fetch(`/api/projects/${projectId}/task`);
      const data = await response.json();
      if (!response.ok) {
        toast.error(data.error, { position: 'top-center' });
        return;
      }
      setTasks(data.data);
    } catch (error) {
      toast.error(error, { position: 'top-center' });
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
    const newErrors:Errors = {};
    if (!newTask.task) newErrors.task = 'Task name is required';
    // if (!newTask.description) newErrors.description = 'Description is required';
    // if (!newTask.assigned.length) newErrors.assigned = 'At least one assignee is required';
    // if (!newTask.deadline) newErrors.deadline = 'Deadline is required';
    // if (!newTask.priority) newErrors.priority = 'Priority is required';
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
        toast.error("Falied to create task", { position: "top-center" });
        return;
      }

      toast.success("Task created successfully!", { position: "top-center" });
      setShowModal(false);
      setNewTask({
        task: '',
        description: '',
        assigned: [],
        deadline: '',
        priority: ''
      });
      fetchTasks();
    } catch (error) {
      toast.error(error, { position: "top-center" });
    }
  };

  const addEmail = () => {
    if (newEmail.trim() && !invited.includes(newEmail.trim())) {
      setInvited([...invited, newEmail.trim()]);
      setNewEmail('');
    }
  };

  const removeEmail = (email) => {
    setInvited(invited.filter(e => e !== email));
  };

  const handleInvite = async () => {
    try {
      const response = await fetch(`/api/projects/${projectId}/invites`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ invited: invited })
      });
      const data = await response.json();
      if (!response.ok) {
        toast.error(data.error, { position: 'top-center' });
        return;
      }
    } catch (error) {
      console.log("Error sending invites:", error);
    }
  };

  const handleDeleteTask = async () => {
    try {
      const response = await fetch(`/api/projects/${projectId}/task/${delTaskId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();
      setShowDeleteModal(false);
      setDelTaskId(null);
      if (!response.ok) {
        toast.error(data.error, { position: 'top-center' });
        return
      } else {
        toast.success("Task Deleted Successfully!", { position: 'top-center' });
        fetchTasks();
      }
    } catch (error) {
      console.log(error);
    }
  };

  if (loading) {
    return (
      <Loading />
    );
  }
  
  

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {detailsFetchedSuccess && (
        <div className="p-6 max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Folder className="w-6 h-6 text-blue-600" />
              </div>
              <h1 className="text-2xl font-semibold text-gray-800">{projectName}</h1>
            </div>
            <div className="flex space-x-4">
            <AvatarStack members={members} />
              <Button
                variant="outline"
                className="bg-white hover:bg-gray-50 border-gray-200 text-gray-700 flex items-center space-x-2"
                onClick={()=> setAiPopup(true)}
              >
                <ShieldQuestion className="w-4 h-4" />
                <span>Ask AI</span>
              </Button>
              <Button
                variant="outline"
                className="bg-white hover:bg-gray-50 border-gray-200 text-gray-700 flex items-center space-x-2"
                onClick={() => setShowInviteModal(true)}
              >
                <User className="w-4 h-4" />
                <span>Invite</span>
              </Button>
              <Button
                className="bg-blue-600 hover:bg-blue-700 text-white flex items-center space-x-2"
                onClick={() => setShowModal(true)}
              >
                <Plus className="w-4 h-4" />
                <span>Add Task</span>
              </Button>
            </div>
          </div>

          <div className="space-y-4">
  {['To-do', 'In Progress', 'Done'].map((section) => {
    const filteredTasks = tasks.filter((task) =>
      section === 'To-do' ? task.category === 'todo' :
      section === 'In Progress' ? task.category === 'inprogress' :
      task.category === 'done'
    );

    return (
      <Card key={section} className="overflow-hidden">
        <Collapsible.Root>
          <Collapsible.Trigger className="w-full">
            <div className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-lg ${
                  section === 'To-do' ? 'bg-purple-100 text-purple-600' :
                  section === 'In Progress' ? 'bg-blue-100 text-blue-600' :
                  'bg-green-100 text-green-600'
                }`}>
                  {section === 'To-do' ? <LayoutList className="w-4 h-4" /> :
                  section === 'In Progress' ? <NotebookPen className="w-4 h-4" /> :
                  <CheckCircle className="w-4 h-4" />}
                </div>
                <h2 className="text-lg font-medium text-gray-800">{section}</h2>
              </div>
              <ChevronDown className="w-5 h-5 text-gray-400" />
            </div>
          </Collapsible.Trigger>
          <Collapsible.Content>
            <CardContent className="p-4">
              {filteredTasks.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-50">
                        <TableHead className="font-semibold">Task</TableHead>
                        <TableHead className="font-semibold">Description</TableHead>
                        <TableHead className="font-semibold">Assigned</TableHead>
                        <TableHead className="font-semibold">Deadline</TableHead>
                        <TableHead className="font-semibold">Priority</TableHead>
                        <TableHead className="font-semibold">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredTasks.map((task, index) => (
                        <TableRow key={index} className="hover:bg-gray-50">
                          <TableCell className="font-medium">
                          {dayjs().isAfter(dayjs(task.deadline)) && (
                            <AlertTriangle className="w-4 h-4 text-red-500 mr-1" />
                          )}
                            {task.task}
                          </TableCell>
                          <TableCell>
                            <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            components={{
                              ul: ({ children }) => <ul className="list-disc pl-5">{children}</ul>,
                              ol: ({ children }) => <ol className="list-decimal pl-5">{children}</ol>,
                              li: ({ children }) => <li className="ml-4">{children}</li>,
                            }}
                            >
                              {task.desc}

                            </ReactMarkdown>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-1">
                              {task.assigned && task.assigned.map((assignee, idx) => (
                                <Badge key={idx} variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                                  {assignee}
                                </Badge>
                              ))}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <CalendarDays className="w-4 h-4 text-gray-400" />
                              <span>{task.deadline}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={getPriorityColor(task.priority)}>
                              {task.priority}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => openEditModal(task)}
                                className="hover:bg-gray-100"
                              >
                                <Edit className="w-4 h-4 text-gray-600" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => openDeleteModal(task)}
                                className="hover:bg-red-100"
                              >
                                <Trash2 className="w-4 h-4 text-red-600" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="p-4 text-gray-500 text-sm">
                  {section === 'To-do' ? 'No tasks in To-do' :
                  section === 'In Progress' ? 'No tasks in progress' :
                  'No completed tasks'}
                </div>
              )}
            </CardContent>
          </Collapsible.Content>
        </Collapsible.Root>
      </Card>
    );
  })}
</div>

        </div>
      )}

      <AiPopup token={token} members={members} aiPopup={aiPopup} onClose={onClose} onOpen={onOpen} projectId={projectId}/>

      {showDeleteModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <Card className="w-full max-w-md bg-white rounded-lg shadow-xl">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                Confirm Deletion
              </h2>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete this task? This action cannot be undone.
              </p>
              <div className="flex justify-end space-x-4">
                <Button
                  variant="outline"
                  className="border-gray-200 hover:bg-gray-50"
                  onClick={() => {
                    setShowDeleteModal(false);
                    setDelTaskId(null);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  className="bg-red-600 hover:bg-red-700 text-white"
                  onClick={() => handleDeleteTask()}
                >
                  Delete
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <Card className="w-full max-w-lg bg-white rounded-lg shadow-xl">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-6">
                {isEditing ? 'Edit Task' : 'Add New Task'}
              </h2>
              <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Task</label>
                  <input
                    type="text"
                    name="task"
                    value={newTask.task}
                    onChange={handleChange}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  {errors.task && <span className="text-red-500 text-sm mt-1">{errors.task}</span>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <input
                    type="text"
                    name="description"
                    value={newTask.description}
                    onChange={handleChange}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  {errors.description && <span className="text-red-500 text-sm mt-1">{errors.description}</span>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Assigned</label>
                  <select
                    onChange={handleAssigneeChange}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select Member</option>
                    {members
                      .filter((member) => !newTask.assigned.includes(member.email))
                      .map((member) => (
                        <option key={member.id} value={member.email}>
                          {member.name}, {member.email}
                        </option>
                      ))}
                  </select>
                  {errors.assigned && <span className="text-red-500 text-sm mt-1">{errors.assigned}</span>}

                  <div className="flex flex-wrap gap-2 mt-2">
                    {newTask.assigned.map((assignee, index) => (
                      <Badge
                        key={index}
                        className="bg-blue-50 text-blue-700 border-blue-200 flex items-center space-x-1"
                      >
                        <span>{assignee}</span>
                        <button
                          type="button"
                          onClick={() => removeAssignee(assignee)}
                          className="ml-1 hover:text-red-500"
                        >
                          ×
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Deadline</label>
                  <input
                    type="date"
                    name="deadline"
                    value={newTask.deadline}
                    onChange={handleChange}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  {errors.deadline && <span className="text-red-500 text-sm mt-1">{errors.deadline}</span>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                  <select
                    name="priority"
                    value={newTask.priority}
                    onChange={handleChange}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select Priority</option>
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                  {errors.priority && <span className="text-red-500 text-sm mt-1">{errors.priority}</span>}
                </div>

                <div className="flex justify-end space-x-4 mt-6">
                  <Button
                    variant="outline"
                    className="border-gray-200 hover:bg-gray-50"
                    onClick={() => {
                      setShowModal(false);
                      setNewTask({
                        task: '',
                        description: '',
                        assigned: [],
                        deadline: '',
                        priority: '',
                      });
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                    onClick={isEditing ? handleUpdateTask : handleAddTask}
                  >
                    {isEditing ? 'Update Task' : 'Add Task'}
                  </Button>
                </div>
              </form>
            </div>
          </Card>
        </div>
      )}

      {showInviteModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <Card className="w-full max-w-lg bg-white rounded-lg shadow-xl">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-6">Send Invitations</h2>
              <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Add Emails</label>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                      placeholder="Enter email"
                      className="flex-1 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <Button
                      onClick={addEmail}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      Add
                    </Button>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {invited.map((email, index) => (
                    <Badge
                      key={index}
                      className="bg-blue-50 text-blue-700 border-blue-200 flex items-center space-x-1"
                    >
                      <span>{email}</span>
                      <button
                        type="button"
                        onClick={() => removeEmail(email)}
                        className="ml-1 hover:text-red-500"
                      >
                        ×
                      </button>
                    </Badge>
                  ))}
                </div>

                <div className="flex justify-end space-x-4 mt-6">
                  <Button
                    variant="outline"
                    className="border-gray-200 hover:bg-gray-50"
                    onClick={() => setShowInviteModal(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                    onClick={handleInvite}
                  >
                    Send Invites
                  </Button>
                </div>
              </form>
            </div>
          </Card>
        </div>
      )}

      <Toaster />
    </div>
  );
};

export default ProjectPage;