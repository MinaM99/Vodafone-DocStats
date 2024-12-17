import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import PieChart from './components/PieChart';
import BarChart from './components/BarChart';
import DateFilter from './components/DateFilter';
import Navbar from './components/Navbar';
import LoginPage from './components/LoginPage';
import jsonData from './data/data.json'; // Import your JSON data directly
import './App.css';
import config from './data/config.json';

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isTokenChecked, setIsTokenChecked] = useState(false);
  const [username, setUsername] = useState('');
  const [data, setData] = useState({}); // State for data
  const [filteredData, setFilteredData] = useState({});
  const [noDataFound, setNoDataFound] = useState(false);
  const clientToken = sessionStorage.getItem('dctmclientToken');

  const currentUserURL = `${config.documentumUrl}/dctm-rest/repositories/${config.repositoryName}/currentuser`;

  // Fetch and set data.json on app load
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Simulate fetching JSON data
        setData(jsonData);
        setFilteredData(jsonData);
      } catch (error) {
        console.error('Error loading JSON data:', error);
      }
    };

    fetchData();
  }, []); // Fetch data on app load

  // Check token validity before rendering routes
  useEffect(() => {
    const checkToken = async () => {
      if (!clientToken) {
        setIsLoggedIn(false);
        setIsTokenChecked(true);
        return;
      }

      try {
        const response = await fetch(currentUserURL, {
          method: 'GET',
          headers: { DCTMClientToken: clientToken },
          credentials: 'include',
        });

        if (response.ok) {
          const userData = await response.json();
          setUsername(userData.properties.user_name || 'Success');
          setIsLoggedIn(true);
        } else {
          console.error('Invalid token, redirecting...');
          sessionStorage.removeItem('dctmclientToken');
          setIsLoggedIn(false);
        }
      } catch (error) {
        console.error('Error validating token:', error);
        sessionStorage.removeItem('dctmclientToken');
        setIsLoggedIn(false);
      }
      setIsTokenChecked(true);
    };

    checkToken();
  }, [clientToken, currentUserURL]);

  const handleLogin = (token) => {
    setIsLoggedIn(true);
    sessionStorage.setItem('dctmclientToken', token);
  };

  const handleFilterData = (filtered) => {
    setFilteredData(filtered);
    setNoDataFound(Object.keys(filtered).length === 0);
  };

  if (!isTokenChecked) {
    // While token validation is ongoing, show a loading screen
    return <div>Loading...</div>;
  }

  return (
    <Router>
      <div className={`app ${isLoggedIn ? 'logged-in' : 'login-page'}`}>
        <Routes>
          <Route
            path="/Vodafone-DocStats/login"
            element={
              isLoggedIn ? <Navigate to="/Vodafone-DocStats/Stats" /> : <LoginPage onLogin={handleLogin} />
            }
          />
          <Route
            path="/Vodafone-DocStats/Stats"
            element={
              isLoggedIn ? (
                <>
                  <Navbar username={username} />
                  <h1>Document Statistics</h1>
                  <DateFilter data={data} onFilterData={handleFilterData} />
                  {noDataFound ? (
                    <div className="no-data-indicator">
                      <p>No data found for the selected date range.</p>
                    </div>
                  ) : (
                    <div className="charts">
                      {Object.keys(filteredData).length > 0 && (
                        <>
                          <PieChart data={filteredData} />
                          <BarChart data={filteredData} />
                        </>
                      )}
                    </div>
                  )}
                </>
              ) : (
                <Navigate to="/Vodafone-DocStats/login" />
              )
            }
          />
          <Route
            path="/Vodafone-DocStats"
            element={
              isLoggedIn ? <Navigate to="/Vodafone-DocStats/Stats" /> : <Navigate to="/Vodafone-DocStats/login" />
            }
          />
          <Route path="*" element={<Navigate to="/Vodafone-DocStats" />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
