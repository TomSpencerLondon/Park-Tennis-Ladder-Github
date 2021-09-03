import React from 'react'
import styled from 'styled-components'
import {Button} from './Buttons'

const Actions = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 1rem 0;
`
const Page = styled.div`
  display: flex;
  justify-content: center;
`

type PropTypes = {
  router: any;
  paramName: string;
  url: string;
  page: number;
  lastPage: number;
}

export const getPaginationStart = (page: number, limit: number) => +page === 1 ? 0 : (+page - 1) * limit

export const getLastPage = (count: number, limit: number) => Math.ceil(count/limit)

export default function Pagination({ router, paramName = 'page', url, page, lastPage}: PropTypes) {
  if (lastPage === 0 || lastPage === 1) return null
  return (
    <Actions>
      <Button onClick={() => router.push(`${url}&${paramName}=${page - 1}`)}
        disabled={page <= 1}>&#60; Prev</Button>
      <Page><span>Page {page}/{lastPage}</span></Page>  
      <Button onClick={() => router.push(`${url}&${paramName}=${page + 1}`)}
        disabled={page >= lastPage}>Next &#62;</Button>
    </Actions>
  )
}