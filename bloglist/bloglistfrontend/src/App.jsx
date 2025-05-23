import { useState, useEffect, useRef } from 'react';
import blogService from './services/blogs';
import loginService from './services/login';
import LoginForm from './components/LoginForm';
import BlogForm from './components/BlogForm';
import { Button } from 'react-bootstrap';
import { useDispatch } from 'react-redux';
import { setNotification, clearNotification } from './features/notification/notificationSlice';
import MessageNotification from '../src/components/Notification';

const App = () => {
  const [blogs, setBlogs] = useState([]);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [user, setUser] = useState(null);
  const [loginVisible, setLoginVisible] = useState(false);
  const createBlogFormRef = useRef();
  const dispatch = useDispatch();

  useEffect(() => {
    const loggedUserJSON = window.localStorage.getItem('loggedBlogappUser');
    if (loggedUserJSON) {
      const user = JSON.parse(loggedUserJSON);
      setUser(user);
      blogService.setToken(user.token);
      const fetchData = async () => {
        try {
          const blogs = await blogService.getAll();
          setBlogs(blogs);
          setUsername('');
          setPassword('');
        } catch (_error) {
          window.localStorage.removeItem('loggedBlogappUser');
          setBlogs([]);
          setUser(null);
          setUsername('');
          setPassword('');
          dispatch(
            setNotification({
              message: 'Session expired or invalid token. Please log in again',
              styleClassName: 'danger',
            }),
          );
          setTimeout(() => {
            dispatch(clearNotification());
          }, 5000);
        }
      };
      fetchData();
    }
  }, []);

  const handleLogin = async (event) => {
    event.preventDefault();
    try {
      const user = await loginService.login({ username, password });
      window.localStorage.setItem('loggedBlogappUser', JSON.stringify(user));
      blogService.setToken(user.token);
      const blogs = await blogService.getAll();
      setBlogs(blogs);
      setUser(user);
      setUsername('');
      setPassword('');
    } catch (error) {
      dispatch(
        setNotification({
          message: `Wrong credentials ${error.message}`,
          styleClassName: 'danger',
        }),
      );
      setTimeout(() => {
        dispatch(clearNotification());
      }, 5000);
    }
  };

  const handleLogout = () => {
    window.localStorage.removeItem('loggedBlogappUser');
    setBlogs([]);
    setUser(null);
    setUsername('');
    setPassword('');
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
            username={username}
            password={password}
            handleUsernameChange={({ target }) => setUsername(target.value)}
            handlePasswordChange={({ target }) => setPassword(target.value)}
            handleLogin={handleLogin}
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
