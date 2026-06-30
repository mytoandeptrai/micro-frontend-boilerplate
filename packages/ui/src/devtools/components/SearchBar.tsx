import { Button } from "@ops/ui/components/button"
import { Input } from "@ops/ui/components/input"
import { MagnifyingGlassIcon, XIcon } from "@phosphor-icons/react"

interface SearchBarProps {
  searchTerm: string
  onSearchChange: (v: string) => void
  onClear: () => void
}

export function SearchBar({ searchTerm, onSearchChange, onClear }: SearchBarProps) {
  return (
    <div className="relative">
      <MagnifyingGlassIcon className="text-muted-foreground absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2" />
      <Input
        type="text"
        placeholder="Search events…"
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
        className="pl-7 pr-7"
      />
      {searchTerm && (
        <Button
          type="button"
          variant="ghost"
          size="icon-xs"
          onClick={onClear}
          className="absolute top-1/2 right-1 -translate-y-1/2"
        >
          <XIcon className="size-3.5" />
        </Button>
      )}
    </div>
  )
}
