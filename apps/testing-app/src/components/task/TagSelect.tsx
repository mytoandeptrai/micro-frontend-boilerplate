import { Badge } from "@ops/ui/components/badge"

import { useTags } from "../../hooks/useTags"

interface TagSelectProps {
  value: string[]
  onChange: (value: string[]) => void
}

export default function TagSelect({ value, onChange }: TagSelectProps) {
  const { data: tags, isLoading } = useTags()

  function toggleTag(tagId: string) {
    if (value.includes(tagId)) {
      onChange(value.filter((id) => id !== tagId))
    } else {
      onChange([...value, tagId])
    }
  }

  if (isLoading) {
    return <p className="text-xs text-muted-foreground">Loading tags…</p>
  }

  if (!tags || tags.length === 0) {
    return <p className="text-xs text-muted-foreground">No tags available</p>
  }

  return (
    <fieldset className="m-0 flex flex-wrap gap-2 border-0 p-0" aria-label="Tags">
      {tags.map((tag) => {
        const selected = value.includes(tag.id)
        return (
          <button key={tag.id} type="button" onClick={() => toggleTag(tag.id)} aria-pressed={selected}>
            <Badge variant={selected ? "default" : "outline"}>{tag.name}</Badge>
          </button>
        )
      })}
    </fieldset>
  )
}
