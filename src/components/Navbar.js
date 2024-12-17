import React, { useState } from 'react';
import './Navbar.css'; // Import CSS for styling
import UserIcon from './../assets/user-icon.png';
import VodafoneIcon from './../assets/vodafone-icon.png';
import config from './../data/config.json'; // Import config file

const Navbar = ({ username }) => {
  // State for showing the logout confirmation popup
  const [showLogoutPopup, setShowLogoutPopup] = useState(false);

  // Retrieve the client token from sessionStorage
  const clientToken = sessionStorage.getItem('dctmclientToken');

  // URL for logout endpoint
  const logoutUrl = `${config.documentumUrl}/dctm-rest/logout`;

  // Common headers for API requests
  const headers = { DCTMClientToken: clientToken };

  // Helper function to redirect to the login page
 

  // Function to handle user logout
  const handleLogout = async () => {
    try {
      const response = await fetch(logoutUrl, {
        method: 'GET',
        headers: headers,
        credentials: 'include', // Include cookies with the request
      });

      if (response.ok) {
        console.log('User logged out successfully');
        sessionStorage.clear(); // Clear session data
        window.location.href = '/Vodafone-DocStats'; // Redirect to login page
      } else {
        console.error('Failed to log out', response.status);
      }
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  // Function to validate the token and redirect based on its status
  const checkAuthenticationAndRedirect = async () => {
    if (!clientToken) {
      // If no token is found, redirect to the login page
      console.log('No token found, redirecting to login page');
      window.location.href = '/Vodafone-DocStats';
      return;
    }

    try {
      // Validate the token by making a request to the repository endpoint
      const response = await fetch(`${config.documentumUrl}/dctm-rest/repositories/${config.repositoryName}`, {
        method: 'GET',
        headers: headers,
        credentials: 'include',
      });

      if (response.ok) {
        // If the token is valid, refresh the current page
        console.log('Token is valid, refreshing page');
        window.location.href = '/Vodafone-DocStats';
      } else {
        // If the token is invalid, clear the session and redirect to login
        console.error('Token is invalid, redirecting to login');
        sessionStorage.removeItem('dctmclientToken');
        window.location.href = '/Vodafone-DocStats';
      }
    } catch (error) {
      // On error, assume the token is invalid and redirect to login
      console.error('Error validating token:', error);
      sessionStorage.removeItem('dctmclientToken');
      window.location.href = '/Vodafone-DocStats';
    }
  };

  // Toggle the logout confirmation popup
  const toggleLogoutPopup = () => setShowLogoutPopup(!showLogoutPopup);

  return (
    <nav className="navbar">
      {/* Logo Section: Click triggers token validation */}
      <div className="navbar-logo">
      <a href="#" onClick={(e) => { e.preventDefault(); checkAuthenticationAndRedirect(); }}>
          <img src={VodafoneIcon} alt="Vodafone Logo" className="vodafone-icon" />
        </a>
      </div>

      {/* Navigation Links */}
      <ul className="navbar-links">
        <li><a href="#home">Home</a></li>
        <li><a href="#services">Services</a></li>
        <li><a href="#about">About</a></li>
      </ul>

      {/* User and Logout Section */}
      <div className="logout-container">
        {/* Display the logged-in user's name */}
        <span className="username">{username}</span>

        {/* User Icon: Click triggers logout confirmation popup */}
        <img 
          src={UserIcon} 
          alt="Logout" 
          className="logout-icon" 
          onClick={toggleLogoutPopup} 
        />

        {/* Logout Confirmation Popup */}
        {showLogoutPopup && (
          <div className="logout-popup">
            <p>Are you sure you want to logout?</p>
            <button className="logout-yes-button" onClick={handleLogout}>Yes</button>
            <button className="logout-no-button" onClick={toggleLogoutPopup}>No</button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
