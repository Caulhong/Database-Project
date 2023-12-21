import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './loginPage.css';


const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const navigate = useNavigate();

  const handleLogin = (event) => {
    event.preventDefault();
    const url = 'http://localhost:8080/login.php';

    fetch(url, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    })
    .then(response => response.json()) 
    .then(data => {
      if (data.success) {
        navigate('/show', { 
          state: { 
            username: username
          } 
        } );
        console.log('Login successful');
      } else {
        console.log('Login failed:', data.message);
        setLoginError(data.message); 
      }
    })
    .catch(error => {
      console.error('Error during fetch operation:', error);
      setLoginError('Error during fetch operation');
    });
  };

  const handleRegister = (event) => {
    navigate('/register');
  };

  

  return (
    <div className="login-container">
      <h2>Login</h2>
      {loginError && <p className="error-message">{loginError}</p>}
      <form onSubmit={handleLogin} className="login-form">
        <div>
          <label>Username:</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>
        <div>
          <label>Password:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <button type="submit">Login</button>
      </form>
      <form  onSubmit={handleRegister} className="login-form">
        <button type="submit">Register</button>
      </form>
    </div>
  );
  
};

export default LoginPage;
