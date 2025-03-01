"use client";
import * as Collapsible from "@radix-ui/react-collapsible";
import { Button } from "@/components/ui/button";
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
import { useEffect, useState } from "react";
import { Toaster, toast } from "react-hot-toast";
import Loading from "../_components/Loading";
import { AiPopup } from "../_components/AiPopup";
import axios from "axios";
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
  priority: string; // priority (text)
  proj_id: string; // proj_id (uuid), typically stored as a string
  category: string; // category (character varying), default value 'todo'
  created_by: string | null; // created_by (character varying), can be null
  assigned: string[] | null; // assigned (text[]), array of strings, can be null
  predicted_time?: string; // New field for predicted time
}

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
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const onOpen = () => {
    setAiPopup(true);
  };
  const onClose = () => {
    setAiPopup(false);
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
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update task");
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
          throw new Error(data.error);
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
        "token"
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
      console.log("Fetched Tasks:", data);
      if (!response.ok) {
        throw new Error(data.error);
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
    if (!newTask.description) newErrors.description = "Description is required";
    if (!newTask.assigned.length)
      newErrors.assigned = "At least one assignee is required";
    if (!newTask.deadline) newErrors.deadline = "Deadline is required";
    if (!newTask.priority) newErrors.priority = "Priority is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
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
        }
      );
      const data = await response.json();
      setShowDeleteModal(false);
      setDelTaskId(null);
      if (!response.ok) {
        toast.error(data.error, { position: "top-center" });
      } else {
        toast.success("Task Deleted Successfully!", { position: "top-center" });
        fetchTasks();
      }
    } catch (error) {
      console.log(error);
    }
  };

  if (loading) {
    return <Loading />;
  }

  /// handle task suggestions
  const handleTaskSuggestions = async (inputText) => {
    try {
      const response = await axios.post(
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent",

        {
          contents: [
            {
              parts: [
                {
                  text: `Suggest task descriptions for the given task title: ${inputText}`,
                },
              ],
            },
          ],
        },
        {
          headers: { "Content-Type": "application/json" },
          params: { key: process.env.NEXT_PUBLIC_GOOGLE_PALM_API_KEY },
        }
      );

      const answer =
        response.data.candidates?.[0]?.content?.parts?.[0]?.text ||
        "No suggestion found.";

      const suggestions = answer
        .split("\n") // Split into lines
        .map((s) => s.replace(/^\*\s*/, "").trim()) // Remove '*' at the beginning
        .filter((line) => line && !line.includes(":")); // Remove empty lines and section headers

      const finalSuggestions = suggestions.slice(0, 3); // Get only the top 5 suggestions

      console.log(finalSuggestions);
      setSuggestions(finalSuggestions);
    } catch (error) {
      console.error(
        "Error in fetching suggestions:",
        error?.response?.data || error.message
      );
    }
  };

  // Function to select a suggestion and update the input field
  const handleSuggestionClick = (suggestion: string) => {
    setNewTask((prev) => ({ ...prev, description: suggestion }));
    setSuggestions([]); // Clear suggestions after selection
  };

  // predict task completion time
  const predictTaskTime = async (taskText, priority) => {
    try {
      const response = await axios.post(
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent",
        {
          contents: [
            {
              parts: [
                {
                  text: `Provide an estimated completion time for the following task while strictly considering the priority level. 
            
                  Task: ${taskText} 
                  Priority: ${priority}
      
                  - If it's HIGH priority, assume more dedicated effort in fewer days.
                  - If it's MEDIUM priority, assume balanced work over a reasonable timeframe.
                  - If it's LOW priority, assume a more relaxed pace.
      
                  Return ONLY the estimated duration in the format: "X-Y hours" (e.g., "8-16 hours"). No extra text.`,
                },
              ],
            },
          ],
        },
        {
          headers: { "Content-Type": "application/json" },
          params: { key: process.env.NEXT_PUBLIC_GOOGLE_PALM_API_KEY },
        }
      );

      const answer =
        response.data?.candidates?.[0]?.content?.parts?.[0]?.text || "N/A";

      // Remove unwanted characters or symbols from AI response
      return answer.replace(/[*•]/g, "").trim();
    } catch (error) {
      console.error("Error in AI Prediction:", error);
      return "N/A";
    }
  };

  // predict the task completion time
  const handleAddTask = async () => {
    if (!validateForm()) return;

    try {
      // Get predicted time for task completion
      const predictedTime = await predictTaskTime(
        newTask.description,
        newTask.priority
      );

      if (!predictedTime) {
        toast.error("Failed to predict task time", { position: "top-center" });
        return;
      }

      console.log(predictedTime);

      // Convert predicted time to hours and minutes
      const timeParts = predictedTime.match(
        /(\d+)\s*hours?\s*(\d+)?\s*minutes?/i
      );
      const predictedHours = timeParts ? parseInt(timeParts[1], 10) || 0 : 0;
      const predictedMinutes =
        timeParts && timeParts[2] ? parseInt(timeParts[2], 10) || 0 : 0;
      const totalPredictedMinutes = predictedHours * 60 + predictedMinutes;

      // Convert deadline to a Date object
      const deadlineDate = new Date(newTask.deadline);
      const currentDate = new Date();
      const remainingMinutes = Math.max(
        0,
        (deadlineDate.getTime() - currentDate.getTime()) / 60000
      );

      // Check if predicted time is greater than the available time
      if (totalPredictedMinutes > remainingMinutes) {
        toast.error(
          `Predicted completion time (${predictedHours}h ${predictedMinutes}m) is longer than available time before deadline!`,
          { position: "top-center" }
        );
      }

      // Add predicted time to the task before saving
      const newTaskWithPrediction = { ...newTask, predictedTime };
      console.log("Final Task Object Before Saving:", newTaskWithPrediction);

      // Save the task with the predicted time
      const response = await fetch(`/api/projects/${projectId}/task`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newTaskWithPrediction),
      });

      if (!response.ok) {
        throw new Error("Failed to create task");
      }

      const responseData = await response.json();
      console.log("API Response:", responseData);

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
      toast.error(error.message, { position: "top-center" });
    }
  };

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

          <div className="space-y-4">
            {["To-do", "In Progress", "Done"].map((section) => {
              const filteredTasks = tasks.filter((task) =>
                section === "To-do"
                  ? task.category === "todo"
                  : section === "In Progress"
                    ? task.category === "inprogress"
                    : task.category === "done"
              );

              return (
                <Card key={section} className="overflow-hidden">
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
                          <h2 className="text-lg font-medium text-gray-800">
                            {section}
                          </h2>
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
                                  <TableHead className="font-semibold">
                                    Task Title
                                  </TableHead>
                                  <TableHead className="font-semibold">
                                    Description
                                  </TableHead>
                                  <TableHead className="font-semibold">
                                    Assigned To
                                  </TableHead>
                                  <TableHead className="font-semibold">
                                    Deadline
                                  </TableHead>
                                  <TableHead className="font-semibold">
                                    Predicted time
                                  </TableHead>
                                  <TableHead className="font-semibold">
                                    Priority
                                  </TableHead>
                                  <TableHead className="font-semibold">
                                    Actions
                                  </TableHead>
                                </TableRow>
                              </TableHeader>

                              <TableBody>
                                {filteredTasks.map((task, index) => (
                                  <TableRow
                                    key={index}
                                    className="hover:bg-gray-50"
                                  >
                                    <TableCell className="font-medium">
                                      {task.task}
                                    </TableCell>
                                    <TableCell>{task.desc}</TableCell>
                                    <TableCell>
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
                                    <TableCell>
                                      <div className="flex items-center space-x-2">
                                        <CalendarDays className="w-4 h-4 text-gray-400" />
                                        <span>{task.deadline}</span>
                                      </div>
                                    </TableCell>
                                    <TableCell>
                                      <Badge className="bg-gray-100 text-gray-700 border-gray-300">
                                        {task.predicted_time || "N/A"}
                                      </Badge>
                                    </TableCell>
                                    <TableCell>
                                      <Badge
                                        className={getPriorityColor(
                                          task.priority
                                        )}
                                      >
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
            })}
          </div>
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
                    Task Title
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

                  {suggestions.length > 0 && (
                    <ul className="mt-2 border rounded shadow p-2 bg-white">
                      {suggestions.map((s, i) => (
                        <li
                          key={i}
                          className="cursor-pointer hover:bg-gray-100 p-2"
                          onClick={() => handleSuggestionClick(s)}
                        >
                          {s}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Task Description
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
                        (member) => !newTask.assigned.includes(member.email)
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
                    className="bg-blue-600 hover:bg-blue-700 text-white flex items-center space-x-2"
                    onClick={() => handleTaskSuggestions(newTask.task)}
                  >
                    <Plus className="w-4 h-4" />
                    <span>AI Task Suggestions</span>
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
