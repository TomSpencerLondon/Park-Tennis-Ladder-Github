import React from 'react'
import styled from 'styled-components'
import Avatar from './Avatar'
import {URLS} from './Nav'

const ResultRow = styled.div`
  display: flex;
  justify-content: space-between;
  margin: 1rem 0;
`

const ResultItem = styled.span`
  margin: 0;
  font-size: 1.5rem;
  color: ${(props: any) => props.theme.textColor};
  display: flex;
  align-items: flex-start;
` 

const Score = styled.span`
  margin: 0 4px;
` 

const Loser = styled.span`
  color: #969696;
` 

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
  match: Match;
}

function donuts(score) {
  return score.filter(s => s == 0).map(s => '  🍩  ')
}

export default function Result({ match }: PropTypes) {
  const {challenger, ladder, opponent, challenger_set_scores, opponent_set_scores, winner, status} = match
  if (status !== 'Played') return null

  return (
    <>
      <ResultRow>
        <ResultItem>
          <Avatar
            url={challenger?.avatar?.formats?.thumbnail?.url}
            alt={challenger?.username}
            width="30px"
            height="30px"
            linkUrl={URLS.ladderProfile(ladder.id, challenger.id)}
          />
        &nbsp; {winner?.id === challenger?.id 
          ? (<span>{challenger?.username}&nbsp;🏆 &nbsp;</span>)
          : (<Loser>{challenger?.username}&nbsp;</Loser>)} 
          {donuts(challenger_set_scores)} 
          </ResultItem>
        <ResultItem>{challenger_set_scores?.map((score, i) => (<Score key={i} >{score > opponent_set_scores[i] ? score : <Loser>{score}</Loser>}</Score>))}</ResultItem>
      </ResultRow>
      <ResultRow>
        <ResultItem>
          <Avatar
            url={opponent?.avatar?.formats?.thumbnail?.url}
            alt={opponent?.username}
            width="30px"
            height="30px"
            linkUrl={URLS.ladderProfile(ladder.id, opponent.id)}
          />
        &nbsp; {winner?.id === opponent?.id 
          ? (<span>{opponent?.username}&nbsp;🏆 &nbsp;</span>)
          : (<Loser>{opponent?.username}&nbsp;</Loser>)}           
          {donuts(opponent_set_scores)}
          </ResultItem>
        <ResultItem>{opponent_set_scores?.map((score, i) => (<Score key={i}>{score > challenger_set_scores[i] ? score : <Loser>{score}</Loser>}</Score>))}</ResultItem>
      </ResultRow>
    </>
  )
}
