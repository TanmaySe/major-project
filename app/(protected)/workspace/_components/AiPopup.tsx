'use client';

import { useState, useEffect, useRef } from 'react';
import { Send, Mic, MicOff, X, CheckCircle, NotebookPen, LayoutList } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { ExternalLink } from "lucide-react";
import { format } from 'date-fns';
import { useRouter } from 'next/navigation';
import { getBoards, handleTrelloAuth,createTaskFromTrello } from '@/components/utils/trelloFunctions';
type Member = {
  id: string;
  name: string;
  email: string;
};
type Message = {
  sender: 'user' | 'ai';
  text?: string;
  red?: boolean;
  button?: boolean;
  redirect?: string;
  utility?: (...args: any[]) => any;
  utilityText?:string;
  boardName?: string;
  boardId?: string;
  desc?:string;
  bgImage?: string
  listName?:string;
  listId?:string;
  cardName?:string
  cardId?:string
  cardDesc?:string;
  cardDeadline?:string;
  members?:{name:string|null;email:string|null;avatar:string|null;}[];
};

type Task = 'general' | 'create task' | 'create project' | 'trello';

type AiPopupProps = {
  aiPopup: boolean;
  onClose: () => void;
  onOpen: () => void;
  projectId: string | string[] | undefined
  members:Member[]
  token?: string | null
};

