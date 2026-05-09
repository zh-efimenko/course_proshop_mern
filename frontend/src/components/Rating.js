import React from 'react'
import Icon from './Icon'

const Rating = ({ value = 0, text }) => {
  const stars = []
  for (let i = 1; i <= 5; i++) {
    let name = 'starOutline'
    if (value >= i) name = 'star'
    else if (value >= i - 0.5) name = 'starHalf'
    stars.push(<Icon key={i} name={name} size={16} />)
  }
  const label = `${value.toFixed(1)} out of 5`
  return (
    <span className='ps-rating' role='img' aria-label={label}>
      {stars}
      {text && <span className='ps-rating-count'>{text}</span>}
    </span>
  )
}

export default Rating
