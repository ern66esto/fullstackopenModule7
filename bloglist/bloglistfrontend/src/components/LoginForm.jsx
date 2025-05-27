import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Form, Button, Alert } from 'react-bootstrap';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import loginService from '../services/login';

const LoginForm = ({ onLoginSuccess, setNotification, clearNotification, dispatch }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const queryClient = useQueryClient();
  const {
    mutate: loginMutate,
    isLoading: isLoginLoading,
    isError: isLoginError,
    error: loginError,
  } = useMutation({
    mutationFn: loginService.login,
    onSuccess: (data) => {
      localStorage.setItem('loggedBlogappUser', data.token);
      localStorage.setItem('userToken', data.token);
      queryClient.invalidateQueries(['blogs']);
      dispatch(
        setNotification({
          message: `Welcome ${data.name || data.username}!`,
          styleClassName: 'success',
        }),
      );
      setTimeout(() => {
        dispatch(clearNotification());
      }, 5000);
      onLoginSuccess(data);
      setUsername('');
      setPassword('');
    },
    onError: (err) => {
      dispatch(
        setNotification({
          message: `Wrong credentials ${err.message}`,
          styleClassName: 'danger',
        }),
      );
      setTimeout(() => {
        dispatch(clearNotification());
      }, 5000);
    },
  });

  const handleLogin = async (event) => {
    event.preventDefault();
    await loginMutate({ username, password });
  };

  const handleUsernameChange = ({ target }) => {
    setUsername(target.value);
  };

  const handlePasswordChange = ({ target }) => {
    setPassword(target.value);
  };

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
      <Button className="mt-2" variant="primary" type="submit" disabled={isLoginLoading}>
        {isLoginLoading ? 'Logging In...' : 'Login'}
      </Button>
    </Form>
  );
};

LoginForm.propTypes = {
  onLoginSuccess: PropTypes.func.isRequired,
  setNotification: PropTypes.func.isRequired,
  clearNotification: PropTypes.func.isRequired,
  dispatch: PropTypes.func.isRequired,
};

export default LoginForm;
