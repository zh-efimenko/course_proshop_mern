import React from 'react'
import Icon from './Icon'

const variantToIcon = {
  success: 'check',
  warning: 'alertCircle',
  danger: 'alertCircle',
  info: 'alertCircle',
}

const Message = ({ variant = 'info', children }) => {
  const role = variant === 'danger' ? 'alert' : 'status'
  return (
    <div className={`ps-alert ps-alert--${variant}`} role={role}>
      <Icon name={variantToIcon[variant] || 'alertCircle'} size={18} />
      <div>{children}</div>
    </div>
  )
}

export default Message
