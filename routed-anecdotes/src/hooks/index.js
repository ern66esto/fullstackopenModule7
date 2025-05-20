import { useCallback, useState } from "react"

export const useField = (type) => {
  const [value, setValue] = useState('')

  const onChange = (event) => {
    setValue(event.target.value)
  }

  const reset = useCallback(() => {
    setValue('')
  }, [setValue])

  return {
    type,
    value,
    onChange, reset
  }
}