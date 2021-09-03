import { useRouter } from 'next/router'
import styled from 'styled-components'
import Layout from '../../../../components/Layout'
import Loading from '../../../../components/Loading'
import { URLS } from '../../../../components/Nav'
import { useQuery } from "@apollo/react-hooks";
import { gql } from "apollo-boost";
import { Doughnut, Line } from 'react-chartjs-2';
import Tabs, { TabPanel } from '../../../../components/Tabs'
import Image from 'next/image'
import Avatar from '../../../../components/Avatar'
import Error from '../../../../components/Error'
import ResultList from '../../../../components/ResultList'
import ChallengeList from '../../../../components/ChallengeList'
import Pagination, { getPaginationStart, getLastPage } from '../../../../components/Pagination'

const CircularImage = styled(Image)`
  border-radius: 50%;
`

const TitleWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  margin: 1rem 0;
`

const Center = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`

const Title = styled.h3`
  margin: 0;
  width: 80%;
  font-size: 1.5rem;
  color: ${(props: any) => props.theme.textColor};
`

const Players = styled.span`
  font-weight: bold;
  line-height: 1.3;
  width: 
`

const Label = styled.label`
  width: 100%;
  cursor: pointer;
  display: none;
`;

const Normal = styled.span`
  font-weight: normal;
`
const Ability = styled.p`
  margin-top: 10px;
`

const QUERY = gql`
  query($userId: ID!, $ladderId: ID!, $resultLimit: Int!, $resultStart: Int!) {
    user(id: $userId) {
      id
      username
      skill {
        id
        name
      } 
      avatar {
        formats
      }    
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
    matchCount(where: {ladder: $ladderId, _or: [{challenger: $userId}{opponent: $userId}]}) 
    winCount: matchCount(where: {ladder: $ladderId, status: "Played", winner: $userId})
    lossCount: matchCount(where: {ladder: $ladderId, status: "Played", loser: $userId})
    forfeitCount: matchCount(where: {ladder: $ladderId, status: "Forfeited", loser: $userId})
    disputedCount: matchCount(where: {ladder: $ladderId, status: "Disputed", winner: $userId})
    playedCount: matchCount(where: {ladder: $ladderId, status: "Played", _or: [{challenger: $userId}{opponent: $userId}]}) 
    cancelledCount: matchCount(where: {ladder: $ladderId, status: "Cancelled", _or: [{challenger: $userId}{opponent: $userId}]}) 
    declinedCount: matchCount(where: {ladder: $ladderId, status: "Declined", opponent: $userId})
    expiredCount: matchCount(where: {ladder: $ladderId, status: "Expired", opponent: $userId})
    ladder(id: $ladderId) {
      id
      name
      challenge_range
      ranks(sort: "rank:asc") {
        rank
        user {
          id
          username
        }
      }
      results: matches(sort: "status_updated_at:desc", limit: $resultLimit, start: $resultStart, where: {status: "Played", _or: [{challenger: $userId}{opponent: $userId}]}) {        
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
        }
      } 
      challenges: matches(sort: "id:desc", where: {_or: [{challenger: $userId},{opponent: $userId}]}) {        
        id
        status
        status_updated_at
        ladder { 
          id
        }
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
      }                 
    }
  }
`;

/**
 * Displays a match
 */
