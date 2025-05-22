import { Alert } from 'react-bootstrap'

const Notification = ({ messageText }) => {
  const message = messageText.message
  const styleClass = messageText.styleClassName
  if (message === null || message === '') {
    return null
  }

  return (
    // <div className={styleClass}>
    //   {message}
    // </div>
    <div>
      <Alert variant={styleClass}>
        {message}
      </Alert>
    </div>
  )
}

export default Notification