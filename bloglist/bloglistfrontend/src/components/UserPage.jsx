import { useParams } from 'react-router-dom';
import usersService from '../services/users';
import { useDispatch } from 'react-redux';
import { setNotification, clearNotification } from '../features/notification/notificationSlice';
import { useQuery } from '@tanstack/react-query';

// eslint-disable-next-line no-unused-vars
const UserPage = ({ loggedInUser, isUserLoading }) => {
  const dispatch = useDispatch();
  const { id } = useParams();

  const {
    data: user,
    isLoading: _isUserDetailLoading,
    isError: _isUserDetailError,
    error: _userDetailError,
    isFetched: isUserDetailFetched,
  } = useQuery({
    queryKey: ['singleUser', id],
    queryFn: () => usersService.getById(id),
    enabled: !!id && !!loggedInUser,
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
    <div>
      {isUserDetailFetched && <h2>{user.name}</h2>}
      <h3>added blogs</h3>
      {isUserDetailFetched && user.blogs && user.blogs.length > 0 ? (
        <ul>
          {user.blogs.map((blog) => (
            <li key={blog.id}>{blog.title}</li>
          ))}
        </ul>
      ) : (
        <p>No blogs added by this user</p>
      )}
    </div>
  );
};

export default UserPage;
