'use client';

import { useState, useEffect, useRef } from 'react';
import { Send, Mic, MicOff, X, ChevronDown } from 'lucide-react';

type Message = {
  sender: 'user' | 'ai';
  text: string;
};

type Task = 'general' | 'coding' | 'writing' | 'analysis';

type AiPopupProps = {
  aiPopup: boolean;
  onClose: () => void;
  onOpen: () => void;
};

export const AiPopup = ({ aiPopup, onClose, onOpen }: AiPopupProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task>('general');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  // Mock responses based on task type
  const getMockResponse = (task: Task, userInput: string) => {
    const responses = {
      general: `General Assistant: I'll help you with "${userInput}"`,
      coding: `Code Assistant: Here's how to solve "${userInput}"`,
      writing: `Writing Assistant: Let me help you write "${userInput}"`,
      analysis: `Analysis Assistant: Let me analyze "${userInput}"`,
    };
    return responses[task];
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
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

  const handleSend = () => {
    console.log("hndlesend")
    if (!input.trim()) return;

    setMessages((prev) => [...prev, { sender: 'user', text: input }]);

    setTimeout(() => {
      const response = getMockResponse(selectedTask, input);
      setMessages((prev) => [...prev, { sender: 'ai', text: response }]);
    }, 1000);

    setInput('');
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
            handleVoiceInput('general');
            break;
          case 'q':
            event.preventDefault();
            onOpen()
            handleVoiceInput('coding');
            break;
          case 'w':
            event.preventDefault();
            onOpen()
            handleVoiceInput('writing');
            break;
          case 'e':
            event.preventDefault();
            onOpen()
            handleVoiceInput('analysis');
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
          <option value="general">General Help (Ctrl + L)</option>
          <option value="coding">Coding Help (Ctrl + Q)</option>
          <option value="writing">Writing Help (Ctrl + W)</option>
          <option value="analysis">Analysis Help (Ctrl + E)</option>
        </select>
      </div>

      <div className="h-80 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] break-words px-4 py-2 rounded-2xl shadow-sm
                ${msg.sender === 'user' 
                  ? 'bg-blue-600 text-white rounded-br-none' 
                  : 'bg-white text-gray-800 rounded-bl-none border border-gray-100'
                }`}
            >
              {msg.text}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 bg-white border-t border-gray-100">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={`Ask for ${selectedTask} help...`}
            className="flex-1 px-4 py-2 rounded-full border border-gray-200 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors text-sm"
          />
          
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