/*
 * Copyright 2025 The Backstage Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import React, { useState } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';

const API_KEY = ''; // Replace with your actual API key

const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

const Chatbot = () => {
  const [messages, setMessages] = useState<{ user: string; ai: string }[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInput(event.target.value);
  };

  const sendMessage = async () => {
    if (!input.trim()) return;

    setMessages(prevMessages => [...prevMessages, { user: input, ai: '' }]); // ✅ Add user input once
    setInput('');
    setIsLoading(true);

    try {
      const result = await model.generateContentStream({
        contents: [{ role: 'user', parts: [{ text: input }] }],
      });

      for await (const chunk of result.stream) {
        const textChunk = chunk.text();
        if (textChunk) {
          // ✅ Safely update only the last AI message
          setMessages(prevMessages =>
            prevMessages.map((msg, index) =>
              index === prevMessages.length - 1
                ? { ...msg, ai: (msg.ai || '') + textChunk } // Append AI response safely
                : msg,
            ),
          );
        }
      }
    } catch (error) {
      // console.error('Error streaming from Gemini AI', error);
      setMessages(prevMessages =>
        prevMessages.map((msg, index) =>
          index === prevMessages.length - 1
            ? { ...msg, ai: 'Error fetching response.' }
            : msg,
        ),
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Chat with Gemini AI</h2>
      <div
        style={{
          height: '300px',
          overflowY: 'auto',
          border: '1px solid #ccc',
          padding: 10,
        }}
      >
        {messages.map((msg, index) => (
          <div key={index} style={{ marginBottom: 10 }}>
            <strong>User:</strong> {msg.user}
            <br />
            <strong>AI:</strong> {msg.ai}
            <br />
          </div>
        ))}
      </div>
      <input
        type="text"
        value={input}
        onChange={handleInputChange}
        placeholder="Ask Gemini AI..."
        style={{ width: '80%', padding: 5, marginTop: 10 }}
      />
      <button
        onClick={sendMessage}
        style={{ marginLeft: 10, padding: 5 }}
        disabled={isLoading}
      >
        {isLoading ? 'Thinking...' : 'Send'}
      </button>
    </div>
  );
};

export default Chatbot;
