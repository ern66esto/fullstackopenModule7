import { useState } from "react"

const useField = (type) => {
  const [value, setValue] = useState('')

  onChange = (event) => {
    setValue(event.target.value)
  }

  return {
    type,
    value,
    onChange
  }
}