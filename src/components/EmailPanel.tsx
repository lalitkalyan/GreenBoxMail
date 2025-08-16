"use client";

import React, { useState, useEffect, useRef } from 'react';

interface Message {
  id: string;
  from: string;
  subject: string;
  body: string;
}

const EmailPanel: React.FC = () => {
  const [emailAddress, setEmailAddress] = useState<string | null>(null);
  const [jwt, setJwt] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [timeLeft, setTimeLeft] = useState<number>(600); // 10 minutes (600 seconds)
  const pollingRef = useRef<NodeJS.Timeout | null>(null);
  const timerRef   = useRef<NodeJS.Timeout | null>(null);

  // Generate a random string for mailbox credentials
  const randomString = (length: number) => {
    return Math.random().toString(36).substring(2, 2 + length);
  };

  // Create a new mailbox, set token and reset timer
  const createMailbox = async () => {
    try {
      setLoading(true);

      // Clear any existing intervals/timers
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      setTimeLeft(600);
      setMessages([]);
      setSelectedMessage(null);

      // Get available domain
      const domainRes  = await fetch('https://api.mail.tm/domains');
      const domainData = await domainRes.json();
      const domains    = domainData['hydra:member'];
      const domain     = domains && domains.length > 0 ? domains[0].domain : 'mail.tm';
      const localPart  = randomString(10);
      const address    = `${localPart}@${domain}`;
      const password   = randomString(12);

      // Create an account
      await fetch('https://api.mail.tm/accounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address, password }),
      });

      // Request token
      const tokenRes  = await fetch('https://api.mail.tm/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address, password }),
      });
      const tokenData = await tokenRes.json();
      setJwt(tokenData.token);
      setEmailAddress(address);

      setLoading(false);
    } catch (error) {
      console.error('Error creating mailbox', error);
      setLoading(false);
    }
  };

  // Fetch list of messages
  const fetchMessages = async (auth: string) => {
    try {
      const res  = await fetch('https://api.mail.tm/messages', {
        headers: { Authorization: `Bearer ${auth}` },
      });
      const data = await res.json();
      const msgs = data['hydra:member'].map((m: any) => ({
        id: m.id,
        from: m.from?.address || '',
        subject: m.subject || '(no subject)',
        body: '',
      }));
      setMessages(msgs);
    } catch (error) {
      console.error('Error fetching messages', error);
    }
  };

  // Fetch full message content
  const viewMessage = async (id: string, auth: string) => {
    try {
      const res  = await fetch(`https://api.mail.tm/messages/${id}`, {
        headers: { Authorization: `Bearer ${auth}` },
      });
      const data = await res.json();
      setSelectedMessage({
        id: data.id,
        from: data.from?.address || '',
        subject: data.subject || '(no subject)',
        body: data.text || data.intro || '',
      });
    } catch (error) {
      console.error('Error fetching message', error);
    }
  };

  // Create mailbox on component mount
  useEffect(() => {
    createMailbox();
  }, []);

  // Start polling when token is available
  useEffect(() => {
    if (jwt) {
      // Fetch immediately then poll
      fetchMessages(jwt);
      const interval = setInterval(() => {
        fetchMessages(jwt);
      }, 5000);
      pollingRef.current = interval;
      return () => clearInterval(interval);
    }
  }, [jwt]);

  // Countdown timer
  useEffect(() => {
    if (timeLeft <= 0) {
      if (pollingRef.current) clearInterval(pollingRef.current);
      if (timerRef.current)   clearInterval(timerRef.current);
      setEmailAddress(null);
      setJwt(null);
      return;
    }
    const t = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);
    timerRef.current = t;
    return () => clearInterval(t);
  }, [timeLeft]);

  const handleNewEmail = () => {
    createMailbox();
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  return (
    <div className="p-4 bg-white dark:bg-gray-900 rounded-lg shadow-md flex flex-col md:flex-row gap-4">
      <div className="flex-1">
        <div className="flex items-center justify-between mb-2">
          <div className="flex flex-col">
            <span className="text-sm text-gray-600 dark:text-gray-300">Your temporary email</span>
            <span className="text-lg font-mono font-semibold text-green-600 dark:text-green-400">
              {emailAddress || 'Generating...'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                if (emailAddress) {
                  navigator.clipboard.writeText(emailAddress);
                }
              }}
              className="px-3 py-1 text-sm bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 rounded hover:bg-green-200 dark:hover:bg-green-800"
              disabled={!emailAddress}
            >
              Copy
            </button>
            <button
              onClick={handleNewEmail}
              className="px-3 py-1 text-sm bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded hover:bg-blue-200 dark:hover:bg-blue-800"
            >
              Generate New Email
            </button>
          </div>
        </div>
        <div className="mb-4">
          <span className="text-sm text-gray-600 dark:text-gray-300">Time left:</span>{' '}
          <span className="font-mono">{formatTime(timeLeft)}</span>
        </div>
        <div className="border rounded p-2 h-64 overflow-y-auto mb-4">
          {messages.length === 0 && <p className="text-sm text-gray-500">No messages yet.</p>}
          <ul>
            {messages.map((msg) => (
              <li
                key={msg.id}
                className={`p-2 border-b cursor-pointer ${
                  selectedMessage?.id === msg.id ? 'bg-green-100 dark:bg-green-800' : ''
                }`}
                onClick={() => {
                  if (jwt) {
                    viewMessage(msg.id, jwt);
                  }
                }}
              >
                <p className="font-semibold">{msg.subject}</p>
                <p className="text-xs text-gray-500">{msg.from}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="flex-1 border rounded p-2 h-72 overflow-y-auto">
        {selectedMessage ? (
          <div>
            <h3 className="font-semibold mb-2">{selectedMessage.subject}</h3>
            <p className="text-xs text-gray-500 mb-2">From: {selectedMessage.from}</p>
            <pre className="whitespace-pre-wrap text-sm">{selectedMessage.body}</pre>
          </div>
        ) : (
          <p className="text-sm text-gray-500">Select a message to view its content.</p>
        )}
      </div>
    </div>
  );
};

export default EmailPanel;
