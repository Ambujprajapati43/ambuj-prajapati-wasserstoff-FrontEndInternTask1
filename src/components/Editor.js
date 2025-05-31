import React, { useState, useEffect } from 'react';
import peerManager from '../lib/peerManager';

const Editor = ({ userName, onLogout }) => {
  const [content, setContent] = useState('Start typing here...');
  const [users, setUsers] = useState([]);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    
    peerManager.initialize(
      (newContent) => {
        setContent(newContent);
      },
      (userList) => {
        setUsers(userList);
      }
    );

   
    peerManager.peer?.on('open', (id) => {
      setUserId(id);
      console.log('Local peer opened with ID:', id);
    });

    
    const urlParams = new URLSearchParams(window.location.search);
    const connectTo = urlParams.get('connectTo');

    if (connectTo) {
   
      setTimeout(() => {
        console.log('Attempting to connect to peer:', connectTo);
        peerManager.connectToPeer(connectTo);
      }, 1000);
    }

    return () => {
      
      if (peerManager.peer && !peerManager.peer.destroyed) {
        peerManager.peer.destroy();
      }
    };
  }, [userName]);

  const handleContentChange = (e) => {
    const newContent = e.target.value;
    setContent(newContent);
    peerManager.broadcastContent(newContent);
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      <div className="bg-blue-600 text-white p-4">
        <h1 className="text-xl font-bold">Collaborative Editor</h1>
        <div className="flex justify-between items-center mt-2">
          <div className="flex items-center">
            <span className="mr-2">Logged in as:</span>
            <span className="font-semibold">{userName}</span>
            {userId && (
              <span className="ml-2 text-xs">(ID: {userId.slice(0, 8)})</span>
            )}
          </div>
          <button
            onClick={onLogout}
            className="px-3 py-1 bg-blue-800 rounded hover:bg-blue-900"
          >
            Logout
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <div className="w-64 bg-gray-200 p-4 overflow-y-auto">
          <h2 className="font-bold mb-4">Connected Users</h2>
          <ul>
            {users.map((user) => (
              <li key={user.id} className="mb-2 flex items-center">
                <span
                  className={`inline-block w-3 h-3 rounded-full mr-2 ${
                    user.id === userId ? 'bg-blue-500' : 'bg-green-500'
                  }`}
                ></span>
                {user.name}
                {user.id === userId && ' (You)'}
              </li>
            ))}
          </ul>
          <div className="mt-4 text-sm">
            <p>Share this ID to connect:</p>
            <code className="bg-gray-300 p-1 rounded break-all">
              {userId}
            </code>
          </div>
        </div>

        <div className="flex-1 p-4">
          <div className="bg-white rounded shadow p-4 h-full">
            <textarea
              className="w-full h-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={content}
              onChange={handleContentChange}
              placeholder="Start typing here..."
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Editor;

