import React from 'react'

const Loader = ({ inline = false, label = 'Loading' }) => (
  <span
    role='status'
    aria-live='polite'
    className={inline ? 'ps-loader' : 'ps-loader ps-loader--block'}
  >
    <span style={{ position: 'absolute', width: 1, height: 1, padding: 0, margin: -1, overflow: 'hidden', clip: 'rect(0,0,0,0)', whiteSpace: 'nowrap', border: 0 }}>
      {label}
    </span>
  </span>
)

export default Loader
