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

  const styles: any = {
    chatbotContainer: {
      backgroundColor: '#1E1E1E',
      color: '#fff',
      padding: '20px',
      borderRadius: '8px',
      width: '400px',
      margin: '0 auto',
      boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.3)',
    },
    header: {
      textAlign: 'center',
      fontSize: '20px',
      fontWeight: 'bold' as React.CSSProperties['fontWeight'], // Cast to the correct type
      marginBottom: '15px',
    },
    chatBox: {
      height: '300px',
      overflowY: 'auto' as 'auto', // Casting to 'auto' for TypeScript compatibility
      border: '1px solid #444',
      borderRadius: '6px',
      padding: '10px',
      backgroundColor: '#2A2A2A',
    },
    messageContainer: {
      marginBottom: '10px',
    },
    userMessage: {
      backgroundColor: '#4CAF50',
      color: '#fff',
      padding: '8px',
      borderRadius: '5px',
      marginBottom: '5px',
      maxWidth: '80%',
      wordWrap: 'break-word',
      fontSize: '14px',
    },
    aiMessage: {
      backgroundColor: '#444',
      color: '#fff',
      padding: '8px',
      borderRadius: '5px',
      marginBottom: '5px',
      maxWidth: '80%',
      wordWrap: 'break-word',
      fontSize: '14px',
    },
    inputContainer: {
      display: 'flex',
      marginTop: '15px',
    },
    inputField: {
      flex: 1,
      padding: '10px',
      backgroundColor: '#333',
      color: '#fff',
      border: 'none',
      borderRadius: '4px',
      fontSize: '14px',
      marginRight: '10px',
    },
    sendButton: {
      backgroundColor: '#4CAF50',
      color: '#fff',
      padding: '10px 15px',
      border: 'none',
      borderRadius: '4px',
      cursor: 'pointer',
      fontSize: '14px',
    },
  };

  return (
    <div style={styles.chatbotContainer}>
      <h2 style={styles.header}>Chat with Gemini AI</h2>
      <div style={styles.chatBox}>
        {messages.map((msg, index) => (
          <div key={index} style={styles.messageContainer}>
            <div style={styles.userMessage}>
              <strong>User:</strong> {msg.user}
            </div>
            <div style={styles.aiMessage}>
              <strong>AI:</strong> {msg.ai}
            </div>
          </div>
        ))}
      </div>
      <div style={styles.inputContainer}>
        <input
          type="text"
          value={input}
          onChange={handleInputChange}
          placeholder="Ask Gemini AI..."
          style={styles.inputField}
        />
        <button
          onClick={sendMessage}
          style={styles.sendButton}
          disabled={isLoading}
        >
          {isLoading ? 'Thinking...' : 'Send'}
        </button>
      </div>
    </div>
  );
};

export default Chatbot;
