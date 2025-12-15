'use client'

import { useState } from 'react'
import { Star } from 'lucide-react'

interface StarRatingProps {
  rating: number
  onChange?: (rating: number) => void
  readonly?: boolean
  size?: number
}

export default function StarRating({ 
  rating, 
  onChange, 
  readonly = false,
  size = 24 
}: StarRatingProps) {
  const [hoverRating, setHoverRating] = useState(0)

  const handleClick = (value: number) => {
    if (!readonly && onChange) {
      onChange(value)
    }
  }

  const handleMouseEnter = (value: number) => {
    if (!readonly) {
      setHoverRating(value)
    }
  }

  const handleMouseLeave = () => {
    if (!readonly) {
      setHoverRating(0)
    }
  }

  const displayRating = hoverRating || rating

  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star: number) => (
        <button
          key={star}
          type="button"
          onClick={() => handleClick(star)}
          onMouseEnter={() => handleMouseEnter(star)}
          onMouseLeave={handleMouseLeave}
          disabled={readonly}
          className={readonly ? 'cursor-default' : 'cursor-pointer'}
        >
          <Star
            size={size}
            className={
              star <= displayRating
                ? 'fill-yellow-400 text-yellow-400'
                : 'text-gray-600'
            }
          />
        </button>
      ))}
    </div>
  )
}
