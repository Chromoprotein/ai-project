import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './components/App';
import {
  Route,
  Navigate,
  createBrowserRouter,
  RouterProvider,
  createRoutesFromElements
} from "react-router-dom";
import Register from './components/Register';
import Login from './components/Login';
import Logout from './components/Logout';

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/">        
      <Route index element={<App />} />
      <Route path="register" element={<Register />} />
      <Route path="login" element={<Login />} />
      <Route path="logout" element={<Logout />} />
      <Route path="*" element={<h1>Page not found</h1>} />
    </Route>
  )
);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <RouterProvider router={router} />
);