import { render, screen } from '@testing-library/react'
import CreateBlogForm from './CreateBlogForm'
import userEvent from '@testing-library/user-event'
import { expect, vi } from 'vitest'

// eslint-disable-next-line no-undef
test('<CreateBlogForm /> updates parent state and calls onSubmit', async () => {
  const createBlog = vi.fn()
  const user = userEvent.setup()

  render(<CreateBlogForm createBlog={createBlog}/>)

  const title = screen.getByPlaceholderText('write title here')
  const author = screen.getByPlaceholderText('write author here')
  const url = screen.getByPlaceholderText('write url here')
  const sendButton = screen.getByText('create')

  await user.type(title, 'The Role of Tomorrows Developers')
  await user.type(author, 'sourcevolution')
  await user.type(url, 'https://sourcevolution.com/en/2025/02/07/the-developers-of-the-future')
  await user.click(sendButton)

  console.log('CREATEBLOG.MOCK.CALLS', createBlog.mock.calls)
  expect(createBlog.mock.calls).toHaveLength(1)
  expect(createBlog.mock.calls[0][0].title).toBe('The Role of Tomorrows Developers')
})