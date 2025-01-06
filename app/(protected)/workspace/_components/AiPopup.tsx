'use client';

import { useState, useEffect, useRef } from 'react';

export const AiPopup = () => {
  const [messages, setMessages] = useState([]); // Stores the chat history
  const [input, setInput] = useState(''); // Tracks the user's input
  const [isListening, setIsListening] = useState(false); // Tracks voice recognition state

  const recognitionRef = useRef<SpeechRecognition | null>(null); // Persistent reference

  // Initialize Speech Recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window) {
      const recognition = new (window as any).webkitSpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = false;
      recognition.lang = 'en-IN';

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        const transcript = event.results[0][0].transcript;
        setInput((prev) => prev + transcript);
      };

      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
      };

      recognition.onend = () => {
        setIsListening(false);
        console.log('Speech recognition ended.');
      };

      recognitionRef.current = recognition;
    }
  }, []);

  const handleSend = () => {
    if (!input.trim()) return;

    // Add user message to chat
    setMessages((prev) => [...prev, { sender: 'user', text: input }]);

    // Simulate AI response (replace this with actual API call to your AI backend)
    setTimeout(() => {
      setMessages((prev) => [...prev, { sender: 'ai', text: `AI Response to: "${input}"` }]);
    }, 1000);

    setInput('');
  };

  const handleVoiceInput = () => {
    const recognition = recognitionRef.current;
    if (!recognition) {
      console.error('Speech recognition not supported in this browser.');
      return;
    }

    if (isListening) {
      recognition.stop();
      setIsListening(false);
    } else {
      recognition.start();
      setIsListening(true);
    }
  };

  // Listen for Ctrl + J keyboard shortcut to toggle listening
  useEffect(() => {
    const handleKeydown = (event: KeyboardEvent) => {
      if (event.ctrlKey && event.key === 'j') {
        event.preventDefault(); // Prevent default behavior for Ctrl + J
        handleVoiceInput();
      }
    };

    window.addEventListener('keydown', handleKeydown);

    // Cleanup event listener on component unmount
    return () => {
      window.removeEventListener('keydown', handleKeydown);
    };
  }, [isListening]);

  return (
    <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 border-2 border-blue-500 shadow-lg p-4 w-[300px] rounded-lg bg-white z-50">
      <div className="max-h-[300px] overflow-y-auto mb-4">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`my-2 text-${msg.sender === 'user' ? 'right' : 'left'}`}
          >
            <span
              className={`inline-block px-3 py-2 rounded-full ${msg.sender === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-black'}`}
            >
              {msg.text}
            </span>
          </div>
        ))}
      </div>

      <div className="flex items-center">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message"
          className="flex-1 p-2 rounded-md border border-gray-300"
        />
        <button onClick={handleSend} className="ml-2 p-2 px-4">
          Send
        </button>
        <button
          onClick={handleVoiceInput}
          className={`ml-2 p-2 px-4 ${isListening ? 'bg-red-500' : 'bg-green-500'} text-white rounded-md`}
        >
          {isListening ? 'Stop' : 'Voice'}
        </button>
      </div>
    </div>
  );
};
