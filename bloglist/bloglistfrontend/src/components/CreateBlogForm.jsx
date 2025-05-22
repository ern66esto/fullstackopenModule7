import { useState } from 'react'
const CreateBlogForm = ({ createBlog }) => {
  const [title, setTitle] = useState('')
  const [author, setAuthor] = useState('')
  const [url, setUrl] = useState('')

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (title.trim().length > 0 && author.trim().length > 0 && url.trim().length > 0) {
      const blogObject = { title, author, url }
      await createBlog(blogObject )
    }
    setTitle('')
    setAuthor('')
    setUrl('')
  }

  return (
    <div>
      <h2>create new</h2>
      <form onSubmit={handleSubmit}>
        <div>
          title: <input value={title} onChange={event => setTitle(event.target.value)} placeholder='write title here'/>
        </div>
        <div>
          author: <input value={author} onChange={event => setAuthor(event.target.value)} placeholder='write author here'/>
        </div>
        <div>
          url: <input value={url} onChange={event => setUrl(event.target.value)} placeholder='write url here'/>
        </div>
        <div>
          <button type="submit">create</button>
        </div>
      </form>
    </div>
  )
}

export default CreateBlogForm