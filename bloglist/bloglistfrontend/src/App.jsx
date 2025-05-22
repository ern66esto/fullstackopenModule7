import { useState, useEffect, useRef } from 'react'
import blogService from './services/blogs'
import loginService from './services/login'
import Notification from './components/Notification'
import LoginForm from './components/LoginForm'
import BlogForm from './components/BlogForm'
import { Button } from 'react-bootstrap'

const App = () => {
  const [blogs, setBlogs] = useState([])
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [user, setUser] = useState(null)
  const [message, setMessage] = useState('')
  const [loginVisible, setLoginVisible] = useState(false)
  const createBlogFormRef = useRef()


  useEffect(() => {
    // blogService.getAll().then(blogs =>
    //   setBlogs( blogs )
    // )
  }, [])
  useEffect(() => {
    const loggedUserJSON = window.localStorage.getItem('loggedBlogappUser')
    if (loggedUserJSON) {
      const user = JSON.parse(loggedUserJSON)
      setUser(user)
      blogService.setToken(user.token)
      const fetchData = async () => {
        try {
          const blogs = await blogService.getAll()
          setBlogs(blogs)
          setUsername('')
          setPassword('')
        } catch (error) {
          console.log('error getAll: ', error)
          window.localStorage.removeItem('loggedBlogappUser')
          setBlogs([])
          setUser(null)
          setUsername('')
          setPassword('')
        }
      }
      fetchData()
    }
  }, [])

  const handleLogin = async (event) => {
    event.preventDefault()
    try {
      const user = await loginService.login({ username, password })
      window.localStorage.setItem('loggedBlogappUser', JSON.stringify(user))
      blogService.setToken(user.token)
      const blogs = await blogService.getAll()
      setBlogs(blogs)
      setUser(user)
      setUsername('')
      setPassword('')
    } catch (error) {
      sendMessage(`Wrong credentials ${error.message}`, 'danger')
      console.log('Error log in: ', error)
    }

  }

  const handleLogout = () => {
    window.localStorage.removeItem('loggedBlogappUser')
    setBlogs([])
    setUser(null)
    setUsername('')
    setPassword('')
  }

  const handleUsernameChange = (event) => {
    setUsername(event.target.value)
  }

  const handlePasswordChange = (event) => {
    setPassword(event.target.value)
  }

  const addBlog = async (blogObject) => {
    try {
      createBlogFormRef.current.toggleVisibility()
      const response = await blogService.create(blogObject)
      sendMessage(`a new blog ${response.title} ! by ${response.author} added`, 'success')
      setBlogs(blogs.concat(response))
    } catch (error) {
      sendMessage(error.message, 'danger')
      console.log('Error creating a blog: ', error)
    }
  }

  const sendMessage = (...parameters) => {
    const [message, styleClass] = parameters
    const sendMessage = { message: message, styleClassName: styleClass }
    setMessage(sendMessage)
    setTimeout(() => {setMessage({ message: '', styleClassName:'' })},3000)
  }

  const loginForm = () => {
    const hideWhenVisible = { display: loginVisible ? 'none' : '' }
    const showWhenVisible = { display: loginVisible ? '' : 'none' }

    return (
      <div>
        <div style={hideWhenVisible}>
          {/* <button onClick={() => setLoginVisible(true)} >login</button> */}
          <Button onClick={() => setLoginVisible(true)} >login</Button>
        </div>
        <div style={showWhenVisible} >
          <LoginForm
            username={username}
            password={password}
            handleUsernameChange={({ target }) => setUsername(target.value) }
            handlePasswordChange={({ target }) => setPassword(target.value)}
            handleLogin={handleLogin}
          />
          {/* <button onClick={() => setLoginVisible(false)}>cancel</button> */}
          <Button className='mt-2' onClick={() => setLoginVisible(false)} >cancel</Button>
        </div>
      </div>
    )
  }

  const handleLikes = async (blogObject) => {
    try {
      const blogToUpdate = {
        user: blogObject.user.id,
        likes: blogObject.likes + 1,
        author: blogObject.author,
        title: blogObject.title,
        url: blogObject.url
      }
      const response = await blogService.update(blogObject.id, blogToUpdate)
      setBlogs(blogs.map(blog => blog.id === response.id ? response : blog))
    } catch (error) {
      sendMessage(error.message, 'danger')
      console.log('Error updating likes: ', error)
    }
  }

  const handleDelete = async (blogObject) => {
    if (window.confirm(`Remove blog ${blogObject.title} by ${blogObject.author}`)) {
      try {
        const response = await blogService.remove(blogObject.id)
        sendMessage(`blog ${blogObject.title} by ${blogObject.author} deleted`, 'success')
        setBlogs(originalBlogs => originalBlogs.filter(blog => blog.id !== blogObject.id))
      } catch (error) {
        sendMessage(error.message, 'danger')
        console.log('Error deleting blog: ', error)
      }
    }
  }

  const BlogFormProps = { blogs, handleLogout, addBlog, createBlogFormRef, handleLikes, handleDelete, user }

  return (
    <div className='container' >
      <h2>blogs</h2>
      {message && <Notification messageText={message}/>}
      {!user && loginForm()}
      {user &&
          <BlogForm {...BlogFormProps}/>
      }
    </div>
  )
}

export default App