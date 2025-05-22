import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Togglable from './Togglable'
import { beforeEach, describe, expect } from 'vitest'

describe('<Togglable/>', () => {
  let container

  beforeEach(() => {
    container = render(
      <Togglable buttonLabel='show...'>
        <div className='testDiv'>
          togglable content
        </div>
      </Togglable>
    ).container
  })

  // eslint-disable-next-line no-undef
  test('renders its children', async () => {
    await screen.findAllByText('togglable content')
  })

  // eslint-disable-next-line no-undef
  test('at start the children are not displayed',async () => {
    const div = container.querySelector('.togglableContent')
    expect(div).toHaveStyle('display: none')
  })

  // eslint-disable-next-line no-undef
  test('after clicking the button, childre are displayed',async () => {
    const user = userEvent.setup()
    const button = screen.getByText('show...')
    await user.click(button)

    const div = container.querySelector('.togglableContent')
    expect(div).not.toHaveStyle('display: none')
  })

  // eslint-disable-next-line no-undef
  test('toggled content can be closed', async () => {
    const user = userEvent.setup()
    const button = screen.getByText('show...')
    await user.click(button)

    const closeButton = screen.getByText('cancel')
    await user.click(closeButton)

    const div = container.querySelector('.togglableContent')
    expect(div).toHaveStyle('display: none')
  })

})