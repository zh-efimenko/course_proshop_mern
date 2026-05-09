import React from 'react'
import { Pagination } from 'react-bootstrap'
import { LinkContainer } from 'react-router-bootstrap'

const Paginate = ({ pages, page, isAdmin = false, keyword = '' }) => {
  if (pages <= 1) return null
  const buildHref = (n) => {
    if (isAdmin) return `/admin/productlist/${n}`
    return keyword ? `/search/${keyword}/page/${n}` : `/page/${n}`
  }
  return (
    <nav aria-label='Pagination' style={{ display: 'flex', justifyContent: 'center' }}>
      <Pagination className='ps-pagination'>
        {[...Array(pages).keys()].map((x) => (
          <LinkContainer key={x + 1} to={buildHref(x + 1)}>
            <Pagination.Item active={x + 1 === page} aria-label={`Page ${x + 1}`}>
              {x + 1}
            </Pagination.Item>
          </LinkContainer>
        ))}
      </Pagination>
    </nav>
  )
}

export default Paginate
