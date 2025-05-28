import CreateBlogForm from './CreateBlogForm';
import Togglable from './Togglable';
import { Link } from 'react-router-dom';

const BlogForm = (props) => {
  const { blogs, addBlog, createBlogFormRef, isBlogsLoading, isBlogsError } = props;

  return (
    <div>
      <br />
      <div>
        <Togglable buttonLabel="new blog" ref={createBlogFormRef}>
          <CreateBlogForm createBlog={addBlog} />
        </Togglable>
      </div>
      <div>
        {blogs && !isBlogsLoading && !isBlogsError && blogs.length > 0 && (
          <>
            <ul style={{ listStyleType: 'none', padding: 0, margin: 0 }}>
              {blogs.map((b) => (
                <li key={b.id}>
                  <Link to={`/blogs/${b.id}`} state={{ blog: b }}>
                    {b.title}
                  </Link>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </div>
  );
};

export default BlogForm;
