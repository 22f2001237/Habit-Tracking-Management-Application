import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';

const Login = () => {
  const [email ,setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:8080/habit/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password }),
      });
      if (response.ok) {
        navigate(`/dashboard/${email}`); // Pass username as a URL parameter
      } else {
        setError('Invalid username or password.');
      }
    } catch (error) {
      console.error('Error logging in:', error);
      setError('Error connecting to server.');
    }
  };

  return (
    <div className="login-page"> {/* Apply specific class for login page */}
      <div className="page-container">
          <div className="left-login-section">
              <h1>HABIT TRACKER</h1>
              <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Temporibus, expedita iusto veniam atque, magni tempora mollitia dolorum consequatur nulla, neque debitis eos reprehenderit quasi ab ipsum nisi dolorem modi. Quos?</p>
             
          </div>
          <div className="right-login-section">
              <form onSubmit={handleSubmit} className="login-form">
                  <h2>Login</h2>
                  {error && <p className="error">{error}</p>}
                  <div className="form-group">
                      <label htmlFor="username">Username</label>
                      <input
                          type="email"
                          id="username"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                      />
                  </div>
                  <div className="form-group">
                      <label htmlFor="password">Password</label>
                      <input
                          type="password"
                          id="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                      />
                  </div>
                  
                  <button type="submit">Login</button>
                  
              </form>

              <p className="already-user-text">New user? <a href="/register">Create Account</a></p>
          </div>
      </div>
    </div>
  );
};

export default Login;
