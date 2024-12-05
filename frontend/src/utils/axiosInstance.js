// This file creates an axios instance that, when the server returns a 401 unauthorized error, redirects the user to the login page

import axios from 'axios';

// Create an Axios instance
const axiosInstance = axios.create({
  withCredentials: true, 
});

// Add a response interceptor
axiosInstance.interceptors.response.use(
  (response) => {
    // If the response is successful (status code 2xx), return the response
    return response;
  },
  (error) => {
    // Check if the error response status is 401 (Unauthorized)
    if (error.response && error.response.status === 401) {
      // remove old authentication flag from session storage
      sessionStorage.removeItem('isAuthenticated');
      // Redirect to the login page
      window.location.href = '/login';
    }

    // Return the error
    return Promise.reject(error);
  }
);

export default axiosInstance;
