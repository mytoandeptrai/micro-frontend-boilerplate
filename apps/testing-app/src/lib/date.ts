export function formatDate(
  value: string | Date | null | undefined,
  pattern: "short" | "long" = "short",
): string {
  if (!value) return "--"
  const date = typeof value === "string" ? new Date(value) : value
  if (Number.isNaN(date.getTime())) return "--"

  if (pattern === "long") {
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  })
}

export function startOfDay(referenceDate: Date): Date {
  const truncated = new Date(referenceDate)
  truncated.setHours(0, 0, 0, 0)
  return truncated
}

export function isBeforeDay(value: string | Date, referenceDate: Date): boolean {
  const date = typeof value === "string" ? new Date(value) : value
  return date.getTime() < startOfDay(referenceDate).getTime()
}
