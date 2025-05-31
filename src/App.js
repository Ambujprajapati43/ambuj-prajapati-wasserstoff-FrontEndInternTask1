import React, { useState, useEffect } from 'react';
import Login from './components/Login';
import Editor from './components/Editor';

function App() {
  const [user, setUser] = useState(null);

  const handleLogin = (userName) => {
   
    let userId = localStorage.getItem('userId');
    if (!userId) {
      userId = `user-${Math.random().toString(36).substring(2, 10)}`;
      localStorage.setItem('userId', userId);
    }

    setUser({ name: userName, id: userId });
  };

  const handleLogout = () => {
    setUser(null);
  };

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  return <Editor userName={user.name} userId={user.id} onLogout={handleLogout} />;
}

export default App;
