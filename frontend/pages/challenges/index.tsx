import React, { useEffect } from 'react'
import Layout from '../../components/Layout'
import Loading from '../../components/Loading'
import Error from '../../components/Error'
import { useAuthContext } from '../../auth/AuthProvider'
import { gql } from "apollo-boost"
import styled from 'styled-components'
import ChallengeList from '../../components/ChallengeList'
import Tabs, { TabPanel } from '../../components/Tabs'
import { URLS } from '../../components/Nav'
import { withAuth } from '../../lib/auth'
import { useRouter } from 'next/router'
import Pagination, { getPaginationStart, getLastPage } from '../../components/Pagination'
// import { useSubscription } from "@apollo/react-hooks"
import { useQuery} from "@apollo/react-hooks"

const H2 = styled.h2`
  margin-bottom: 20px;
`

const QUERY = gql`
  query($userId: ID!, $challengeLimit: Int!, $challengeStart: Int!) {
    user(id: $userId) {
      id
      username
      ranks {
        ladder {
          id
          name
        }
      }
    }
    challengeCount: matchCount(where: {_or: [{challenger: $userId}{opponent: $userId}]}) 
    inbox_challenges: matches(sort: "status_updated_at:desc", limit: $challengeLimit, start: $challengeStart, where: {_or: [{challenger: $userId}{opponent: $userId}], status_updated_by_ne: $userId}) {      
      id
      status
      status_updated_at
      ladder {
        end_date
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
      winner {
        id
      }
    }       
    outbox_challenges: matches(sort: "status_updated_at:desc", limit: $challengeLimit, start: $challengeStart, where: {status_updated_by: $userId}) {      
      id
      status
      status_updated_at
      ladder {
        end_date
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
      winner {
        id
      }
    }          
    challenges: matches(sort: "status_updated_at:desc", limit: $challengeLimit, start: $challengeStart, where: {_or: [{challenger: $userId}{opponent: $userId}]}) {      
      id
      status
      status_updated_at
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
  }
`;

function Challenges() {
  const auth = useAuthContext()
  const router = useRouter()
  const userId = auth.user?.id

  // Pagination
  const challengeLimit = 50
  const challengePage = +router.query?.challengePage || 1
  const challengeStart = getPaginationStart(challengePage, challengeLimit)

  const { loading, error, data, refetch } = useQuery(QUERY, {
    variables: { userId, challengeLimit, challengeStart }
  })

  useEffect(() => {
    refetch()
  }, [refetch]);

  if (error) return <Error error='Loading error' />

  if (loading) return <Loading />

  const challengeLastPage = getLastPage(data.challengeCount, challengeLimit)

  const inbox_challenges = data.inbox_challenges.filter(x => {
    const now = new Date();
    const endDate = new Date(x.ladder.end_date)
    return now <= endDate
  })
  
  const outbox_challenges = data.outbox_challenges.filter(x => {
    const now = new Date();
    const endDate = new Date(x.ladder.end_date)
    return now <= endDate
  })  

  return (
    <Layout title="Challenges">
      <h2>My Challenges</h2>
      <Tabs defaultIndex={router.query?.tab}>
        <TabPanel label="Inbox">
          <ChallengeList user={auth.user} items={inbox_challenges} showInfo emptyMessage="You currently have no challenges." />
        </TabPanel>
        <TabPanel label="Sent">
          <ChallengeList user={auth.user} items={outbox_challenges} emptyMessage="No challenges sent." />
        </TabPanel>
      </Tabs>
      <Pagination router={router} paramName="challengePage" url={`${URLS.challenges()}?tab=0`} page={challengePage} lastPage={challengeLastPage} />
    </Layout>
  )
}

export default withAuth(Challenges)