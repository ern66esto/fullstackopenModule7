import { useQuery } from '@tanstack/react-query';
import usersService from '../services/users';
import { Table } from 'react-bootstrap';
import { useDispatch } from 'react-redux';
import { setNotification, clearNotification } from '../features/notification/notificationSlice';
import { Link } from 'react-router-dom';

const UsersPage = ({ user: loggedInUser }) => {
  const dispatch = useDispatch();
  const {
    data: users,
    isLoading: isUsersLoading,
    isError: isUsersError,
    error: usersError,
    isFetched: isUsersFetched,
  } = useQuery({
    queryKey: ['users'],
    queryFn: usersService.getAll,
    enabled: !!loggedInUser,
    onError: (err) => {
      dispatch(
        setNotification({
          message: `Failed to load users: ${err.message || 'An error occurred'}`,
          styleClassName: 'danger',
        }),
      );
      setTimeout(() => {
        dispatch(clearNotification());
      }, 5000);
    },
  });

  return (
    <>
      <h2>Users</h2>
      {isUsersLoading && <p>Loading users...</p>}
      {isUsersError && <p>Error loading users: {usersError.message}</p>}
      {isUsersFetched && users && (
        <Table striped bordered hover responsive>
          <thead>
            <tr>
              <th></th>
              <th>Blogs Created</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td>
                  <Link to={`/users/${u.id}`}>{u.name}</Link>
                </td>
                <td>{u.blogs.length}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </>
  );
};

export default UsersPage;
