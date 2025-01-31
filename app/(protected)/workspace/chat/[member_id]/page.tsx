'use client';
import { useParams, useSearchParams } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import crypto from 'crypto';
import { useUser } from '@clerk/clerk-react';

const ChatPage = () => {
    const { user } = useUser();
  const { member_id } = useParams();
  const searchParams = useSearchParams();
  const memberName = searchParams.get('name'); // Get member name from URL

  // State for storing messages and the new message
  const [messages, setMessages] = useState<{ sender_id: string; text: string }[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  // Hash current user email or ID here
  const currentUserHashedId = crypto.createHash('sha256').update(user?.emailAddresses[0].emailAddress).digest('hex');  

  // Fetch messages when component loads
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await fetch(`/api/chat/${member_id}`);
        const data = await response.json();
        if (data?.data) {
          setMessages(data.data);
        }
      } catch (error) {
        console.error('Error fetching messages:', error);
      }
    };

    fetchMessages();
  }, [member_id]);

  // Scroll to the latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle sending a new message
  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    const newChat = { sender_id: currentUserHashedId, text: newMessage };
    setMessages((prev) => [...prev, newChat]);
    setNewMessage('');

    try {
      await fetch(`/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: newMessage, receiver: member_id }),
      });
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      {/* Chat Header */}
      <div className="bg-blue-600 text-white text-lg font-semibold p-4 flex items-center">
        {memberName ? memberName : 'Loading...'}
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`p-2 max-w-xs rounded-lg ${
              msg.sender_id === currentUserHashedId ? 'bg-blue-500 text-white ml-auto' : 'bg-gray-200 text-gray-800'
            }`}
          >
            {msg.text}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Chat Input Bar */}
      <div className="p-3 bg-white border-t flex items-center gap-2">
        <Input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          className="flex-1 p-2 border rounded-md"
          placeholder="Type a message..."
        />
        <Button onClick={sendMessage} className="bg-blue-600 text-white px-4 py-2">
          Send
        </Button>
      </div>
    </div>
  );
};

export default ChatPage;
