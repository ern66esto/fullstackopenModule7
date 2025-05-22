import { useState } from 'react';
import { Container, Form, Button } from 'react-bootstrap';

const CreateBlogForm = ({ createBlog }) => {
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [url, setUrl] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (title.trim().length > 0 && author.trim().length > 0 && url.trim().length > 0) {
      const blogObject = { title, author, url };
      await createBlog(blogObject);
    }
    setTitle('');
    setAuthor('');
    setUrl('');
  };

  return (
    <Container>
      <h2>create new</h2>
      <Form onSubmit={handleSubmit}>
        <Form.Group>
          <Form.Label>title</Form.Label>
          <Form.Control
            type="text"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="write title here"
          />
        </Form.Group>
        <Form.Group>
          <Form.Label>author</Form.Label>
          <Form.Control
            type="text"
            value={author}
            onChange={(event) => setAuthor(event.target.value)}
            placeholder="write author here"
          />
        </Form.Group>
        <Form.Group>
          <Form.Label>url</Form.Label>
          <Form.Control
            type="text"
            value={url}
            onChange={(event) => setUrl(event.target.value)}
            placeholder="write url here"
          />
        </Form.Group>
        <Button className="mt-2 mb-2" variant="primary" type="submit">
          create
        </Button>
      </Form>
    </Container>
  );
};

export default CreateBlogForm;
