import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './loginPage.css';


const Register = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [billingAddress, setBillingAddress] = useState('');
  const [registrationError, setRegistrationError] = useState('');
  const navigate = useNavigate();


  const handleRegistration = (event) => {
    event.preventDefault();
    const url = 'http://localhost:8080/register.php';
  
    fetch(url, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        username, 
        name,
        billingAddress, 
        password 
      }),
    })
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        alert('Registration successful')
        navigate('/');  
        console.log('Registration successful');
      } else {
        console.log('Registration failed:', data.error);
        setRegistrationError(data.error); 
      }
    })
    .catch(error => {
      console.error('Error during fetch operation:', error);
      setRegistrationError('Error during fetch operation'); 
    });
  };
  

  

  return (
    <div className="login-container">
      <h2>Login</h2>
      {registrationError && <p className="error-message">{registrationError}</p>}
      <form onSubmit={handleRegistration} className="login-form">
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
        <div>
          <label>Name:</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div>
          <label>Billing Address:</label>
          <input
            type="text"
            value={billingAddress}
            onChange={(e) => setBillingAddress(e.target.value)}
          />
        </div>
        <button type="submit">Register</button>
      </form>
    </div>
  );
  
};

export default Register;
