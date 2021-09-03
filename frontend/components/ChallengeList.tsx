import React from 'react'
import Link from 'next/link'
import { List, ListItem } from './List'
import Avatar from './Avatar'
import { URLS } from './Nav'
import styled from 'styled-components'
import moment from 'moment'
import Status from './Status'

const TitleWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 1rem 0;
`

const Title = styled.div`
  margin: 0;
  font-size: 1.7rem;
  align-items: center;
  justify-content: center;
  display: flex;
  color: ${(props: any) => props.theme.textColor};
`

const ChallengeLink = styled.a`

`

const Name = styled.span`
  margin-top: 5px;
  ${ChallengeLink}:hover & {
    color: ${(props: any) => props.theme.menuActiveColor};
  }    
`

const Info = styled.span`
  margin-right: 5px;
}
`

const DateTime = styled.span`
  font-size: 1.1rem;
`

type Item = {
  id: string;
  status: string;
  status_updated_at: string;
  challenger: {
    id: string;
    username: string;
    avatar: { formats: { thumbnail: { url: string } } }
  };
  opponent: {
    id: string;
    username: string;
    avatar: { formats: { thumbnail: { url: string } } }
  };
  winner: {
    id: string;
  }
}

type PropTypes = {
  // user: { id: string };
  user: any; // todo 
  items?: Item[];
  emptyMessage: string;
  showInfo?: boolean;
}

function instructions(userId, challengerId, winnerId, status) {
  switch (status) {
    case 'Pending':
      return userId == challengerId
        ? 'Awaiting their response...'
        : 'Awaiting your response...'
    case 'Accepted':
       return 'Arrange your match, play and report the result.'
    case 'Played':
    case 'Forfeited':
      return userId == winnerId
        ? 'Congratulations you won!'
        : 'Better luck next time!'
  }
}

export default function ChallengeList({ user, items, emptyMessage, showInfo }: PropTypes) {

  const output = items
    .map(({ id, status, status_updated_at, challenger, opponent, winner }) => (
      <ListItem key={id}>
        <Link href={['Played', 'Forfeited'].includes(status) ? URLS.result(id) : URLS.challenge(id)}>
          <ChallengeLink>
            <TitleWrapper>
              <Title>
                {user.id == challenger.id ? (
                  <>
                    <Avatar
                      url={opponent.avatar?.formats?.thumbnail?.url}
                      alt={opponent.username}
                      width="30px"
                      height="30px"
                    />
                    <Name>{opponent.username}</Name>
                  </>
                ) : (
                    <>
                      <Avatar
                        url={challenger.avatar?.formats?.thumbnail?.url}
                        alt={challenger.username}
                        width="30px"
                        height="30px"
                      />
                      <Name>{challenger.username}</Name>
                    </>
                  )}
              </Title>
              <Status status={status} />
            </TitleWrapper>
            <TitleWrapper>
              {showInfo ? (
                <Info>{instructions(user.id, challenger.id, winner?.id, status)}</Info>
              ) : (
                <Info>&nbsp;</Info>
              )} 
              <DateTime>{moment(status_updated_at).format('Do MMM YY hh:mm a')}</DateTime>
            </TitleWrapper>
          </ChallengeLink>
        </Link>
      </ListItem>
    ))

  return (
    <List>
      {output.length > 0 ? output : (<p>{emptyMessage}</p>)}
    </List>
  )
}