export default function Profile() {
  const router = useRouter()
  const { userId, ladderId } = router.query

  // Pagination
  const resultLimit = 50
  const resultPage = +router.query?.resultPage || 1
  const resultStart = getPaginationStart(resultPage, resultLimit)

  const { loading, error, data } = useQuery(QUERY, {
    variables: { userId, ladderId, resultLimit, resultStart },
  })

  if (error) return <Error error='Error loading' />
  if (loading) return <Loading />

  const resultLastPage = getLastPage(data.playedCount, resultLimit)

  const { winCount, lossCount, forfeitCount, disputedCount, playedCount } = data
  const resultTotal = winCount + lossCount + forfeitCount + disputedCount
  const winPerc = (winCount / resultTotal) * 100
  const lossPerc = (lossCount / resultTotal) * 100
  const forfeitPerc = (forfeitCount / resultTotal) * 100
  const disputePerc = (disputedCount / resultTotal) * 100

  const resultData = {
    labels: [
      `${winCount} ${winCount > 1 ? 'Wins' : 'Win'} ${Number(winPerc).toFixed(1)}%`,
      `${lossCount} ${lossCount > 1 ? 'Loses' : 'Loss'}   ${Number(lossPerc).toFixed(1)}%`,
      `${forfeitCount} ${forfeitCount > 1 ? 'Forfeits' : 'Forfeit'} ${Number(forfeitPerc).toFixed(1)}%`,
      `${disputedCount} ${disputedCount > 1 ? 'Disputes' : 'Dispute'} ${Number(disputePerc).toFixed(1)}%`,
    ],
    datasets: [{
      data: [winCount, lossCount, forfeitCount, disputedCount],
      backgroundColor: [
        'green',
        'red',
        'orange',
        'grey'
      ],
      hoverBackgroundColor: [
        'green',
        'red',
        'orange',
        'grey'
      ],
      borderColor: '#222426'
    }]
  };

  const { cancelledCount, declinedCount, expiredCount } = data
  const challengeTotal = cancelledCount + declinedCount + expiredCount + playedCount
  const cancelledPerc = (cancelledCount / challengeTotal) * 100
  const declinedPerc = (declinedCount / challengeTotal) * 100
  const expiredPerc = (expiredCount / challengeTotal) * 100
  const playedPerc = (playedCount / challengeTotal) * 100

  const challengeData = {
    labels: [
      `${playedCount} Played ${Number(playedPerc).toFixed(1)}%`,
      `${declinedCount} Declined ${Number(declinedPerc).toFixed(1)}%`,
      `${expiredCount} Expired ${Number(expiredPerc).toFixed(1)}%`,
      `${cancelledCount} Cancelled ${Number(cancelledPerc).toFixed(1)}%`,
    ],
    datasets: [{
      data: [playedCount, declinedCount, expiredCount, cancelledCount],
      backgroundColor: [
        'green',
        'red',
        'orange',
        'grey'
      ],
      hoverBackgroundColor: [
        'green',
        'red',
        'orange',
        'grey'
      ],
      borderColor: '#222426'
    }]
  };

  const userRank = data?.ladder?.ranks.find(rank => rank.user.id === userId)

  if (!userRank) return <Error error='User rank not found' />

  const rank_history = [...data.user.rank_histories.map(r => r.rank), userRank.rank]

  const winningStreaks = rank_history.reduce((res, v, i, arr) => {
    if (v < arr[i - 1]) {
      res[res.length - 1]++
    } else {
      res.push(0)
    }
    return res
  }, [0])

  const losingStreaks = rank_history.reduce((res, v, i, arr) => {
    if (v > arr[i - 1]) {
      res[res.length - 1]++
    } else {
      res.push(0)
    }
    return res
  }, [0])

  const lineData = {
    labels: rank_history?.map((v, k) => k + 1),
    options: {
      scales: {
        yAxes: [{
          ticks: {
            reverse: true,
          }
        }]
      }
    },
    datasets: [
      {
        label: 'Ranking',
        fill: false,
        lineTension: 0.1,
        backgroundColor: 'rgba(75,192,192,0.4)',
        borderColor: 'rgba(75,192,192,1)',
        borderCapStyle: 'butt',
        borderDash: [],
        borderDashOffset: 0.0,
        borderJoinStyle: 'miter',
        pointBorderColor: 'rgba(75,192,192,1)',
        pointBackgroundColor: '#fff',
        pointBorderWidth: 1,
        pointHoverRadius: 5,
        pointHoverBackgroundColor: 'rgba(75,192,192,1)',
        pointHoverBorderColor: 'rgba(220,220,220,1)',
        pointHoverBorderWidth: 2,
        pointRadius: 1,
        pointHitRadius: 10,
        data: rank_history,
      },
    ]
  };

  return (
    <Layout title="Profile">
      <h2>{data.user.username}</h2>
      <Center>
        <Avatar
          url={data.user.avatar?.formats?.thumbnail?.url}
          alt={data.user.username}
          width="100px"
          height="100px"
        />
        <Ability>{data.user?.skill?.name}</Ability>
      </Center>
      <Tabs defaultIndex={router.query?.tab}>
        <TabPanel label="Stats">
          {resultTotal ? (
            <>
              <h3>Results</h3>
              <Doughnut
                data={resultData}
              />
            </>
          ) : null}
          {challengeTotal ? (
            <>
              <h3>Challenges</h3>
              <Doughnut
                data={challengeData}
              />
            </>
          ) : null}
          {rank_history.length > 1 ? (
            <>
              <h3>Rank History</h3>
              <Line
                data={lineData}
                options={lineData.options}
                width={400}
                height={400}
              />
            </>
          ) : null}
          <table className="u-full-width">
            <tbody>
              <tr>
                <td>Total Matches</td>
                <td>{playedCount}</td>
              </tr>
              <tr>
                <td>Winning Streak</td>
                <td>{Math.max(...winningStreaks)}</td>
              </tr>
              <tr>
                <td>Losing Streak</td>
                <td>{Math.max(...losingStreaks)}</td>
              </tr>
              {rank_history.length > 0 && (
                <>
                  <tr>
                    <td>Highest Rank</td>
                    <td>{Math.min(...rank_history)}</td>
                  </tr>
                  <tr>
                    <td>Lowest Rank</td>
                    <td>{Math.max(...rank_history)}</td>
                  </tr>
                </>
              )}
            </tbody>
          </table>
        </TabPanel>
        <TabPanel label="Results">
          <ResultList matches={data.ladder.results} />
          <Pagination router={router} paramName="resultPage" url={`${URLS.ladderProfile(ladderId, userId)}?tab=1`} page={resultPage} lastPage={resultLastPage} />
        </TabPanel>
        <TabPanel label="Challenges">
          <ChallengeList user={{ id: userId }} items={data.ladder.challenges} emptyMessage="No challenges" showInfo={false} />
        </TabPanel>
      </Tabs>
    </Layout>
  )
}