import { Star, StarHalf } from 'lucide-react'
import { cn } from '@/lib/utils'

interface RatingProps {
  rating: number
  maxRating?: number
  className?: string
  showText?: boolean
  size?: number
}

export function Rating({ rating, maxRating = 5, className, showText = true, size = 16 }: RatingProps) {
  const fullStars = Math.floor(rating)
  const hasHalfStar = rating % 1 >= 0.5
  const emptyStars = maxRating - fullStars - (hasHalfStar ? 1 : 0)

  return (
    <div className={cn("flex items-center gap-1.5", className)}>
      <div className="flex">
        {[...Array(fullStars)].map((_, i) => (
          <Star key={`full-${i}`} size={size} className="fill-accent text-accent" />
        ))}
        {hasHalfStar && <StarHalf size={size} className="fill-accent text-accent" />}
        {[...Array(emptyStars)].map((_, i) => (
          <Star key={`empty-${i}`} size={size} className="text-muted-foreground/30" />
        ))}
      </div>
      {showText && (
        <span className="text-sm font-medium">
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  )
}
