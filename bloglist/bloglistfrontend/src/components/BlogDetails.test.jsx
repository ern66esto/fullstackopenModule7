import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import BlogDetails from './BlogDetails'
import { expect, vi } from 'vitest'

// eslint-disable-next-line no-undef
test('renders content', () => {
  const blog = {
    title: 'The Role of Tomorrows Developers',
    url: 'https://sourcevolution.com/en/2025/02/07/the-developers-of-the-future',
    likes: 3,
    author: 'sourcevolution',
    id: '6818b27ed0b4bd71c2de7907',
  }

  render(<BlogDetails blog={blog}/>)

  const element = screen.getByText('The Role of Tomorrows Developers')

  expect(element).toBeDefined()
})

// eslint-disable-next-line no-undef
test('<BlogDetails/> toggles details and handles likes and delete', async () => {
  const blog = {
    title: 'The Role of Tomorrows Developers',
    url: 'https://sourcevolution.com/en/2025/02/07/the-developers-of-the-future',
    likes: 5,
    author: 'sourcevolution',
    id: '1',
  }

  const handleLikes = vi.fn()
  const handleDelete = vi.fn()
  const user = userEvent.setup()

  render(<BlogDetails key={blog.id} blog={blog} handleLikes={handleLikes} handleDelete={handleDelete}/>)

  expect(screen.queryByText(blog.url)).not.toBeInTheDocument()
  expect(screen.queryByText(`likes ${blog.likes}`)).not.toBeInTheDocument()
  expect(screen.queryByText(blog.author)).not.toBeInTheDocument()

  const toggleButton = screen.getByText('view')
  await user.click(toggleButton)

  expect(screen.getByText(blog.url)).toBeInTheDocument()
  expect(screen.getByText(`likes ${blog.likes}`)).toBeInTheDocument()
  expect(screen.getByText(blog.author)).toBeInTheDocument()

  const likeButton = screen.getByText('like')
  await user.click(likeButton)
  await user.click(likeButton)
  expect(handleLikes).toHaveBeenCalledTimes(2)
  expect(handleLikes).toHaveBeenCalledWith(blog)

  const deleteButton = screen.getByText('remove')
  await user.click(deleteButton)
  expect(handleDelete).toHaveBeenCalledTimes(1)
  expect(handleDelete).toHaveBeenCalledWith(blog)
  console.log('HANDLEDELETE.MOCK.CALLS', handleDelete.mock.calls)
  expect(handleDelete.mock.calls).toHaveLength(1)
})

