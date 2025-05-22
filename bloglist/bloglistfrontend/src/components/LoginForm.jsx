import PropTypes from 'prop-types'
import { Table, Form, Button } from 'react-bootstrap'

const LoginForm = ({ handleLogin,handleUsernameChange,handlePasswordChange,username,password }) => {
  return (
    // <form onSubmit={handleLogin}>
    //   <div>
    //       username
    //     <input data-testid='username' value={username} onChange={handleUsernameChange}/>
    //   </div>
    //   <div>
    //       password
    //     <input type='password' data-testid='password' value={password} name='Password' onChange={handlePasswordChange} />
    //   </div>
    //   <button type='submit'>login</button>
    // </form>
    
    <Form onSubmit={handleLogin}>
      <Form.Group>
        <Form.Label>username</Form.Label>
        <Form.Control
          data-testid='username'
          value={username}
          onChange={handleUsernameChange}
        />
      </Form.Group>
      <Form.Group>
        <Form.Label>password</Form.Label>
        <Form.Control
          data-testid='password'
          value={password}
          onChange={handlePasswordChange}
        />
      </Form.Group>
      <Button variant='primary' type='submit'>login</Button>
    </Form>
  )
}

LoginForm.propTypes = {
  handleLogin: PropTypes.func.isRequired,
  handleUsernameChange: PropTypes.func.isRequired,
  handlePasswordChange: PropTypes.func.isRequired,
  username: PropTypes.string.isRequired,
  password: PropTypes.string.isRequired
}

export default LoginForm