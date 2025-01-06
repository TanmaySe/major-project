// AiPopup.tsx
'use client';

import { useState, useEffect } from 'react';

export const AiPopup = () => {
  const [messages, setMessages] = useState([]); // Stores the chat history
  const [input, setInput] = useState(''); // Tracks the user's input
  const [isListening, setIsListening] = useState(false); // Tracks voice recognition state

  let recognition: SpeechRecognition | null = null;

  // Initialize Speech Recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window) {
      recognition = new (window as any).webkitSpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        const transcript = event.results[0][0].transcript;
        setInput((prev) => prev + transcript);
      };

      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
      };

      recognition.onend = () => {
        setIsListening(false);
      };
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

  return (
    <div style={{
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        border: '2px solid #007bff',
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
        padding: '16px',
        width: '300px',
        borderRadius: '8px',
        backgroundColor: '#fff',
        zIndex: 1000,
      }}>
      <div style={{ maxHeight: '300px', overflowY: 'auto', marginBottom: '16px' }}>
        {messages.map((msg, index) => (
          <div
            key={index}
            style={{
              textAlign: msg.sender === 'user' ? 'right' : 'left',
              margin: '8px 0',
            }}
          >
            <span
              style={{
                display: 'inline-block',
                padding: '8px 12px',
                borderRadius: '12px',
                backgroundColor: msg.sender === 'user' ? '#007bff' : '#f1f1f1',
                color: msg.sender === 'user' ? '#fff' : '#000',
              }}
            >
              {msg.text}
            </span>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', alignItems: 'center' }}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message"
          style={{ flex: 1, padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
        />
        <button onClick={handleSend} style={{ marginLeft: '8px', padding: '8px 12px' }}>
          Send
        </button>
        <button
          onClick={handleVoiceInput}
          style={{ marginLeft: '8px', padding: '8px 12px', backgroundColor: isListening ? '#f44336' : '#4caf50', color: '#fff', border: 'none', borderRadius: '4px' }}
        >
          {isListening ? 'Stop' : 'Voice'}
        </button>
      </div>
    </div>
  );
};
