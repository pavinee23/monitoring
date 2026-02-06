// ErrorBoundary removed during rollback — keep a no-op fallback to avoid import errors
"use client"

export default function ErrorBoundary({ children }: { children: React.ReactNode }) {
  return children as any
}
