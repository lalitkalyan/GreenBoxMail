"use client";

import React, { useState, useEffect } from 'react';

interface Message {
  id: string;
  from: string;
  subject: string;
  body: string;
}

const EmailPanel: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [emailAddress, setEmailAddress] = useState<string>('');
  const [jwt, setJwt] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const generateRandomString = (length: number) => {
    return Math.random().toString(36).substring(2, 2 + length);
  };

  const createMailbox = async () => {
    setLoading(true);
    try {
      const domainRes = await fetch('https://api.mail.tm/domains');
      const domainData = await domainRes.json();
      const domains = domainData['hydra:member'];
      const domain = domains && domains.length > 0 ? domains[0].domain : 'mail.tm';
      const localPart = generateRandomString(10);
      const address = `${localPart}@${domain}`;
      const password = generateRandomString(12);

      await fetch('https://api.mail.tm/accounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address, password }),
      });

      const tokenRes = await fetch('https://api.mail.tm/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address, password }),
      });
      const tokenData = await tokenRes.json();
      setJwt(tokenData.token);
      setEmailAddress(address);
      setMessages([]);
      setSelectedMessage(null);
    } catch (error) {
      console.error('Error creating mailbox:', error);
    } finally {
      setLoading(false);
    }
  };

  // create mailbox on mount
  useEffect(() => {
    createMailbox();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // poll messages every 5 seconds when jwt is available
  useEffect(() => {
    if (!jwt) return;
    const fetchMessages = async () => {
      try {
        const res = await fetch('https://api.mail.tm/messages', {
          headers: {
            Authorization: `Bearer ${jwt}`,
          },
        });
        const data = await res.json();
        const msgs = data['hydra:member'] || [];
        setMessages(
          msgs.map((m: any) => ({
            id: m.id,
            from: m.from?.address || m.from?.name || '',
            subject: m.subject || '',
            body: '',
          }))
        );
      } catch (error) {
        console.error('Error fetching messages:', error);
      }
    };
    fetchMessages();
    const interval = setInterval(fetchMessages, 5000);
    return () => clearInterval(interval);
  }, [jwt]);

  // function to view full message
  const viewMessage = async (msg: Message) => {
    if (!jwt) return;
    try {
      const res = await fetch(`https://api.mail.tm/messages/${msg.id}`, {
        headers: { Authorization: `Bearer ${jwt}` },
      });
      const detail = await res.json();
      setSelectedMessage({
        id: msg.id,
        from: msg.from,
        subject: msg.subject,
        body: detail.text || detail.html || '',
      });
    } catch (error) {
      console.error('Error fetching message:', error);
    }
  };

  return (
    <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg shadow-md w-full">
      <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <span className="font-semibold">Current Address:</span>
          <span className="ml-2 font-mono">{emailAddress || '...'}</span>
        </div>
        <button
          className="inline-flex items-center px-3 py-1 text-sm text-white bg-green-600 rounded hover:bg-green-700 disabled:opacity-50"
          onClick={() => {
            if (emailAddress) navigator.clipboard.writeText(emailAddress);
          }}
          disabled={!emailAddress}
        >
          Copy
        </button>
      </div>
      <div className="mb-4 flex justify-between items-center">
        <div className="text-sm">
          <span className="font-semibold">Expires in:</span> 10:00
        </div>
        <button
          className="inline-flex items-center px-3 py-1 text-sm text-white bg-green-600 rounded hover:bg-green-700 disabled:opacity-50"
          onClick={createMailbox}
          disabled={loading}
        >
          {loading ? 'Generating...' : 'Generate New Email'}
        </button>
      </div>
      <div className="flex flex-col md:flex-row gap-4">
        <div className="md:w-1/3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded p-2">
          <h2 className="text-sm font-semibold mb-2">Inbox</h2>
          {messages.length === 0 ? (
            <div className="text-gray-500 text-sm">No emails yet.</div>
          ) : (
            <ul className="space-y-1">
              {messages.map((msg) => (
                <li
                  key={msg.id}
                  className="p-2 border border-gray-200 dark:border-gray-700 rounded cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                  onClick={() => viewMessage(msg)}
                >
                  <div className="text-sm font-medium">{msg.subject || 'No Subject'}</div>
                  <div className="text-xs text-gray-500">{msg.from}</div>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="md:flex-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded p-2">
          <h2 className="text-sm font-semibold mb-2">Message</h2>
          {selectedMessage ? (
            <div className="text-sm whitespace-pre-wrap">{selectedMessage.body || 'No content'}</div>
          ) : (
            <div className="text-gray-500 text-sm">Select an email to view message.</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmailPanel;
