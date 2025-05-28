import PropTypes from 'prop-types';
import { Button, Form } from 'react-bootstrap';
import { useLocation, useParams, useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import blogsService from '../services/blogs';
import { useDispatch } from 'react-redux';
import { setNotification, clearNotification } from '../features/notification/notificationSlice';

const BlogDetails = ({ user }) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const dispatch = useDispatch();
  const location = useLocation();
  const { id } = useParams();

  const {
    data: blog,
    isLoading: isBlogDetailLoading,
    isError: isBlogDetailError,
    error: blogDetailError,
  } = useQuery({
    queryKey: ['blogs', id],
    queryFn: async () => {
      if (location.state && location.state.blog && location.state.blog.id === id) {
        return location.state.blog;
      }
      return await blogsService.getById(id);
    },
    staleTime: 5 * 60 * 1000,
    enabled: !!id,
  });

  const likeBlogMutation = useMutation({
    mutationFn: ({ id, updatedBlog }) => blogsService.update(id, updatedBlog),
    onMutate: async (mutationVariables) => {
      await queryClient.cancelQueries(['blogs', mutationVariables.id]);
      await queryClient.cancelQueries(['blogs']);

      const previousBlogData = queryClient.getQueriesData(['blogs', mutationVariables.id]);
      const previousBlogsListData = queryClient.getQueriesData(['blogs']);

      queryClient.setQueryData(['blogs', mutationVariables.id], (oldBlog) => {
        if (!oldBlog) return oldBlog;
        return { ...oldBlog, likes: oldBlog.likes + 1 };
      });

      queryClient.setQueryData(['blogs'], (oldBlogs) => {
        if (!oldBlogs) return oldBlogs;
        const updated = oldBlogs.map((b) =>
          b.id === mutationVariables.id ? { ...b, likes: b.likes + 1 } : b,
        );
        return updated.sort((a, b) => b.likes - a.likes);
      });

      return { previousBlogData, previousBlogsListData };
    },
    onError: (err, mutationVariables, context) => {
      if (context?.previousBlogData) {
        queryClient.setQueryData(['blogs', mutationVariables.id], context.previousBlogData);
      }
      if (context?.previousBlogsListData) {
        queryClient.setQueryData(['blogs'], context.previousBlogsListData);
      }
      queryClient.invalidateQueries(['blogs', mutationVariables.id]);
      queryClient.invalidateQueries(['blogs']);
      dispatch(setNotification({ message: err.message, styleClassName: 'danger' }));
      setTimeout(() => {
        dispatch(clearNotification());
      }, 5000);
    },
    onSuccess: (data, variables) => {
      queryClient.setQueryData(['blogs', variables.id], data);

      queryClient.setQueryData(['blogs'], (oldBlogs) => {
        if (!oldBlogs) return oldBlogs;
        const updated = oldBlogs.map(
          (b) => (b.id === variables.id ? data : b), // Replace with the actual data returned from the server
        );
        return updated.sort((a, b) => b.likes - a.likes);
      });
    },
  });

  const handleLikes = () => {
    if (blog) {
      const updatedBlog = {
        user: blog.user.id,
        likes: blog.likes + 1,
        author: blog.author,
        title: blog.title,
        url: blog.url,
      };
      likeBlogMutation.mutate({
        id: blog.id,
        updatedBlog,
      });
    }
  };

  const deleteBlogMutation = useMutation({
    mutationFn: (blogToDelete) => blogsService.remove(blogToDelete.id),
    onMutate: async (blogToDelete) => {
      await queryClient.cancelQueries(['blogs']);
      const previousBlogs = queryClient.getQueryData(['blogs']);

      queryClient.setQueryData(['blogs'], (oldBlogs) => {
        if (!oldBlogs) return oldBlogs;
        return oldBlogs.filter((b) => b.id !== blogToDelete.id);
      });

      dispatch(
        setNotification({
          message: `blog ${blogToDelete.title} by ${blogToDelete.author} deleted`,
          styleClassName: 'success',
        }),
      );
      setTimeout(() => {
        dispatch(clearNotification());
      }, 5000);

      return { previousBlogs };
    },
    onError: (err, blogToDelete, context) => {
      queryClient.setQueryData(['blogs'], context.previousBlogs);
      dispatch(setNotification({ message: err.message, styleClassName: 'danger' }));
      setTimeout(() => {
        dispatch(clearNotification());
      }, 5000);
    },
    onSettled: () => {
      queryClient.invalidateQueries(['blogs']);
      navigate('/');
    },
  });

  const handleDelete = () => {
    if (!blog) return;
    if (window.confirm(`Remove blog ${blog.title} by ${blog.author}`)) {
      deleteBlogMutation.mutate(blog);
    }
  };

  const addCommentMutation = useMutation({
    mutationFn: ({ blogId, comment }) => blogsService.addComment(blogId, comment),
    onMutate: async ({ blogId, comment }) => {
      await queryClient.cancelQueries(['blogs', blogId]);
      const previousBlog = queryClient.getQueryData(['blogs', blogId]);

      queryClient.setQueryData(['blogs', blogId], (oldBlog) => {
        if (!oldBlog) return oldBlog;
        const tempId = `temp-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
        const newTempComment = { content: comment, id: tempId };
        return {
          ...oldBlog,
          comments: oldBlog.comments ? [...oldBlog.comments, newTempComment] : [newTempComment],
        };
      });

      return { previousBlog };
    },
    onError: (err, variables, context) => {
      queryClient.setQueryData(['blogs', variables.blogId], context.previousBlog);
      dispatch(setNotification({ message: err.message, styleClassName: 'danger' }));
      setTimeout(() => {
        dispatch(clearNotification());
      }, 5000);
    },
    onSuccess: (data, variables) => {
      // Assuming 'data' from the server is the updated blog object
      queryClient.setQueryData(['blogs', variables.blogId], data);

      dispatch(setNotification({ message: 'Comment added!', styleClassName: 'success' }));
      setTimeout(() => {
        dispatch(clearNotification());
      }, 5000);
    },
    onSettled: (data, error, variables) => {
      if (error) {
        queryClient.invalidateQueries(['blogs', variables.blogId]);
      }
    },
  });

  const handleCommentSubmit = (event) => {
    event.preventDefault();

    const formData = new FormData(event.target);
    const commentContext = formData.get('commentInput');

    if (!commentContext.trim()) {
      dispatch(setNotification({ message: 'Comment cannot be empty', styleClassName: 'danger' }));
      setTimeout(() => {
        dispatch(clearNotification());
      }, 5000);
      return;
    }

    addCommentMutation.mutate({ blogId: blog.id, comment: commentContext.trim() });
    event.target.reset();
  };

  if (isBlogDetailLoading) {
    return <div>Loading blog details</div>;
  }

  if (isBlogDetailError) {
    return <div>Error: {blogDetailError.message}</div>;
  }

  if (!blog) {
    return <div>blog not found</div>;
  }

  const blogStyle = {
    paddingTop: 10,
    paddingLeft: 2,
    border: 'solid',
    borderWidth: 1,
    marginBottom: 5,
  };

  const isCreator = user && blog.user;

  return (
    <div data-testid="blogDiv" style={blogStyle}>
      <h2 data-testid="blogTitle">{blog.title}</h2>
      <p>
        <a href="{blog.url}" target="_blank" rel="noopener noreferrer">
          {blog.url}
        </a>
      </p>
      <p data-testid="blogLikes">
        likes {blog.likes}
        <Button className="ms-3" variant="light" onClick={handleLikes}>
          like
        </Button>
      </p>
      <p>added by {blog.author}</p>

      {isCreator && (
        <Button variant="primary" onClick={handleDelete}>
          remove
        </Button>
      )}

      <h2 className="mt-4">comments</h2>
      <Form onSubmit={handleCommentSubmit} className="mb-3">
        <Form.Group className="mb-2">
          <Form.Control type="text" name="commentInput" placeholder="write a comment..." />
        </Form.Group>
        <Button type="submit" variant="success" disabled={addCommentMutation.isLoading}>
          {addCommentMutation.isLoading ? 'Adding...' : 'Add Comment'}
        </Button>
      </Form>

      {blog.comments && blog.comments.length > 0 ? (
        <ul>
          {blog.comments.map((comment) => (
            <li key={comment.id || comment.content}>{comment.content}</li>
          ))}
        </ul>
      ) : (
        <p>No comments yet.</p>
      )}
    </div>
  );
};

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
};

export default BlogDetails;
