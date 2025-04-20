"use client";
import * as Collapsible from "@radix-ui/react-collapsible";
import { Button } from "@/components/ui/button";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import dayjs from "dayjs";
import {
  CalendarDays,
  Folder,
  LayoutList,
  NotebookPen,
  ShieldQuestion,
  User,
  Edit,
  Trash2,
  Plus,
  ChevronDown,
  CheckCircle,
  AlertTriangle,
  MessageSquare,
} from "lucide-react";
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
import { useParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Toaster, toast } from "react-hot-toast";
import Loading from "../_components/Loading";
import { AiPopup } from "../_components/AiPopup";
import TasksPerMemberBarGraph from "../_components/TasksPerMemberBarGraph";

import AvatarStack from "../_components/AvatarStack";
import {
  DndContext,
  DragOverlay,
  useDraggable,
  useDroppable,
} from "@dnd-kit/core";
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import dynamic from 'next/dynamic'

import 'react-quill-new/dist/quill.snow.css'
import supabase from "@/components/utils/supabase";

// Dynamically load the editor to prevent SSR issues
const ReactQuill = dynamic(() => import('react-quill-new'), { ssr: false })

type CommentType = {
  id: number
  content: string
  created_at: string // ISO timestamp
  task_id: number | null
  user_id: string
  user_name: string
  user_image: string | null
  user_email: string | null
  parent_comment_id:number | null
}

