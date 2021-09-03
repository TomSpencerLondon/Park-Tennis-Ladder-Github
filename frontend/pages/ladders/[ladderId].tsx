import React, { useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import styled from 'styled-components'
import Layout from '../../components/Layout'
import Loading from '../../components/Loading'
import { List, ListItem } from '../../components/List'
import { FooterActions } from '../../components/Footer'
import { ButtonLink, ButtonLinkSmall } from '../../components/Buttons'
import { URLS } from '../../components/Nav'
import { useQuery } from '@apollo/react-hooks'
import { gql } from 'apollo-boost'
import { postRank } from '../../lib/api'
import { useAuthContext } from '../../auth/AuthProvider'
import Tabs, { TabPanel } from '../../components/Tabs'
import { FaEnvelope } from 'react-icons/fa'
import Avatar from '../../components/Avatar'
import Status from '../../components/Status'
import ResultList from '../../components/ResultList'
import Pagination, { getPaginationStart, getLastPage } from '../../components/Pagination'
import Error from '../../components/Error'
import Rules from '../../components/Rules'

const AnchorLink = styled.a`
  height: 100%;
  width: 100%;
  display: flex;
  align-items: center;
  padding: 5px;
`

const GreenDot = styled.span`
  height: 10px;
  width: 10px;
  background-color: green;
  border-radius: 50%;
  display: inline-block;
  position: relative;
  top: 8px;
  right: 18px;
  border: 1px solid white;
`

const OrangeDot = styled.span`
  height: 10px;
  width: 10px;
  background-color: orange;
  border-radius: 50%;
  display: inline-block;
  position: relative;
  top: 8px;
  right: 18px;
  border: 1px solid white;
`

const InfoLinks = styled.div`
  word-wrap:break-word;
  white-space:normal; 
`

const SmallAnchorLink = styled.a`
  color: ${(props: any) => props.theme.linkTextColor};
  white-space: nowrap;
`

const Divider = styled.span`
  color: ${(props: any) => props.theme.dividerColor};
  margin: 0.25em;
`

const ProfileName = styled.span`
  font-size: 1.7rem;
  color: ${(props: any) => props.active ? props.theme.menuActiveColor : props.theme.textColor};
  ${AnchorLink}:hover & {
    color: ${(props: any) => props.theme.menuActiveColor};
  } 
`

const TitleWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  margin: 0;
`

const Title = styled.span`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 0;
  font-size: 1.5rem 1;
  color: ${(props: any) => props.theme.linkTextColor};
`

const StatusWrapper = styled.div`
  display: flex;
  align-items: center;
`

const ChallengeLink = styled.a`
  display: flex;
  align-items: center;
  padding: 5px;
  &:hover {
    color:  ${(props: any) => props.theme.menuActiveColor};
  }  
`

const Rank = styled.span`
  font-size: 2em;
  margin-right: 10px;
  color: ${(props: any) => props.active ? props.theme.menuActiveColor : props.theme.textColor};
  ${AnchorLink}:hover & {
    color: ${(props: any) => props.theme.menuActiveColor};
  } 
`

const QUERY = gql`
  query($userId: ID!, $ladderId: ID!, $rankLimit: Int!, $rankStart: Int!, $resultLimit: Int!, $resultStart: Int!) {
    user(id: $userId) {
      id
      username
      firstname
      lastname
      away
      avatar {
        formats
      }
      currentRank: ranks (where: {user: $userId, ladder: $ladderId}) {
        rank
      }
    }
    rankCount(where: { ladder: $ladderId })
    matchCount(where: { ladder: $ladderId, status: "Played" })
    ladder(id: $ladderId) {
      id
      name
      challenge_range
      downward_challenges 
      end_date
      link_about
      link_directions
      link_bookings
      link_coaching
      link_shop
      ranks(sort: "rank:asc", limit: $rankLimit, start: $rankStart) {
        user {
          id
          username
          skill {
            id
            name
          }
          avatar {
            formats
          }
          away
          rank_histories (where: {match: {ladder: $ladderId}}, sort: "created_at:asc") {
            rank
            created_at
            match {
              ladder {
                id
              }
            }
          }            
        }
        rank
      }
      challenges_pending: matches(where: {status: "Pending"}, sort: "status_updated_at:desc", limit: $resultLimit, start: $resultStart) {
        id
        status
        ladder {
          id
        }
        challenger {
          id
          username
        }
        opponent {
          id
          username
        }
      }
      challenges_accepted: matches(where: {status: "Accepted"}, sort: "status_updated_at:desc", limit: $resultLimit, start: $resultStart) {
        id
        status
        ladder {
          id
        }
        challenger {
          id
          username
        }
        opponent {
          id
          username
        }
      }      
      results: matches(where: {status: "Played"}, sort: "status_updated_at:desc", limit: $resultLimit, start: $resultStart) {
        id
        status
        ladder {
          id
        }
        challenger_set_scores
        opponent_set_scores
        challenger {
          id
          username
          avatar {
            formats
          }
        }
        opponent {
          id
          username
          avatar {
            formats
          }
        }
        winner {
          id
          username
        }
        loser {
          id
          username
        }      
      }      
    }
  }
`;

/**
 * Displays a list of ladder players
 */
export default function Ladders() {
  const router = useRouter()
  const auth = useAuthContext()
  const { ladderId } = router.query
  const userId = auth?.user?.id ? auth.user.id : '0'

  // Pagination
  const rankLimit = 100
  const resultLimit = 50
  const rankPage = +router.query?.rankPage || 1
  const resultPage = +router.query?.resultPage || 1
  const rankStart = getPaginationStart(rankPage, rankLimit)
  const resultStart = getPaginationStart(resultPage, resultLimit)

  const { loading, error, data, refetch } = useQuery(QUERY, {
    variables: { userId, ladderId, rankLimit, rankStart, resultLimit, resultStart }
  })

  useEffect(() => {
    refetch()
  }, [refetch]);

  if (error) return <Error error='Error loading' />
  if (loading) return <Loading />
  if (!data.ladder) return <Error error='Ladder not found' />

  const rankLastPage = getLastPage(data.rankCount, rankLimit)
  const resultLastPage = getLastPage(data.matchCount, resultLimit)

  const currentRank = data?.user?.currentRank
  const currentUserRank = (currentRank && currentRank.length === 1) ? currentRank[0] : null

  const now = new Date()
  const endDate = new Date(data.ladder.end_date)
  const isArchived = endDate < now

  const userAcceptedCounts = Object.entries(data.ladder.challenges_accepted.reduce((acc, r) => {
    acc[r.challenger.id] = acc[r.challenger.id] ? acc[r.challenger.id] + 1 : 1
    acc[r.opponent.id] = acc[r.opponent.id] ? acc[r.opponent.id] + 1 : 1
    return acc
  }, {}))

  function countAccepted(userId) {
    const count = userAcceptedCounts.find(([id]) => id == userId)
    return count ? count[1] : 0
  }

  const userPendingCounts = Object.entries(data.ladder.challenges_pending.reduce((acc, r) => {
    acc[r.challenger.id] = acc[r.challenger.id] ? acc[r.challenger.id] + 1 : 1
    acc[r.opponent.id] = acc[r.opponent.id] ? acc[r.opponent.id] + 1 : 1
    return acc
  }, {}))

  function countPending(userId) {
    const count = userPendingCounts.find(([id]) => id == userId)
    return count ? count[1] : 0
  }

  function hotStreak(currentRank, rank_histories) {
    if (rank_histories.length < 3) return null;
    const lastThree = rank_histories.slice(-3)
    if (currentRank < lastThree[2].rank && lastThree[2].rank < lastThree[1].rank && lastThree[1].rank < lastThree[0].rank) {
      return ' 🔥 ';
    }
    return null;
  }

  function getStarPlayerId() {
    if (!data.ladder.results || data.ladder.results.length === 0) return null
    const userMatchCounts = Object.entries(data.ladder.results.reduce((acc, r) => {
      acc[r.challenger.id] = acc[r.challenger.id] ? acc[r.challenger.id] + 1 : 1
      acc[r.opponent.id] = acc[r.opponent.id] ? acc[r.opponent.id] + 1 : 1
      return acc
    }, {}))
    const starPlayerId = userMatchCounts.reverse() // Return most recent player
      .reduce((p, v): any => {
        const result = (Number(p[1]) > Number(v[1]) ? p : v);
        // console.log(p[1], v[1], result)
        return result
      });
    return starPlayerId[0]
  }

  const starPlayerId = getStarPlayerId()

  const ranks = data?.ladder?.ranks.map((v, i) => (
    <ListItem key={v.user.username} styles={{overflow: 'scroll'}}>
      <TitleWrapper>
        <Title>
          <Link href={URLS.ladderProfile(ladderId, v.user?.id)}>
            <AnchorLink name={'user' + v.user.id} id={v.user.id}>
              <Rank active={v.user.id == auth?.user?.id}>{i + 1}</Rank>
              <Avatar
                url={v.user?.avatar?.formats?.thumbnail?.url}
                alt={v.user?.username}
                width="30px"
                height="30px"
              />
              {countAccepted(v.user?.id) != 0 ? (
                <GreenDot />
              ) : (
                  countPending(v.user?.id) != 0 ? (
                    <OrangeDot />
                  ) : (null)
                )}
              <ProfileName active={v.user.id == auth?.user?.id}>
                {v.user.username} <br/>
                {/* {i === 0 ? '🥇 ' : null}{i === 1 ? '🥈 ' : null}{i === 2 ? '🥉 ' : null}  */}
                {starPlayerId == v.user.id ? '  ⭐  ' : null}
                {v.user.away ? ' ⛱ ️' : null}
                {hotStreak(v.rank, v.user.rank_histories)}
                {/* // {resultStatus(v.user.id)} */}
              </ProfileName>
            </AnchorLink>
          </Link>
        </Title>
          {/* <Link href={URLS.ladderProfile(ladderId, v.user?.id)}>
            <StatusWrapper>
              <Status status="Accepted" count={countAccepted(v.user.id)} />
              &nbsp;
              <Status status="Pending" count={countPending(v.user.id)} />
            </StatusWrapper>
          </Link> */}
        {(!v.user.away && currentUserRank && currentUserRank.rank !== v.rank // can't challenge self
          && ((!data.ladder.downward_challenges && currentUserRank.rank > v.rank)  // downward challenges?
            || (v.rank >= (currentUserRank.rank - data.ladder.challenge_range)))) && ( // upward challenge range
            <Link href={URLS.makeChallenge(data.ladder?.id, v.rank.user?.id)} as={URLS.makeChallenge(data.ladder?.id, v.user?.id)}>
              <ButtonLinkSmall>
                Challenge
              </ButtonLinkSmall>
            </Link>
          )}
      </TitleWrapper>
    </ListItem>
  ))

  // console.log('SHOW WARN', auth.isAuthenticated && !auth.user.availability, auth.isAuthenticated, !auth.user.availability)
  // if (auth.isAuthenticated && !auth.user.availability) {
  // console.log('SHOW COMPLEE PRFILE')
  // toast.warn('Please complete your profile before joining a ladder')
  // }
  // const upcomingMatches = data?.ladder.matches
  //   .filter(({ status }) => (status === 'Accepted'))
  //   .map(({ id, challenger, opponent }) => (
  //     <MarqueeItem>{challenger.username} vs {opponent.username}</MarqueeItem>
  //   ))

  const infoLinkTitles: { [key: string]: string } = {
    link_about: 'About',
    link_directions: 'Directions',
    link_bookings: 'Court Bookings',
    link_coaching: 'Coaching',
    link_shop: 'Shop'
  }

  return (
    <Layout title="Ladders">
      {/* <h2>Bristol &gt; {data.ladder.name}</h2> */}
      <h2>{data.ladder.name}</h2>
      <InfoLinks>
        {Object.entries(infoLinkTitles).map(([key, title]) => (data.ladder[key] ? (
          <span key={key}>
            <SmallAnchorLink href={data.ladder[key]} target="_blank">{title}</SmallAnchorLink>
            <Divider>|</Divider>
          </span>) : null
        ))}
        {auth.isAuthenticated && (
          <>
            <SmallAnchorLink href="https://www.facebook.com/groups/4506737149337483" target="_blank">Facebook Group</SmallAnchorLink>
            <Divider>|</Divider>        
            <SmallAnchorLink href="https://chat.whatsapp.com/FXAgq0Iakf9EU4CRS3LWdv">WhatsApp</SmallAnchorLink>
            <Divider>|</Divider>        
          </>
        )}
        <SmallAnchorLink href={`${URLS.ladderPrizes(ladderId)}`}>Prizes!</SmallAnchorLink>
      </InfoLinks>
      {/* { upcomingMatches &&
        <Marquee>{[
          <MarqueeItem>👑 &nbsp;&nbsp; SPANDEX {new Date().getFullYear()} &nbsp;&nbsp;👑 </MarqueeItem>,
          <MarqueeItem>UPCOMING MATCHES... </MarqueeItem>,
          ...upcomingMatches]}
        </Marquee>} */}
        <Tabs defaultIndex={router.query?.tab}>
          <TabPanel label="Ranks">
            <>
              <List>
                {ranks.length > 0 ? ranks : (<p>No players.</p>)}
              </List>
              <Pagination router={router} paramName="rankPage" url={`${URLS.ladder(ladderId)}?tab=0`} page={rankPage} lastPage={rankLastPage} />
            </>
          </TabPanel>
          <TabPanel label="Results">
            <ResultList matches={data.ladder.results} />
            <Pagination router={router} paramName="resultPage" url={`${URLS.ladder(ladderId)}?tab=1`} page={resultPage} lastPage={resultLastPage} />
          </TabPanel>
          <TabPanel label="Rules">
            <Rules />
          </TabPanel>
          {/* <TabPanel label="INFO">
          <div>
            <a>About</a> | 
            <a> Directions</a> | 
            <a> Court Bookings</a> | 
            <a> Shop</a>
          </div>
        </TabPanel>         */}
        </Tabs>

        {(!currentUserRank && !isArchived) ? (
          <FooterActions>
            {auth.isAuthenticated ? (
              <Link href={URLS.ladderJoin(ladderId)} passHref>
                <ButtonLink>Join Ladder</ButtonLink>
              </Link>
            ) : (
                <Link href={URLS.register()} passHref>
                  <ButtonLink>
                    Join Ladder
              </ButtonLink>
                </Link>
              )}
          </FooterActions>
        ) : null}
    </Layout>
  )
}
