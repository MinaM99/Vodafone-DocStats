import React, { useState } from 'react';
import './LoginPage.css';
import config from './../data/config.json';

const LoginPage = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false); // Loading state

  const handleLogin = async (e) => {
    e.preventDefault();
    
    setIsLoading(true); // Set loading to true before making the request
    setError(''); // Clear any previous error message when login starts

    const loginUrl = `${config.documentumUrl}/dctm-rest/repositories/${config.repositoryName}`;
    console.log(username, password);
    try {
      const response = await fetch(loginUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Basic ${btoa(`${username}:${password}`)}`, // Base64 encode credentials
          'DOCUMENTUM-CUSTOM-UNAUTH-SCHEME': true, // Ensure string value
        },
        credentials: 'include' // Include cookies in the request
      });
      
      if (!response.ok) {
        // Handle HTTP errors
        const errorText = await response.text();
        throw new Error(`Login failed: ${errorText}`);
      }

      console.log('Response Headers:');
      response.headers.forEach((value, name) => {
        console.log(`${name}: ${value}`);
      });

      // Assuming token is in response headers (replace with actual header key)
      const token = response.headers.get('dctmclienttoken'); // Example: Replace with your actual token header key

      if (token) {
        // Store the token in sessionStorage
        sessionStorage.setItem('dctmclienttoken', token); 
        // Pass the token to the parent component (App.js)
        onLogin(token);
      }

      console.log('Login successful');
    } catch (err) {
      console.error('Login error:', err);
      setError('Invalid username or password. Please try again.');
    } finally {
      setIsLoading(false); // Set loading to false after the request is finished (either success or error)
    }
  };

  return (
    <div className="login-page">
      <h1 className="login-title">Vodafone Documentum Statistics</h1>
      <form onSubmit={handleLogin} className="login-form">
        <div className="input-group">
          <label htmlFor="username">Username</label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            disabled={isLoading} // Disable input while loading
          />
        </div>
        <div className="input-group">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={isLoading} // Disable input while loading
          />
        </div>
        {error && <p className="error-message">{error}</p>}  {/* Display error message */}

        {isLoading ? (
          <div className="loading-spinner">
            <div className="spinner"></div> {/* Add a loading spinner */}
            <p>Logging in...</p>
          </div>
        ) : (
          <button type="submit" className="login-button">Login</button>
        )}
      </form>
    </div>
  );
};

export default LoginPage;
