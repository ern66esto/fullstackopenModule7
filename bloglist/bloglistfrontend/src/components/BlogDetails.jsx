import { useState } from 'react'
import PropTypes from 'prop-types'

const BlogDetails = ({ blog, handleLikes, handleDelete }) => {
  const [showDetails, setShowDetails] = useState(false)
  const toggleDetails = () => {
    setShowDetails(!showDetails)
  }

  const blogStyle = {
    paddingTop: 10,
    paddingLeft: 2,
    border: 'solid',
    borderWidth: 1,
    marginBottom: 5
  }

  return (
    <div data-testid='blogDiv' style={blogStyle}>
      <p data-testid='blogTitle'>{blog.title}

        <button onClick={toggleDetails} style={{ marginLeft:'10px' }}>
          {showDetails ? 'hide' : 'view'}
        </button>
      </p>
      {showDetails &&
            <div >
              <p>{blog.url}</p>
              <p data-testid='blogLikes'>likes {blog.likes} <button onClick={() => handleLikes(blog)}>like</button> </p>
              <p>{blog.author}</p>
              <button style={{ background:'cornflowerblue' }} onClick={() => handleDelete(blog)} >remove</button>
            </div>
      }
    </div>
  )
}

BlogDetails.propTypes = {
  blog: PropTypes.shape({
    title: PropTypes.string.isRequired,
    url: PropTypes.string.isRequired,
    likes: PropTypes.number.isRequired,
    author: PropTypes.string.isRequired,
    id: PropTypes.string.isRequired,
  }).isRequired,
  handleLikes: PropTypes.func.isRequired,
  handleDelete: PropTypes.func.isRequired,
}

export default BlogDetails