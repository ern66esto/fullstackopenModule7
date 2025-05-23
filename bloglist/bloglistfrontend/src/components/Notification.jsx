import { Alert } from 'react-bootstrap';
import { useSelector } from 'react-redux';

const MessageNotification = () => {
  const notification = useSelector((state) => state.notification);
  const { message, styleClassName } = notification;

  if (message === null || message === '') {
    return null;
  }

  return (
    <div>
      <Alert variant={styleClassName}>{message}</Alert>
    </div>
  );
};

export default MessageNotification;
