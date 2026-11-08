import { Skeleton } from '@/components/ui/Skeleton'

export function CardGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }, (_, i) => (
        <Skeleton key={i} className="h-40 rounded-lg" />
      ))}
    </div>
  )
}
