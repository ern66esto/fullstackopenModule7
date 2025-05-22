import PropTypes from 'prop-types';
import { Form, Button } from 'react-bootstrap';

const LoginForm = ({
  handleLogin,
  handleUsernameChange,
  handlePasswordChange,
  username,
  password,
}) => {
  return (
    <Form onSubmit={handleLogin}>
      <Form.Group>
        <Form.Label>username</Form.Label>
        <Form.Control data-testid="username" value={username} onChange={handleUsernameChange} />
      </Form.Group>
      <Form.Group>
        <Form.Label>password</Form.Label>
        <Form.Control
          type="password"
          data-testid="password"
          value={password}
          onChange={handlePasswordChange}
        />
      </Form.Group>
      <Button className="mt-2" variant="primary" type="submit">
        login
      </Button>
    </Form>
  );
};

LoginForm.propTypes = {
  handleLogin: PropTypes.func.isRequired,
  handleUsernameChange: PropTypes.func.isRequired,
  handlePasswordChange: PropTypes.func.isRequired,
  username: PropTypes.string.isRequired,
  password: PropTypes.string.isRequired,
};

export default LoginForm;
