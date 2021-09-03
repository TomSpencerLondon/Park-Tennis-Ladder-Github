import { useRouter } from 'next/router'
import styled from 'styled-components'
import Layout from '../../components/Layout'
import Loading from '../../components/Loading'
import { FooterActions } from '../../components/Footer'
import { Button } from '../../components/Buttons'
import { URLS } from '../../components/Nav'
import { useQuery } from "@apollo/react-hooks";
import { gql } from "apollo-boost";
import { useAuthContext } from '../../auth/AuthProvider'
import { updateResult } from '../../lib/api'
import Avatar from '../../components/Avatar'
import { debounce } from '../../lib/utils'
import Error from '../../components/Error'
import { withAuth } from '../../lib/auth'
import Status from '../../components/Status'
import moment from 'moment'
import { toast } from 'react-toastify'

const TitleWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 1rem 0;
`

const H2 = styled.h2`
  margin-bottom: 20px;
`

const Wrapper = styled.div`
  display: flex;
  justify-content: space-around;
  align-items: center;
  margin: 1rem 0;
`

const ResultsWrapper = styled.div`
  display: flex;
  justify-content: center;
`

const ResultColumn = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
`

const Score = styled.span`
  margin: 0;
  font-size: 3rem;
  color: ${(props: any) => props.theme.textColor};
  display: flex;
  align-items: flex-start;
`

const ContactLink = styled.a`
  font-weight: bold;
  color: ${(props: any) => props.theme.linkTextColor};
`

const QUERY = gql`
  query($matchId: ID!) {
    match(id: $matchId) {
      id
      status
      updated_at
      challenger_set_scores
      opponent_set_scores      
      comment
      ladder { 
        id
        name
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
        username
      }
      loser {
        id
        username
      }      
    }
  }
`;


/**
 * Displays a match result
 */
function Match() {
  const router = useRouter()
  const { matchId } = router.query
  const auth = useAuthContext()
  const { loading, error, data } = useQuery(QUERY, {
    variables: { matchId },
  })

  const handleDispute = debounce(() => {
    updateResult(data.match.id, { status: 'Disputed' })
      .then(res => router.replace(URLS.challenge(data.match.id)))
      .catch(err => {
        toast.error(err.response.data.message, { autoClose: false })
      })
  }, 3000, true)

  if (error) return <Error error='Error loading' />
  if (loading) return <Loading />
  return (
    <Layout title="Challenge">
      <TitleWrapper>
        <H2>Result</H2>
        <Status status={data.match.status} />
      </TitleWrapper>
      <Wrapper>
        <Avatar
          url={data.match.challenger.avatar?.formats?.thumbnail?.url}
          alt={data.match.challenger.username}
          width="100px"
          height="100px"
          linkUrl={URLS.ladderProfile(data.match.ladder.id, data.match.challenger.id)}
        />
        <Avatar
          url={data.match.opponent.avatar?.formats?.thumbnail?.url}
          alt={data.match.opponent.username}
          width="100px"
          height="100px"
          linkUrl={URLS.ladderProfile(data.match.ladder.id, data.match.opponent.id)}
        />
      </Wrapper>
      <Wrapper>
        <p>
          {data.match.challenger.username}
          {data.match.challenger.id === data.match.winner.id && <>&nbsp;🏆 </>}
        </p>
        <p>vs</p>
        <p>
          {data.match.opponent.username}
          {data.match.opponent.id === data.match.winner.id && <>&nbsp;🏆 </>}
        </p>
      </Wrapper>
      <ResultsWrapper>
        <ResultColumn>
          <ResultColumn>{data.match.challenger_set_scores?.map(score => (<Score>{score} -</Score>))}</ResultColumn>
        </ResultColumn>
        <ResultColumn>
          <ResultColumn>{data.match.opponent_set_scores?.map(score => (<Score>&nbsp;{score}</Score>))}</ResultColumn>
        </ResultColumn>
      </ResultsWrapper>
      { data.match.comment && (
        <>
          <h3>Match Report</h3>
          <p>{data.match.comment}</p>
        </>
      )}
      {auth && auth?.user?.id == data.match?.loser?.id && (
        <>
          <h3>You cannot be serious!?</h3>
          <p>If you have a dispute please <ContactLink href="mailto: parktennisladders@gmail.com">contact us</ContactLink></p>
        </>
      )}
      <h3>Result At</h3>
      <p>{moment(data.match.updated_at).format('Do MMMM YYYY hh:mm a')}</p>
      <FooterActions>
        {auth && auth?.user?.id == data.match?.loser?.id && (
          <Button color="red" onClick={handleDispute}>
            Dispute Result
          </Button>
        )}
      </FooterActions>
    </Layout >
  )
}

export default withAuth(Match)