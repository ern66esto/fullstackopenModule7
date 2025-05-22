import { useState } from 'react'
import PropTypes from 'prop-types'
import { Button } from 'react-bootstrap'

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
        <Button className='ms-3' variant='light' onClick={toggleDetails}>{showDetails ? 'hide' : 'view'}</Button>
      </p>
      {showDetails &&
            <div >
              <p>{blog.url}</p>
              <p data-testid='blogLikes'>likes {blog.likes}
                <Button className='ms-3' variant='light' onClick={() => handleLikes(blog)}>like</Button>
              </p>
              <p>{blog.author}</p>
              <Button variant='primary' onClick={() => handleDelete(blog)}>remove</Button>
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