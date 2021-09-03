import React, { useEffect } from 'react'
import Layout from '../../components/Layout'
import Loading from '../../components/Loading'
import { URLS } from '../../components/Nav'
import { useAuthContext } from '../../auth/AuthProvider'
// import { useSubscription } from '@apollo/react-hooks'
import { useQuery } from '@apollo/react-hooks'
import { gql } from "apollo-boost"
import Tabs, { TabPanel } from '../../components/Tabs'
import ResultList from '../../components/ResultList'
import { useRouter } from 'next/router'
import Pagination, {getPaginationStart, getLastPage} from '../../components/Pagination'
import UserList from '../../components/UserList'
import Error from '../../components/Error'
import Signin from '../signin'
import { withAuth } from '../../lib/auth'
import styled from 'styled-components'

const H2 = styled.h2`
  margin-bottom: 20px;
`

const QUERY = gql`
  query($userId: ID!, $resultLimit: Int!, $resultStart: Int!) {
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
    matchCount(where: {status: "Played", _or: [{challenger: $userId}{opponent: $userId}]}) 
    currentResults: matches(sort: "status_updated_at:desc", limit: $resultLimit, start: $resultStart, where: {status: "Played", _or: [{challenger: $userId}{opponent: $userId}]}) {
      id
      status
      ladder {
        id
        end_date
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
  }
`;

function Results() {
  const auth = useAuthContext()
  const router = useRouter()
  const userId = auth.user?.id

  // Pagination
  const resultLimit = 50
  const resultPage = +router.query?.resultPage || 1
  const resultStart = getPaginationStart(resultPage, resultLimit)  

  const { loading, error, data, refetch } = useQuery(QUERY, {
    variables: { userId, resultLimit, resultStart}
  })

  useEffect(() => {
    refetch()
  }, [refetch]);

  if (!auth.isAuthenticated) {
    return <Signin />
  }

  if (error) return <Error error='Error loading' />

  if (loading || !auth.user) return <Loading />

  const resultLastPage = getLastPage(data.matchCount, resultLimit)

  const currentResults = data.currentResults.filter(x => {
    const now = new Date();
    const endDate = new Date(x.ladder.end_date)
    return now <= endDate
  })  

  return (
    <Layout title="Results">
      <H2>My Results</H2>
      <ResultList matches={currentResults} />
      <Pagination router={router} paramName="resultPage" url={`${URLS.results()}?tab=1`}  page={resultPage} lastPage={resultLastPage} />
    </Layout>
  )
}

export default withAuth(Results)