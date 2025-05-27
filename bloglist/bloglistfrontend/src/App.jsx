import { useState, useRef } from 'react';
import blogService from './services/blogs';
import LoginForm from './components/LoginForm';
import BlogForm from './components/BlogForm';
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

  const {
    data: blogs,
    isLoading: isBlogsLoading,
    isError: isBlogsError,
    error: blogsError,
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

  const likeBlogMutation = useMutation({
    mutationFn: ({ id, updatedBlog }) => blogService.update(id, updatedBlog),
    onMutate: async (newLikeInfo) => {
      await queryClient.cancelQueries(['blogs']);
      const previousBlogs = queryClient.getQueriesData(['blogs']);

      queryClient.setQueryData(['blogs'], (oldBlogs) => {
        const updated = oldBlogs.map((blog) =>
          blog.id === newLikeInfo.id ? { ...blog, likes: blog.likes + 1 } : blog,
        );
        return updated.sort((a, b) => b.likes - a.likes);
      });

      return { previousBlogs };
    },
    onError: (err, newLikeInfo, context) => {
      queryClient.setQueryData(['blogs'], context.previousBlogs);
      dispatch(setNotification({ message: err.message, styleClassName: 'danger' }));
      setTimeout(() => {
        dispatch(clearNotification());
      }, 5000);
    },
    onSettled: () => {
      queryClient.invalidateQueries(['blogs']);
    },
  });

  const deleteBlogMutation = useMutation({
    mutationFn: (id) => blogService.remove(id),
    onMutate: async (blogIdToDelete) => {
      await queryClient.cancelQueries(['blogs']);
      const previousBlogs = queryClient.getQueryData(['blogs']);

      queryClient.setQueryData(['blogs'], (oldBlogs) =>
        oldBlogs.filter((blog) => blog.id !== blogIdToDelete),
      );

      return { previousBlogs };
    },
    onError: (err, blogIdToDelete, context) => {
      queryClient.setQueryData(['blogs'], context.previousBlogs);
      dispatch(setNotification({ message: err.message, styleClassName: 'danger' }));
      setTimeout(() => {
        dispatch(clearNotification());
      }, 5000);
    },
    onSettled: () => {
      queryClient.invalidateQueries(['blogs']);
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
    const updatedBlog = {
      user: blogObject.user.id,
      likes: blogObject.likes + 1,
      author: blogObject.author,
      title: blogObject.title,
      url: blogObject.url,
    };
    likeBlogMutation.mutate({ id: blogObject.id, updatedBlog });
  };

  const handleDelete = async (blogObject) => {
    if (window.confirm(`Remove blog ${blogObject.title} by ${blogObject.author}`)) {
      deleteBlogMutation.mutate(blogObject.id);
      dispatch(
        setNotification({
          message: `blog ${blogObject.title} by ${blogObject.author} deleted`,
          styleClassName: 'success',
        }),
      );
      setTimeout(() => {
        dispatch(clearNotification());
      }, 5000);
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
    isBlogsLoading,
    isBlogsError,
    blogsError,
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
