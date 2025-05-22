import CreateBlogForm from './CreateBlogForm'
import Togglable from './Togglable'
import BlogDetails from './BlogDetails'
import { Button } from 'react-bootstrap'

const BlogForm = (props) =>
{
  const { blogs, handleLogout, addBlog, createBlogFormRef, handleLikes, handleDelete, user } = props
  blogs.sort(function(a, b) {
    if (a.likes < b.likes ) {
      return 1
    }
    if (a.likes > b.likes) {
      return -1
    }

    return 0
  })
  return (
    <div>
      <div>
        <div>{user.name} logged in.
          <Button variant='outline-secondary' onClick={() => handleLogout() }>logout</Button>
        </div>
      </div>
      <br/>
      <div>
        <Togglable buttonLabel='new blog' ref={createBlogFormRef}>
          <CreateBlogForm createBlog={addBlog} />
        </Togglable>
      </div>
      <div>
        {blogs.map(b =>
          (<BlogDetails key={b.id} blog={b} handleLikes={handleLikes} handleDelete={handleDelete}/>)
        )}
      </div>
    </div>
  )
}

export default BlogForm