export const AiPopup = ({ aiPopup, onClose, onOpen,projectId,members,token }: AiPopupProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task>('general');
  const [showMentionDropdown, setShowMentionDropdown] = useState(false);
  const [cursorPosition, setCursorPosition] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const router = useRouter();
  const trelloApiKey = process.env.NEXT_PUBLIC_TRELLO_API
  console.log("Members in AIPOPUP : ",members)
  

  // Mock responses based on task type
  // const getMockResponse = (task: Task, userInput: string) => {
  //   const responses = {
  //     general: `General Assistant: I'll help you with "${userInput}"`,
  //     coding: `Code Assistant: Here's how to solve "${userInput}"`,
  //     writing: `Writing Assistant: Let me help you write "${userInput}"`,
  //     analysis: `Analysis Assistant: Let me analyze "${userInput}"`,
  //   };
  //   return responses[task];
  // };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if(selectedTask === 'trello') {
      setMessages((prev) => [...prev, { sender:'ai',text:'Login to your trello acount' ,button:true,utility:handleTrelloAuth,utilityText:'handleTrelloAuth'}]);
    }
    else{
      setMessages([])
    }
  },[selectedTask])

  useEffect(() => {
    const getTrelloUser = async() => {
      const response = await fetch(`https://api.trello.com/1/members/me/?key=${trelloApiKey}&token=${token}`)
      if(!response.ok) {
        console.log("issue")
        setMessages((prev) => [...prev, { sender: 'ai', text: 'Something went wrong',red:true }]);
      }
      else{
      const data = await response.json()
        setMessages((prev) => [...prev, { sender: 'ai', text: `Hi ${data?.fullName}.Choose what you want to do?` }]);
        setMessages((prev) => [...prev, { sender: 'ai', text: 'Import trello data',button:true,utility:getBoards,utilityText:'getBoards' }]);
      }
    }
    if(token) {
      setSelectedTask('trello')
      getTrelloUser()
    }
    
    if ('webkitSpeechRecognition' in window) {
      const recognition = new (window as any).webkitSpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = false;
      recognition.lang = 'en-IN';

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInput((prev) => prev + transcript);
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
      };

      recognition.onend = () => {
        setIsListening(false);
        console.log('Speech recognition ended.');
        // Auto-send message when voice recording ends
        if (input.trim()) {
          handleSend();
        }
      };

      recognitionRef.current = recognition;
    }
    
  }, []);

  

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newInput = e.target.value;
    setInput(newInput);
    
    const cursorPos = e.target.selectionStart || 0;
    setCursorPosition(cursorPos);
    
    // Show dropdown only when @ is typed and followed by a space
    if (newInput[cursorPos - 1] === '@') {
      setShowMentionDropdown(true);
      return;
    }
    
    // Hide dropdown if space is typed after @
    if (showMentionDropdown && newInput[cursorPos - 1] === ' ') {
      setShowMentionDropdown(false);
    }
  };

  const handleMemberSelect = (member: Member) => {
    const lastAtSymbol = input.lastIndexOf('@', cursorPosition);
    const textBeforeAt = input.slice(0, lastAtSymbol);
    const textAfterCursor = input.slice(cursorPosition);
    const newInput = `${textBeforeAt}@${member.email} ${textAfterCursor}`;
    setInput(newInput);
    setShowMentionDropdown(false);
    
    // Focus input and place cursor after the inserted mention
    if (inputRef.current) {
      inputRef.current.focus();
      const newCursorPos = lastAtSymbol + member.name.length + 2; // +2 for @ and space
      inputRef.current.setSelectionRange(newCursorPos, newCursorPos);
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowMentionDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSend = async() => {
    if (!input.trim()) {
      return;
    };
    console.log("Task : ",selectedTask)
    setMessages((prev) => [...prev, { sender: 'user', text: input }]);
    // const response = getMockResponse(selectedTask, input);
    // setMessages((prev) => [...prev, { sender: 'ai', text: response }]);
    if(selectedTask == 'create task'){
      try{
        setInput('');
        const response = await fetch(`/api/projects/${projectId}/ai/task`,{
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body:JSON.stringify({prompt:input,members})
        })
        const data = await response.json()
        if(!response.ok) {
          setMessages((prev) => [...prev,{sender:'ai',text:data.error,red:true}])
        }
        else {
          setMessages((prev) => [...prev,{sender:'ai',text:data.data}])
        }
      } catch(error) {
          setMessages((prev) => [...prev,{sender:'ai',text:"Something went wrong",red:true}])
      }
    }
    else if(selectedTask == 'general') {
      setInput('');
      try{
        const response = await fetch(`/api/projects/${projectId}/ai/general`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({prompt:input}),
        });

        const data = await response.json()
    
        if (!response.ok) {
          setMessages((prev) => [...prev,{sender:'ai',text:data.error,red:true}])
        }
        else {
          setMessages((prev) => [...prev,{sender:'ai',text:data.data}])        
        }
    
      }catch(error){
        setMessages((prev) => [...prev,{sender:'ai',text:"Something went wrong",red:true}])
      }
    }else if(selectedTask === 'create project'){
      setInput('');
      try{
        const response = await fetch(`/api/projects/${projectId}/ai/project`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({prompt:input}),
        });

        const data = await response.json()
    
        if (!response.ok) {
          setMessages((prev) => [...prev,{sender:'ai',text:data.error,red:true}])
        }
        else {
          setMessages((prev) => [...prev,{sender:'ai',text:data.data}])        
        }
    
      }catch(error){
        setMessages((prev) => [...prev,{sender:'ai',text:"Something went wrong",red:true}])
      }

    }
    else if(selectedTask === 'trello'){

    }

  };

  const handleVoiceInput = (taskType?: Task) => {
    const recognition = recognitionRef.current;
    if (!recognition) {
      console.error('Speech recognition not supported in this browser.');
      return;
    }

    if (isListening) {
      recognition.stop();
      setIsListening(false);
    } else {
      if (taskType) {
        setSelectedTask(taskType);
      }
      recognition.start();
      setIsListening(true);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };
  useEffect(() => {
    const handleKeydown = (event: KeyboardEvent) => {
      if (event.ctrlKey) {
        switch (event.key) {
          case 'l':
            event.preventDefault();
            onOpen()
            handleVoiceInput('create task');
            break;
          case 'q':
            event.preventDefault();
            onOpen()
            handleVoiceInput('general');
            break;
          case 'w':
            event.preventDefault();
            onOpen()
            handleVoiceInput('create project');
            break;
          case 'e':
            event.preventDefault();
            onOpen()
            handleVoiceInput('trello');
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeydown);
    return () => window.removeEventListener('keydown', handleKeydown);
  }, [isListening]);

  if (!aiPopup) return null;

  return (
    <div className="fixed bottom-4 right-4 w-96 rounded-2xl bg-white shadow-2xl border border-gray-200 overflow-hidden">
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-4 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          <h2 className="text-white font-semibold">AI Assistant</h2>
        </div>
        {onClose && (
          <button 
            onClick={onClose}
            className="text-white/80 hover:text-white transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      <div className="p-2 bg-gray-50 border-b border-gray-100">
        <select
          value={selectedTask}
          onChange={(e) => setSelectedTask(e.target.value as Task)}
          className="w-full p-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
        >
          <option value="general">General Help (Ctrl + Q)</option>
          <option value="create task">Create Task (Ctrl + L)</option>
          <option value="create project">Create Project(Ctrl + W)</option>
          <option value="trello">Trello (Ctrl + E)</option>
        </select>
      </div>

      <div className="h-80 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.button ? ( <>
            {msg.utilityText == 'handleTrelloAuth' && (
              <div>
              <Button onClick={() => msg.utility(trelloApiKey,projectId,router)} variant="default">Connect Trello account</Button>
              </div>
            )}
            {msg.utilityText == 'getBoards' && (
              <div>
              <Button onClick={() => msg.utility(trelloApiKey,token,setMessages,messages)} variant="ghost">Import trello data</Button>
              </div>
            )}
            {msg.utilityText == 'getListsFromBoard' && (
              <div onClick={() => msg.utility(trelloApiKey,msg.boardId,token,setMessages)} className="flex items-center space-x-4 p-4 bg-white rounded-lg shadow-lg w-full">
              <div className="w-24 h-24 flex-shrink-0">
                <img src={msg.bgImage} alt="Board Background" className="w-full h-full object-cover rounded-lg" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900">{msg.boardName}</h3>
                <p className="text-sm text-gray-600">{msg.desc}</p>
              </div>
            </div>
            )}
            {msg.utilityText == 'getCardsFromList' && (
              <div onClick={() => msg.utility(trelloApiKey,token,msg.listId,setMessages)} className="flex items-center space-x-4 p-4 bg-white rounded-lg shadow-lg w-full">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900">{msg.listName}</h3>
              </div>
            </div>
            )}

{msg.utilityText == 'cards' && (
  <div className="flex items-center p-3">
    <div className="w-full max-w-md bg-gradient-to-br from-white to-gray-50 hover:from-gray-50 hover:to-gray-100 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100">
      <div className="p-4">
        {/* Header Row */}
        <div className="flex justify-between items-start gap-3 mb-2">
          <div className="flex-1">
            <h3 className="text-base font-medium text-gray-800 line-clamp-1">{msg.cardName}</h3>
            <p className="text-xs text-gray-500 mt-1 line-clamp-2">{msg.cardDesc}</p>
          </div>
          {msg.redirect && (
            <a 
              href={msg.redirect} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          )}
        </div>

        {/* Bottom Row */}
        <div className="flex justify-between items-center mt-3 pt-2 border-t border-gray-100">
          {/* Deadline with icon */}
          <div className="flex items-center text-gray-500">
            <div className="text-xs font-medium bg-gray-50 px-2 py-1 rounded-md">
              {msg.cardDeadline && format(new Date(msg.cardDeadline), 'MMM d, yyyy')}
            </div>
          </div>

          {/* Icons for Actions */}
          <div className="flex items-center gap-3 text-gray-500">
            <button onClick={() => createTaskFromTrello(msg.cardName,msg.cardDesc,msg.cardDeadline,"Medium",msg.members,projectId,setMessages,"todo")} className="p-1 hover:bg-gray-100 rounded-md transition">
              <LayoutList className="w-3 h-3" />
            </button>
            <button onClick={() => createTaskFromTrello(msg.cardName,msg.cardDesc,msg.cardDeadline,"Medium",msg.members,projectId,setMessages,"inprogress")} className="p-1 hover:bg-gray-100 rounded-md transition">
              <NotebookPen className="w-3 h-3" />
            </button>
            <button onClick={() => createTaskFromTrello(msg.cardName,msg.cardDesc,msg.cardDeadline,"Medium",msg.members,projectId,setMessages,"done")} className="p-1 hover:bg-gray-100 rounded-md transition">
              <CheckCircle className="w-3 h-3 text-green-500" />
            </button>
          </div>

          {/* Members Avatar Stack */}
          {msg.members && msg.members.length > 0 && (
            <div className="flex -space-x-2 items-center">
              {msg.members.map((member, index) => (
                <Avatar 
                  key={member.email}
                  className="border-2 border-white w-6 h-6 bg-gray-100 hover:scale-110 transition-transform"
                  title={member.name}
                >
                  <AvatarImage
                    src={member.avatar}
                    alt={member.name}
                    className="object-cover"
                  />
                </Avatar>
              ))}
              
            </div>
          )}
        </div>
      </div>
    </div>
  </div>
)}
           
            </>
            ):(
            <div
              className={`max-w-[80%] break-words px-4 py-2 rounded-2xl shadow-sm
                ${msg.sender === 'user'
                  ? 'bg-blue-600 text-white rounded-br-none' 
                  : msg.red 
                    ? 'bg-red-500 text-white rounded-bl-none' 
                    : 'bg-blue-600 text-white rounded-bl-none'
                }`}
            >
              {msg.text}
            </div>
            )}
            
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 bg-white border-t border-gray-100">
        <div className="flex items-center gap-2 relative">
        <div className="flex-1 relative"> {/* Wrapper div for input and dropdown */}
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              placeholder={`Ask for ${selectedTask} help...`}
              className="w-full px-4 py-2 rounded-full border border-gray-200 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors text-sm"
            />
            
            {showMentionDropdown && (
              <div 
                ref={dropdownRef}
                className="absolute left-0 bottom-full mb-2 w-full bg-white rounded-lg shadow-lg border border-gray-200 z-50"
              >
                {members && members.length > 0 ? (
                  members.map((member) => (
                    <button
                      key={member.id}
                      onClick={() => handleMemberSelect(member)}
                      className="w-full px-4 py-2 text-left hover:bg-gray-50 focus:bg-gray-50 focus:outline-none flex flex-col"
                    >
                      <span className="text-sm font-medium">{member.name}</span>
                      <span className="text-xs text-gray-500">{member.email}</span>
                    </button>
                  ))
                ) : (
                  <div className="px-4 py-2 text-sm text-gray-500">No members available</div>
                )}
              </div>
            )}
          </div>
          <button
            onClick={() => handleVoiceInput()}
            className={`p-2 rounded-full transition-colors ${
              isListening 
                ? 'bg-red-500 hover:bg-red-600' 
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
            title={`${isListening ? 'Stop' : 'Start'} voice input`}
          >
            {isListening ? (
              <MicOff className="w-5 h-5 text-white" />
            ) : (
              <Mic className="w-5 h-5 text-white" />
            )}
          </button>
          
          <button
            onClick={handleSend}
            className="p-2 rounded-full bg-blue-600 hover:bg-blue-700 transition-colors"
            title="Send message (Enter)"
          >
            <Send className="w-5 h-5 text-white" />
          </button>
        </div>
      </div>
    </div>
  );
};