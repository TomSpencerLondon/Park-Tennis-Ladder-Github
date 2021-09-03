import React from 'react'
import Link from 'next/link'
import { List, ListItem } from './List'
import Avatar from './Avatar'
import {URLS} from './Nav'
import styled from 'styled-components'

const TitleWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  margin: 1rem 0;
`

const Title = styled.span`
  margin: 0;
  font-size: 1.7rem;
  align-items: center;
  display: flex;
  color: ${(props: any) => props.theme.textColor};
`

type Item = {
  id: string;
  challenger: { 
    id: string;
    username: string;
    avatar: { formats: { thumbnail: {url: string } }  }
  }; 
  opponent: { 
    id: string;
    username: string;
    avatar: { formats: { thumbnail: {url: string } }  }
  }; 
}

type PropTypes = {
  uri: string;
  user: {id: string};
  items?: Item[];
  emptyMessage: string;
}

export default function UserList({uri, user, items, emptyMessage}: PropTypes) {

  const output = items 
    .map(({id, challenger, opponent}) => (
      <ListItem key={id}>
        <Link href={`${uri}/${id}`}>
          <a>
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
                    {opponent.username}
                  </>
                ) : (
                    <>
                      <Avatar
                        url={challenger.avatar?.formats?.thumbnail?.url}
                        alt={challenger.username}
                        width="30px"
                        height="30px"
                      />
                      {challenger.username}
                    </>
                  )}
              </Title>
            </TitleWrapper>
          </a>
        </Link>
      </ListItem>
    ))

  return (
    <List>
      {output.length > 0 ? output : (<p>{emptyMessage}</p>)}
    </List>
  )
}