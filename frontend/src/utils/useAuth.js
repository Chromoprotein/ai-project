import { useState, useEffect } from 'react';
import axios from 'axios';

// Provider component
export const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(sessionStorage.getItem('isAuthenticated') === 'true');
  const [loadingPage, setLoadingPage] = useState(true);

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        if (!process.env.REACT_APP_USERSTATUS) {
          throw new Error('REACT_APP_USERSTATUS is not defined');
        }
        const response = await axios.get(process.env.REACT_APP_USERSTATUS, { withCredentials: true });
        const isAuthenticated = response.data.isAuthenticated;
        setIsAuthenticated(isAuthenticated);
        sessionStorage.setItem('isAuthenticated', isAuthenticated.toString());
      } catch (error) {
        console.error('Error checking authentication status:', error);
        setIsAuthenticated(false);
        sessionStorage.setItem('isAuthenticated', 'false');
      } finally {
        setLoadingPage(false);
      }
    };

    if (sessionStorage.getItem('isAuthenticated') === null) {
      checkAuthStatus();
    }
  }, []);

  return { isAuthenticated, loadingPage };

};