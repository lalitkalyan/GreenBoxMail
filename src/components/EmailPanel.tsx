"use client";
import React, { useState } from 'react';

const EmailPanel: React.FC = () => {
  const [messages] = useState<any[]>([]);
  const [selectedMessage, setSelectedMessage] = useState<any | null>(null);
  const emailAddress = "temp@example.com"; // placeholder email
  const timeLeft = "10:00"; // placeholder timer

  return (
    <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg shadow-md w-full">
      <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <span className="font-semibold">Current Address:</span>
          <span className="ml-2 font-mono">{emailAddress}</span>
        </div>
        <button className="inline-flex items-center px-3 py-1 text-sm text-white bg-green-600 rounded hover:bg-green-700">
          Copy
        </button>
      </div>
      <div className="mb-4 flex justify-between items-center">
        <div className="text-sm">
          <span className="font-semibold">Expires in:</span> {timeLeft}
        </div>
        <button className="inline-flex items-center px-3 py-1 text-sm text-white bg-green-600 rounded hover:bg-green-700">
          Generate New Email
        </button>
      </div>
      <div className="flex flex-col md:flex-row gap-4">
        <div className="md:w-1/3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded p-2">
          <h2 className="text-sm font-semibold mb-2">Inbox</h2>
          {messages.length === 0 ? (
            <div className="text-gray-500 text-sm">No emails yet.</div>
          ) : (
            <ul className="space-y-1">
              {messages.map((msg, idx) => (
                <li
                  key={idx}
                  className="p-2 border border-gray-200 dark:border-gray-700 rounded cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                  onClick={() => setSelectedMessage(msg)}
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
