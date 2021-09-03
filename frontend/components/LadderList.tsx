import React from 'react'
import Link from 'next/link'
import { List, ListItem } from './List'
import Avatar from './Avatar'
import { URLS } from './Nav'
import styled from 'styled-components'
import moment from 'moment'

const TitleWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  margin: 1rem 0;
`

const Title = styled.span`
  margin: 0;
  font-size: 1.5rem;
  align-items: center;
  display: flex;
  color: ${(props: any) => props.theme.menuColor};
`

const Players = styled.div`
  display: flex;
`

const LadderLink = styled.a``

const Summary = styled.section`
  color: ${(props: any) => props.theme.textColor};
`

const H2 = styled.h2`
  color: ${(props: any) => props.theme.menuColor};
${LadderLink}:hover & {
  color: ${(props: any) => props.theme.menuActiveColor};
}`

type Item = {
  id: string;
  name: string;
  ranks: any;
  start_date: string;
  end_date: string;
}

type PropTypes = {
  items?: Item[];
  emptyMessage: string;
}

export default function LadderList({ items, emptyMessage }: PropTypes) {

  const output = items
    .map(({ id, name, ranks, start_date, end_date }) => (
      <ListItem key={name}>
        <Link href={URLS.ladder(id)} scroll={false} passHref prefetch>
          <LadderLink>
            <H2>{name}</H2>
            <Summary>
              <p>Players registered: {ranks.length}</p>
              <Players>
                {ranks.map(rank => <Avatar key={rank?.user?.id} url={rank?.user?.avatar?.formats?.thumbnail?.url} alt={rank?.user?.username} width="35px" height="35px" />).slice(0, 6)}
                {ranks.length > 6 && (<div>+ {ranks.length - 6}</div>)}
              </Players>
              <TitleWrapper>
                <span>Start Date</span>
                <span>{moment(start_date).format('Do MMMM YYYY')}</span>
              </TitleWrapper>
              <TitleWrapper>
                <span>End Date</span>
                <span>{moment(end_date).format('Do MMMM YYYY')}</span>
              </TitleWrapper>
              {/* <TitleWrapper>
                <span>Entry Fee</span>
                <span>Free</span>
              </TitleWrapper> */}
            </Summary>
          </LadderLink>
        </Link>
      </ListItem>
    ))

  return (
    <List>
      {output.length > 0 ? output : (<p>{emptyMessage}</p>)}
    </List>
  )
}