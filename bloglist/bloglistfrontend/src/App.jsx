import { useState, useRef } from 'react';
import blogService from './services/blogs';
import LoginForm from './components/LoginForm';
import BlogForm from './components/BlogForm';
import { Button } from 'react-bootstrap';
import { useDispatch } from 'react-redux';
import { setNotification, clearNotification } from './features/notification/notificationSlice';
import MessageNotification from '../src/components/Notification';

import { useQuery, useQueryClient } from '@tanstack/react-query';

const fetchBlogs = async () => {
  const response = await blogService.getAll();
  return response;
};

const App = () => {
  const [blogs, setBlogs] = useState([]);
  const [loginVisible, setLoginVisible] = useState(false);
  const createBlogFormRef = useRef();
  const dispatch = useDispatch();

  const queryClient = useQueryClient();

  const {
    data: user,
    isLoading: isUserLoading,
    isError: isUserError,
    error: userError,
    isFetched: isUserFetched,
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
    onError: (error) => {
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

  const handleLogout = () => {
    window.localStorage.removeItem('loggedBlogappUser');
    queryClient.removeQueries(['currentUser']);
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
  };

  const addBlog = async (blogObject) => {
    try {
      createBlogFormRef.current.toggleVisibility();
      const response = await blogService.create(blogObject);
      dispatch(
        setNotification({
          message: `a new blog ${response.title} ! by ${response.author} added`,
          styleClassName: 'success',
        }),
      );
      setTimeout(() => {
        dispatch(clearNotification());
      }, 5000);

      setBlogs(blogs.concat(response));
    } catch (error) {
      dispatch(setNotification({ message: error.message, styleClassName: 'danger' }));
      setTimeout(() => {
        dispatch(clearNotification());
      }, 5000);
    }
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

  const handleLikes = async (blogObject) => {
    try {
      const blogToUpdate = {
        user: blogObject.user.id,
        likes: blogObject.likes + 1,
        author: blogObject.author,
        title: blogObject.title,
        url: blogObject.url,
      };
      const response = await blogService.update(blogObject.id, blogToUpdate);
      setBlogs(blogs.map((blog) => (blog.id === response.id ? response : blog)));
    } catch (error) {
      dispatch(setNotification({ message: error.message, styleClassName: 'danger' }));
      setTimeout(() => {
        dispatch(clearNotification());
      }, 5000);
    }
  };

  const handleDelete = async (blogObject) => {
    if (window.confirm(`Remove blog ${blogObject.title} by ${blogObject.author}`)) {
      try {
        await blogService.remove(blogObject.id);
        dispatch(
          setNotification({
            message: `blog ${blogObject.title} by ${blogObject.author} deleted`,
            styleClassName: 'success',
          }),
        );
        setTimeout(() => {
          dispatch(clearNotification());
        }, 5000);
        setBlogs((originalBlogs) => originalBlogs.filter((blog) => blog.id !== blogObject.id));
      } catch (error) {
        dispatch(setNotification({ message: error.message, styleClassName: 'danger' }));
        setTimeout(() => {
          dispatch(clearNotification());
        }, 5000);
      }
    }
  };

  const BlogFormProps = {
    blogs,
    handleLogout,
    addBlog,
    createBlogFormRef,
    handleLikes,
    handleDelete,
    user,
  };

  return (
    <div className="container">
      <h2>blogs</h2>
      <MessageNotification />
      {!user && loginForm()}
      {user && <BlogForm {...BlogFormProps} />}
    </div>
  );
};

export default App;
