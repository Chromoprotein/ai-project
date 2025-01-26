import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './components/Chatting/App';
import {
  Route,
  Navigate,
  createBrowserRouter,
  RouterProvider,
  createRoutesFromElements
} from "react-router-dom";
import Register from './components/User/Register';
import Login from './components/User/Login';
import Logout from './components/User/Logout';
import { useAuth } from './utils/useAuth';
import Bots from './components/BotPersonas/Bots';
import UserProfile from './components/UserProfile/UserProfile';
import ShareProfile from './components/BotPersonas/ShareProfile';

function RequireAuth({ children }) {

  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return "Loading...";
  }

  return isAuthenticated ? children : <Navigate to="/login" />;
}

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/">        
      {/* Protected Route */}
      <Route
        path="/"
        element={
          <RequireAuth>
            <App />
          </RequireAuth>
        }
      />
      <Route
        path="bots"
        element={
          <RequireAuth>
            <Bots />
          </RequireAuth>
        }
      />
      <Route
        path="profile"
        element={
          <RequireAuth>
            <UserProfile />
          </RequireAuth>
        }
      />
      <Route
        path="shareProfile"
        element={
          <RequireAuth>
            <ShareProfile />
          </RequireAuth>
        }
      />
      {/* Public Routes */}
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