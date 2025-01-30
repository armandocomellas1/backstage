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
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
// import useGeminiAI from './startchat';

const API_KEY = 'AIzaSyDPqPJo_bpLJf-r1Da3f4U6qw6GlJ5X4rQ'; // Replace with your actual API key

const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

const Chatbot = () => {
  const [messages, setMessages] = useState<{ user: string; ai: string }[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  // useGeminiAI();

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInput(event.target.value);
  };

  const sendMessage = async () => {
    if (!input.trim()) return;

    // Update the state with the user message immediately
    setMessages(prevMessages => [...prevMessages, { user: input, ai: '' }]);
    setInput('');
    setIsLoading(true);

    try {
      const result = await model.generateContentStream({
        contents: [
          {
            role: 'user',
            parts: [
              {
                text: `${input}\nPlease format any code response using \`\`\`language\n...\n\`\`\` for proper syntax highlighting.`,
              },
            ],
          },
        ],
      });

      let fullResponse = ''; // Accumulate all the chunks here
      const aiMessages: string[] = []; // Array to store chunks temporarily

      for await (const chunk of result.stream) {
        const textChunk = chunk.text();
        if (textChunk) {
          aiMessages.push(textChunk); // Store chunk in array (no immediate state update)

          // Accumulate full response after loop finishes
          fullResponse += textChunk;
        }
      }

      // Update the state once after the loop ends
      setMessages(prevMessages =>
        prevMessages.map((msg, index) =>
          index === prevMessages.length - 1
            ? { ...msg, ai: fullResponse } // Set the entire response at once
            : msg,
        ),
      );
    } catch (error) {
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

  // Styles for Dark Mode
  const styles: any = {
    chatbotContainer: {
      backgroundColor: '#1E1E1E',
      color: '#fff',
      padding: '20px',
      borderRadius: '8px',
      width: '60%',
      margin: '0 auto',
      boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.3)',
    },
    header: {
      textAlign: 'center',
      fontSize: '20px',
      fontWeight: 'bold' as React.CSSProperties['fontWeight'],
      marginBottom: '15px',
    },
    chatBox: {
      height: '300px',
      overflowY: 'auto' as 'auto',
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

  // Function to format AI messages (detects code blocks)
  const renderAIMessage = (message: string) => {
    if (!message) return null;

    const codeRegex = /```(\w+)?\n([\s\S]*?)```/g;
    const parts: (string | JSX.Element)[] = [];
    let lastIndex = 0;
    let match = codeRegex.exec(message); // Initialize match outside the loop
    let index = 0; // To provide unique keys

    while (match !== null) {
      // Use the initialized match directly in the condition
      const [fullMatch, language, code] = match;

      // Push normal text before the code block
      if (match.index > lastIndex) {
        parts.push(
          <p key={`text-${index}`} style={{ whiteSpace: 'pre-wrap' }}>
            {message.slice(lastIndex, match.index)}
          </p>,
        );
      }

      // Detect language (default to YAML if none provided)
      const detectedLanguage = language?.trim() || 'yaml';

      // Push the formatted code block
      parts.push(
        <SyntaxHighlighter
          key={`code-${index}`}
          language={detectedLanguage}
          style={oneDark}
          wrapLongLines
          showLineNumbers // Optional: Adds line numbers for better readability
        >
          {code.trim()}
        </SyntaxHighlighter>,
      );

      lastIndex = match.index + fullMatch.length;
      index++; // Increment index for unique keys

      // Update match with the next regex result
      match = codeRegex.exec(message); // Re-assign inside the loop
    }

    // Push remaining text after the last code block
    if (lastIndex < message.length) {
      parts.push(
        <p key={`text-${index}`} style={{ whiteSpace: 'pre-wrap' }}>
          {message.slice(lastIndex)}
        </p>,
      );
    }

    return <>{parts}</>;
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
              <strong>AI:</strong> {renderAIMessage(msg.ai)}
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
