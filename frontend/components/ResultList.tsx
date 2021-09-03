import React from 'react'
import Link from 'next/link'
import { List, ListItem } from './List'
import Result from './Result'
import {URLS} from './Nav'

type Match = {
  id: string;
  ladder: { id: string };
  status: 'Played'
  winner: { id: string };
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
  challenger_set_scores: number[];
  opponent_set_scores: number[];
}

type PropTypes = {
 matches?: Match[];
}

export default function ResultList({matches}: PropTypes) {

  const results = matches
    .map(match => (
      <ListItem key={match.id}>
        <Link href={URLS.result(match.id)}>
          <a>
            <Result match={match}/>
          </a>
        </Link>
      </ListItem>
    ))

  return (
    <List>
      {results.length > 0 ? results : (<p>No results.</p>)}
    </List>
  )
}