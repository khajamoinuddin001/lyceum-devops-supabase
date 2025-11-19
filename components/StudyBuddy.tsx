
import React, { useState, useEffect, useRef } from 'react';
import type { ChatMessage } from '../types';
import { sendMessageToAI, startChatSession } from '../services/geminiService';
import { SparklesIcon } from './icons/SparklesIcon';

export const StudyBuddy: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    startChatSession();
    setMessages([
      {
        role: 'model',
        parts: [{ text: "Hello! I'm your Study Buddy. Ask me anything about your courses!" }],
      },
    ]);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (input.trim() === '' || isLoading) return;

    const userMessage: ChatMessage = { role: 'user', parts: [{ text: input }] };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const stream = await sendMessageToAI(input);
      let newModelMessage: ChatMessage = { role: 'model', parts: [{ text: '' }] };
      setMessages(prev => [...prev, newModelMessage]);
      
      for await (const chunk of stream) {
        const chunkText = chunk.text;
        if (chunkText) {
          newModelMessage.parts[0].text += chunkText;
          setMessages(prev => [...prev.slice(0, -1), { ...newModelMessage }]);
        }
      }
    } catch (error: any) {
      console.error('Error sending message:', error);
      const errorMessageText = error.message || 'Sorry, I encountered an error. Please try again.';
      const errorMessage: ChatMessage = {
        role: 'model',
        parts: [{ text: errorMessageText }],
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };
  
  return (
    <div className="flex flex-col h-[calc(100vh-10rem)] bg-white dark:bg-gray-800 rounded-lg shadow">
      <div className="p-4 border-b dark:border-gray-700 flex items-center">
        <SparklesIcon className="w-6 h-6 text-primary-500 mr-2" />
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Study Buddy</h2>
      </div>
      <div className="flex-grow p-4 overflow-y-auto space-y-4">
        {messages.map((msg, index) => (
          <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-xs md:max-w-md lg:max-w-lg px-4 py-2 rounded-xl ${
              msg.role === 'user' 
                ? 'bg-primary-500 text-white' 
                : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white'
            }`}>
              <p className="whitespace-pre-wrap">{msg.parts[0].text}</p>
            </div>
          </div>
        ))}
        {isLoading && messages[messages.length-1].role === 'user' && (
             <div className="flex justify-start">
                <div className="bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white px-4 py-2 rounded-xl">
                    <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-gray-500 rounded-full animate-pulse"></div>
                        <div className="w-2 h-2 bg-gray-500 rounded-full animate-pulse delay-75"></div>
                        <div className="w-2 h-2 bg-gray-500 rounded-full animate-pulse delay-150"></div>
                    </div>
                </div>
            </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <div className="p-4 border-t dark:border-gray-700 flex items-center">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Ask a question..."
          className="flex-grow px-4 py-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          disabled={isLoading}
        />
        <button
          onClick={handleSend}
          disabled={isLoading}
          className="ml-3 bg-primary-600 text-white p-2 rounded-full hover:bg-primary-700 disabled:bg-primary-300 disabled:cursor-not-allowed transition-colors"
        >
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
        </button>
      </div>
    </div>
  );
};
