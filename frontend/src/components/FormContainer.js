import React from 'react'

const FormContainer = ({ children, narrow = false }) => (
  <div className='ps-container' style={{ paddingTop: 32 }}>
    <div style={{ maxWidth: narrow ? 420 : 480, margin: '0 auto' }}>
      {children}
    </div>
  </div>
)

export default FormContainer
