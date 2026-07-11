import { useEffect, useState } from "react"

import { Input } from "@ops/ui/components/input"

import { useDebounce } from "../../hooks/useDebounce"
import { useTaskFilters } from "../../hooks/useTaskFilters"

const SEARCH_DEBOUNCE_MS = 400

export default function TaskSearchInput() {
  const { keyword, setKeyword } = useTaskFilters()
  const [inputValue, setInputValue] = useState(keyword)
  const debouncedValue = useDebounce(inputValue, SEARCH_DEBOUNCE_MS)

  useEffect(() => {
    setKeyword(debouncedValue)
  }, [debouncedValue, setKeyword])

  return (
    <Input
      value={inputValue}
      onChange={(event) => setInputValue(event.target.value)}
      placeholder="Search tasks by title"
      aria-label="Search tasks"
    />
  )
}