interface Errors {
  priority?: string;
  task?: string;
  description?: string;
  assigned?: string;
  deadline?: string;
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
// Create a preview component for the overlay

// TaskCardPreview Component with null checks
const TaskCardPreview = ({ task, getPriorityColor }) => {
  // Add null checks to prevent "Cannot read properties of null" errors
  if (!task) return null;

  return (
    <div className="bg-white border rounded-md shadow-md p-4 w-full max-w-3xl">
      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center">
            {task.deadline && dayjs().isAfter(dayjs(task.deadline)) && (
              <AlertTriangle className="w-4 h-4 text-red-500 mr-1" />
            )}
            <h3 className="font-medium">{task.task}</h3>
          </div>
          <div className="text-sm text-gray-600 mt-1">
            {task.desc &&
              (task.desc.length > 50
                ? `${task.desc.substring(0, 50)}...`
                : task.desc)}
          </div>
        </div>
        <Badge className={getPriorityColor(task.priority)}>
          {task.priority}
        </Badge>
      </div>
      <div className="flex justify-between items-center mt-3">
        <div className="flex flex-wrap gap-1">
          {task.assigned &&
            task.assigned.length > 0 &&
            task.assigned.map((assignee, idx) => (
              <Badge
                key={idx}
                variant="outline"
                className="bg-blue-50 text-blue-700 border-blue-200"
              >
                {assignee}
              </Badge>
            ))}
        </div>
        <div className="flex items-center text-sm text-gray-500">
          <CalendarDays className="w-4 h-4 mr-1" />
          {task.deadline}
        </div>
      </div>
    </div>
  );
};

const TaskCard = ({
  task,
  index,
  getPriorityColor,
  openEditModal,
  openDeleteModal,
}) => {
  const [comments, setComments] = useState<CommentType[]>([])
  const [replyTo, setReplyTo] = useState<CommentType | null>(null)
  const [replyContent, setReplyContent] = useState<string>('')
  const [isOpen, setIsOpen] = useState(false)
  const channelRef = useRef(null) // store channel instance

  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: task.id.toString(),
      data: { section: task.category, task }, // Only pass section, not the entire task
    });
  if (isDragging) {
    return <TableRow ref={setNodeRef} className="opacity-0" />;
  }
  const handleOpenChange = async (open) => {
    setIsOpen(open)

    if (open && task?.id) {
      // Subscribe
      const channel = supabase
        .channel(`comments-for-task-${task.id}`)
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "comments",
            filter: `task_id=eq.${task.id}`,
          },
          (payload) => {
            console.log("🆕 New comment:", payload.new)
            setComments((prev) => [...prev, payload.new as CommentType])
          }
        )
        .on(
          "postgres_changes",
          {
            event: "DELETE",
            schema: "public",
            table: "comments",
            filter: `task_id=eq.${task.id}`,
          },
          (payload) => {
            console.log("❌ Comment deleted:", payload.old)
          }
        )
        .subscribe()

      channelRef.current = channel
    } else if (!open && channelRef.current) {
      // Unsubscribe
      supabase.removeChannel(channelRef.current)
      channelRef.current = null
      console.log("🛑 Unsubscribed")
    }
  }
  const fecthTaskComments = async (taskId) => {
    const response = await fetch(`/api/comments/${taskId}`);
    if(!response.ok) {
      console.log("Error fetching comments",response);
      return;
    }
    const data = await response.json();
    console.log("comments : ",data)
    setComments(data)
    
  }
  const sendComment = async (taskId, content, parentCommentId) => {
    const response = await fetch(`/api/comments/${taskId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        content,
        taskId,
        parentCommentId
      }),
    });
    if(!response.ok) {
      console.log("Error sending comment",response);
      return;
    }
    const data = await response.json();
  }
  const renderComments = (parentId: number | null = null, depth = 0) => {
    return comments
      .filter((c) => c.parent_comment_id === parentId)
      .map((comment) => (
        <div key={comment.id} style={{ marginLeft: depth * 20 }} className="mb-4">
          <div className="flex items-start gap-3">
            {/* Avatar */}
            <img
              src={comment.user_image ?? '/default-avatar.png'}
              alt="avatar"
              className="w-8 h-8 rounded-full"
            />

            {/* Comment content block */}
            <div className="flex-1">
              {/* Name and time */}
              <div className="text-sm text-muted-foreground mb-1">
                <span className="font-semibold text-gray-800">{comment.user_name}</span>
                <span className="ml-2 text-xs">
                  • Posted on{' '}
                  {new Date(comment.created_at).toLocaleString(undefined, {
                    dateStyle: 'medium',
                    timeStyle: 'short',
                  })}
                </span>
              </div>


              {/* Comment body */}
              <div
                className="prose prose-sm max-w-none mt-1"
                dangerouslySetInnerHTML={{ __html: comment.content }}
              />

              {/* Reply button */}
              <Button
                variant="link"
                size="sm"
                className="text-xs mt-1 px-0"
                onClick={() => setReplyTo(comment)}
              >
                Reply
              </Button>
            </div>
          </div>

          {/* Render replies */}
          {renderComments(comment.id, depth + 1)}
        </div>
      ))
  }


  const style = transform
    ? { transform: `translate(${transform.x}px, ${transform.y}px)` }
    : {};

  return (
    <TableRow
      ref={setNodeRef}
      key={`task-${task.id}`}
      style={style}
      className="hover:bg-gray-50"
    >
      <TableCell {...listeners} {...attributes} className="font-medium">
        {dayjs().isAfter(dayjs(task.deadline)) && (
          <AlertTriangle className="w-4 h-4 text-red-500 mr-1" />
        )}
        {task.task}
      </TableCell>
      <TableCell {...listeners} {...attributes}>
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            ul: ({ children }) => (
              <ul className="list-disc pl-5">{children}</ul>
            ),
            ol: ({ children }) => (
              <ol className="list-decimal pl-5">{children}</ol>
            ),
            li: ({ children }) => <li className="ml-4">{children}</li>,
          }}
        >
          {task.desc}
        </ReactMarkdown>
      </TableCell>
      <TableCell {...listeners} {...attributes}>
        <div className="flex flex-wrap gap-1">
          {task.assigned &&
            task.assigned.map((assignee, idx) => (
              <Badge
                key={idx}
                variant="outline"
                className="bg-blue-50 text-blue-700 border-blue-200"
              >
                {assignee}
              </Badge>
            ))}
        </div>
      </TableCell>
      <TableCell {...listeners} {...attributes}>
        <div className="flex items-center space-x-2">
          <CalendarDays className="w-4 h-4 text-gray-400" />
          <span>{task.deadline}</span>
        </div>
      </TableCell>
      <TableCell {...listeners} {...attributes}>
        <Badge className={getPriorityColor(task.priority)}>
          {task.priority}
        </Badge>
      </TableCell>
      <TableCell>
        <div className="flex space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              openEditModal(task);
            }}
            className="hover:bg-gray-100"
          >
            <Edit className="w-4 h-4 text-gray-600" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              openDeleteModal(task);
            }}
            className="hover:bg-red-100"
          >
            <Trash2 className="w-4 h-4 text-red-600" />
          </Button>
          <Sheet open={isOpen} onOpenChange={handleOpenChange}>
            <SheetTrigger asChild>
              <Button onClick={() => fecthTaskComments(task.id)} variant="ghost" size="icon" className="hover:bg-accent">
                <MessageSquare className="h-5 w-5 text-muted-foreground" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="!w-[60vw] !max-w-[75vw] p-6 flex flex-col">
              <SheetHeader>
                <SheetTitle className="text-xl font-bold">
                  Leave a Comment
                </SheetTitle>
              </SheetHeader>
              <div className="flex-1 overflow-y-auto mt-4 space-y-4">
                {renderComments()}
              </div>
              <SheetFooter className="pt-4 border-t mt-4">
                <div className="w-full">
                  <p className="font-semibold mb-2">Add a new comment</p>

                  {replyTo && (
                    <div className="bg-gray-100 border-l-4 border-blue-500 p-2 rounded mb-2 relative">
                      <div
                        className="text-sm text-gray-800"
                        dangerouslySetInnerHTML={{ __html: replyTo.content }}
                      />
                      <button
                        className="absolute top-1 right-1 text-gray-500 hover:text-red-500"
                        onClick={() => setReplyTo(null)}
                      >
                        ✕
                      </button>
                    </div>
                  )}

                  <ReactQuill
                    theme="snow"
                    value={replyContent}
                    onChange={setReplyContent}
                    className="bg-white"
                  />

                  <Button
                    className="mt-2"
                    onClick={() => {
                      console.log(
                        replyTo
                          ? `Replying to ${replyTo.id}: ${replyContent}`
                          : `Posting top-level comment: ${replyContent}`
                      )
                      sendComment(task.id, replyContent, replyTo ? replyTo.id : null)
                      setReplyContent('')
                      setReplyTo(null)
                    }}
                  >
                    {replyTo ? 'Reply' : 'Post Comment'}
                  </Button>
                </div>
              </SheetFooter>

            </SheetContent>
          </Sheet>
        </div>
      </TableCell>
    </TableRow>
  );
};

const DroppableSection = ({
  section,
  tasks,
  getPriorityColor,
  openDeleteModal,
  openEditModal,
}) => {
  const { setNodeRef } = useDroppable({
    id: section,
  });

  return (
    <Card ref={setNodeRef} key={section} className="overflow-hidden">
      <Collapsible.Root>
        <Collapsible.Trigger className="w-full">
          <div className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
            <div className="flex items-center space-x-3">
              <div
                className={`p-2 rounded-lg ${
                  section === "To-do"
                    ? "bg-purple-100 text-purple-600"
                    : section === "In Progress"
                      ? "bg-blue-100 text-blue-600"
                      : "bg-green-100 text-green-600"
                }`}
              >
                {section === "To-do" ? (
                  <LayoutList className="w-4 h-4" />
                ) : section === "In Progress" ? (
                  <NotebookPen className="w-4 h-4" />
                ) : (
                  <CheckCircle className="w-4 h-4" />
                )}
              </div>
              <h2 className="text-lg font-medium text-gray-800">{section}</h2>
            </div>
            <ChevronDown className="w-5 h-5 text-gray-400" />
          </div>
        </Collapsible.Trigger>
        <Collapsible.Content>
          <CardContent className="p-4">
            {tasks.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50">
                      <TableHead className="font-semibold">Task</TableHead>
                      <TableHead className="font-semibold">
                        Description
                      </TableHead>
                      <TableHead className="font-semibold">Assigned</TableHead>
                      <TableHead className="font-semibold">Deadline</TableHead>
                      <TableHead className="font-semibold">Priority</TableHead>
                      <TableHead className="font-semibold">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tasks.map((task, index) => (
                      <TaskCard
                        key={task.id}
                        task={task}
                        index={index}
                        getPriorityColor={getPriorityColor}
                        openDeleteModal={openDeleteModal}
                        openEditModal={openEditModal}
                      />
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="p-4 text-gray-500 text-sm">
                {section === "To-do"
                  ? "No tasks in To-do"
                  : section === "In Progress"
                    ? "No tasks in progress"
                    : "No completed tasks"}
              </div>
            )}
          </CardContent>
        </Collapsible.Content>
      </Collapsible.Root>
    </Card>
  );
};

const ProjectPage = () => {
  const { projectId } = useParams();
  const [token, setToken] = useState<string | null>(null);
  const [newEmail, setNewEmail] = useState("");
  const [projectName, setProjectName] = useState("");
  const [loading, setLoading] = useState(true);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [detailsFetchedSuccess, setDetailsFetchedSuccess] = useState(false);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [invited, setInvited] = useState<string[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [newTask, setNewTask] = useState({
    task: "",
    description: "",
    assigned: [],
    deadline: "",
    priority: "",
  });
  const [members, setMembers] = useState([]);
  const [errors, setErrors] = useState<Errors>({});
  const [isEditing, setIsEditing] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [delTaskId, setDelTaskId] = useState(null);
  const [aiPopup, setAiPopup] = useState(false);
  const [activeTask, setActiveTask] = useState(null);
  const onOpen = () => {
    setAiPopup(true);
  };
  const onClose = () => {
    setAiPopup(false);
  };

  const onDragEnd = async (event) => {
    setActiveTask(null);
    if (!event.over) {
      return;
    }
    const sourceSection = event.active.data.current?.section;
    const destinationSection = event.over.id;

    // Return early if source and destination are the same section
    if (
      (sourceSection === "todo" && destinationSection === "To-do") ||
      (sourceSection === "inprogress" &&
        destinationSection === "In Progress") ||
      (sourceSection === "done" && destinationSection === "Done")
    )
      return;
    console.log("cleared validation");
    const response = await fetch(
      `/api/projects/${projectId}/task/${event.active.data.current?.task.id}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          task: event.active.data.current?.task.task,
          description: event.active.data.current?.task.desc,
          deadline: event.active.data.current?.task.deadline,
          priority: event.active.data.current?.task.priority,
          assigned: event.active.data.current?.task.assigned,
          category:
            destinationSection == "To-do"
              ? "todo"
              : destinationSection == "In Progress"
                ? "inprogress"
                : destinationSection == "Done"
                  ? "done"
                  : "todo",
        }),
      },
    );
    if (response.ok) {
      fetchTasks();
    }
  };

  // Priority color mapping
  const getPriorityColor = (priority) => {
    const colors = {
      High: "bg-red-100 text-red-800",
      Medium: "bg-yellow-100 text-yellow-800",
      Low: "bg-green-100 text-green-800",
    };
    return colors[priority] || "bg-gray-100 text-gray-800";
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
      const response = await fetch(
        `/api/projects/${projectId}/task/${selectedTask.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(newTask),
        },
      );

      if (!response.ok) {
        toast.error("Failed to update task", { position: "top-center" });
        return;
      }

      toast.success("Task updated successfully!", { position: "top-center" });
      setShowModal(false);
      setNewTask({
        task: "",
        description: "",
        assigned: [],
        deadline: "",
        priority: "",
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
          toast.error(data.error, { position: "top-center" });
          return;
        }
        setProjectName(data.projectData.name);
        setMembers(data.membersData);
        setDetailsFetchedSuccess(true);
      } catch (error) {
        toast.error(error, { position: "top-center" });
      } finally {
        setLoading(false);
      }
    };

    fetchProjectName();
    if (typeof window !== "undefined") {
      const hash = window.location.hash; // Get the fragment part (#token=...)
      const tokenValue = new URLSearchParams(hash.replace("#", "?")).get(
        "token",
      );
      setToken(tokenValue);
    }
  }, [projectId]);

  useEffect(() => {
    if (token) {
      setAiPopup(true);
    }
  }, [token]);

  const fetchTasks = async () => {
    try {
      const response = await fetch(`/api/projects/${projectId}/task`);
      const data = await response.json();
      if (!response.ok) {
        toast.error(data.error, { position: "top-center" });
        return;
      }
      setTasks(data.data);
    } catch (error) {
      toast.error(error, { position: "top-center" });
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
    const newErrors: Errors = {};
    if (!newTask.task) newErrors.task = "Task name is required";
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
        method: "POST",
        headers: {
          "Content-Type": "application/json",
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
        task: "",
        description: "",
        assigned: [],
        deadline: "",
        priority: "",
      });
      fetchTasks();
    } catch (error) {
      toast.error(error, { position: "top-center" });
    }
  };

  const addEmail = () => {
    if (newEmail.trim() && !invited.includes(newEmail.trim())) {
      setInvited([...invited, newEmail.trim()]);
      setNewEmail("");
    }
  };

  const removeEmail = (email) => {
    setInvited(invited.filter((e) => e !== email));
  };

  const handleInvite = async () => {
    try {
      const response = await fetch(`/api/projects/${projectId}/invites`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ invited: invited }),
      });
      const data = await response.json();
      if (!response.ok) {
        toast.error(data.error, { position: "top-center" });
        return;
      }
    } catch (error) {
      console.log("Error sending invites:", error);
    }
  };

  const handleDeleteTask = async () => {
    try {
      const response = await fetch(
        `/api/projects/${projectId}/task/${delTaskId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        },
      );
      const data = await response.json();
      setShowDeleteModal(false);
      setDelTaskId(null);
      if (!response.ok) {
        toast.error(data.error, { position: "top-center" });
        return;
      } else {
        toast.success("Task Deleted Successfully!", { position: "top-center" });
        fetchTasks();
      }
    } catch (error) {
      console.log(error);
    }
  };
  const onDragStart = (event) => {
    // Find the task being dragged
    const taskId = event.active.id;
    const draggedTask = tasks.find((task) => task.id.toString() === taskId);
    setActiveTask(draggedTask);
  };

  if (loading) {
    return <Loading />;
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
              <h1 className="text-2xl font-semibold text-gray-800">
                {projectName}
              </h1>
            </div>
            <div className="flex space-x-4">
              <AvatarStack members={members} />
              <Button
                variant="outline"
                className="bg-white hover:bg-gray-50 border-gray-200 text-gray-700 flex items-center space-x-2"
                onClick={() => setAiPopup(true)}
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
          <DndContext onDragStart={onDragStart} onDragEnd={onDragEnd}>
            <div className="space-y-4">
              {["To-do", "In Progress", "Done"].map((section) => {
                const filteredTasks = tasks.filter((task) =>
                  section === "To-do"
                    ? task.category === "todo"
                    : section === "In Progress"
                      ? task.category === "inprogress"
                      : task.category === "done",
                );
                return (
                  <DroppableSection
                    key={section}
                    section={section}
                    tasks={filteredTasks}
                    getPriorityColor={getPriorityColor}
                    openDeleteModal={openDeleteModal}
                    openEditModal={openEditModal}
                  />
                );
              })}
            </div>
            <DragOverlay>
              {activeTask && (
                <TaskCardPreview
                  task={activeTask}
                  getPriorityColor={getPriorityColor}
                />
              )}
            </DragOverlay>
          </DndContext>
        </div>
      )}

      <AiPopup
        token={token}
        members={members}
        aiPopup={aiPopup}
        onClose={onClose}
        onOpen={onOpen}
        projectId={projectId}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 px-12 py-8">
        <TasksPerMemberBarGraph />
        
      </div>



      {showDeleteModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <Card className="w-full max-w-md bg-white rounded-lg shadow-xl">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                Confirm Deletion
              </h2>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete this task? This action cannot be
                undone.
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
                {isEditing ? "Edit Task" : "Add New Task"}
              </h2>
              <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Task
                  </label>
                  <input
                    type="text"
                    name="task"
                    value={newTask.task}
                    onChange={handleChange}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  {errors.task && (
                    <span className="text-red-500 text-sm mt-1">
                      {errors.task}
                    </span>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <input
                    type="text"
                    name="description"
                    value={newTask.description}
                    onChange={handleChange}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  {errors.description && (
                    <span className="text-red-500 text-sm mt-1">
                      {errors.description}
                    </span>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Assigned
                  </label>
                  <select
                    onChange={handleAssigneeChange}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select Member</option>
                    {members
                      .filter(
                        (member) => !newTask.assigned.includes(member.email),
                      )
                      .map((member) => (
                        <option key={member.id} value={member.email}>
                          {member.name}, {member.email}
                        </option>
                      ))}
                  </select>
                  {errors.assigned && (
                    <span className="text-red-500 text-sm mt-1">
                      {errors.assigned}
                    </span>
                  )}

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
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Deadline
                  </label>
                  <input
                    type="date"
                    name="deadline"
                    value={newTask.deadline}
                    onChange={handleChange}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  {errors.deadline && (
                    <span className="text-red-500 text-sm mt-1">
                      {errors.deadline}
                    </span>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Priority
                  </label>
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
                  {errors.priority && (
                    <span className="text-red-500 text-sm mt-1">
                      {errors.priority}
                    </span>
                  )}
                </div>

                <div className="flex justify-end space-x-4 mt-6">
                  <Button
                    variant="outline"
                    className="border-gray-200 hover:bg-gray-50"
                    onClick={() => {
                      setShowModal(false);
                      setNewTask({
                        task: "",
                        description: "",
                        assigned: [],
                        deadline: "",
                        priority: "",
                      });
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                    onClick={isEditing ? handleUpdateTask : handleAddTask}
                  >
                    {isEditing ? "Update Task" : "Add Task"}
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
              <h2 className="text-xl font-semibold text-gray-800 mb-6">
                Send Invitations
              </h2>
              <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Add Emails
                  </label>
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