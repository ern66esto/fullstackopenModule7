// eslint-disable-next-line no-unused-vars
import React from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import { useState, useRef } from 'react';
import blogService from './services/blogs';
import LoginForm from './components/LoginForm';
import BlogForm from './components/BlogForm';
import BlogDetails from './components/BlogDetails';
import UsersPage from './components/UsersPage';
import UserPage from './components/UserPage';
import { Button } from 'react-bootstrap';
import { useDispatch } from 'react-redux';
import { setNotification, clearNotification } from './features/notification/notificationSlice';
import MessageNotification from '../src/components/Notification';

import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';

const fetchBlogs = async () => {
  const response = await blogService.getAll();
  return response.sort((a, b) => b.likes - a.likes);
};

const App = () => {
  const [loginVisible, setLoginVisible] = useState(false);
  const createBlogFormRef = useRef();

  const dispatch = useDispatch();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const {
    data: user,
    isLoading: isUserLoading,
    isError: _isUserError,
    error: _userError,
    isFetched: _isUserFetched,
  } = useQuery({
    queryKey: ['currentUser'],
    queryFn: async () => {
      const loggedUserJSON = localStorage.getItem('loggedBlogappUser');
      if (loggedUserJSON) {
        return JSON.parse(loggedUserJSON);
      }
      dispatch(
        setNotification({
          message: 'No user data in cache or localStorage',
          styleClassName: 'danger',
        }),
      );
      setTimeout(() => {
        dispatch(clearNotification());
      }, 5000);
    },
    enabled: !!localStorage.getItem('loggedBlogappUser'),
    staleTime: Infinity,
    retry: false,
    onError: (_error) => {
      localStorage.removeItem('loggedBlogappUser');
      queryClient.removeQueries(['currentUser']);
      dispatch(
        setNotification({
          message: 'Session expired or invalid token. Please log in again',
          styleClassName: 'danger',
        }),
      );
      setTimeout(() => {
        dispatch(clearNotification());
      }, 5000);
    },
  });

  const {
    data: blogs,
    isLoading: isBlogsLoading,
    isError: isBlogsError,
  } = useQuery({
    queryKey: ['blogs'],
    queryFn: fetchBlogs,
    enabled: !!user,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: true,
    onError: (err) => {
      dispatch(
        setNotification({
          message: `Failed to load blogs: ${err.message || 'An error occurred'}`,
          styleClassName: 'danger',
        }),
      );
      setTimeout(() => {
        dispatch(clearNotification());
      }, 5000);
    },
  });

  const addBlogMutation = useMutation({
    mutationFn: blogService.create,
    onSuccess: (newBlog) => {
      queryClient.invalidateQueries(['blogs']);
      createBlogFormRef.current.toggleVisibility();
      dispatch(
        setNotification({
          message: `a new blog ${newBlog.title} ! by ${newBlog.author} added!`,
          styleClassName: 'success',
        }),
      );
      setTimeout(() => {
        dispatch(clearNotification());
      }, 5000);
    },
    onError: (err) => {
      dispatch(
        setNotification({
          message: `Failed to add blog: ${err.message}`,
          styleClassName: 'danger',
        }),
      );
      setTimeout(() => {
        dispatch(clearNotification());
      }, 5000);
    },
  });

  const handleLogout = () => {
    window.localStorage.removeItem('loggedBlogappUser');
    queryClient.removeQueries(['currentUser'], null);
    queryClient.removeQueries(['blogs']);
    setLoginVisible(false);
    dispatch(
      setNotification({
        message: 'Logged out successfully',
        styleClassName: 'success',
      }),
    );
    setTimeout(() => {
      dispatch(clearNotification());
    }, 5000);
    navigate('/');
  };

  const addBlog = async (blogObject) => {
    addBlogMutation.mutate(blogObject);
  };

  const loginForm = () => {
    const hideWhenVisible = { display: loginVisible ? 'none' : '' };
    const showWhenVisible = { display: loginVisible ? '' : 'none' };

    return (
      <div>
        <div style={hideWhenVisible}>
          <Button onClick={() => setLoginVisible(true)}>login</Button>
        </div>
        <div style={showWhenVisible}>
          <LoginForm
            onLoginSuccess={(loggedInUser) => {
              setLoginVisible(false);
              queryClient.setQueryData(['currentUser'], loggedInUser);
              navigate('/');
            }}
            setNotification={setNotification}
            clearNotification={clearNotification}
            dispatch={dispatch}
          />
          <Button
            className="mt-2"
            variant="outline-secondary"
            onClick={() => setLoginVisible(false)}
          >
            cancel
          </Button>
        </div>
      </div>
    );
  };

  const BlogFormProps = {
    blogs,
    addBlog,
    createBlogFormRef,
    isBlogsLoading,
    isBlogsError,
  };

  return (
    <div className="container">
      <h2>blogs</h2>
      <MessageNotification />
      {user && (
        <div>
          <Link className="pe-2" to="/">
            blogs
          </Link>
          <Link className="pe-2" to="/users">
            users
          </Link>
          <span className="pe-2">
            {user.name} logged in.
            <Button variant="outline-secondary" size="sm" onClick={() => handleLogout()}>
              logout
            </Button>
          </span>
        </div>
      )}
      <Routes>
        <Route
          path="/"
          element={
            isUserLoading ? (
              <div>Loading user data...</div>
            ) : user ? (
              <BlogForm {...BlogFormProps} />
            ) : (
              loginForm()
            )
          }
        />
        <Route
          path="/users"
          element={
            user ? (
              <UsersPage user={user} />
            ) : (
              // If not logged in, show login form for this route too
              loginForm()
            )
          }
        />
        <Route
          path="/users/:id"
          element={
            isUserLoading ? (
              <div>Loading user profile...</div>
            ) : user ? (
              <UserPage loggedInUser={user} isUserLoading={isUserLoading} />
            ) : (
              // If not logged in, show login form for this route too
              loginForm()
            )
          }
        />
        <Route
          path="/blogs/:id"
          element={
            isUserLoading ? (
              <div>Loading user profile...</div>
            ) : user ? (
              <BlogDetails user={user} />
            ) : (
              loginForm()
            )
          }
        />
      </Routes>
    </div>
  );
};

export default App;
