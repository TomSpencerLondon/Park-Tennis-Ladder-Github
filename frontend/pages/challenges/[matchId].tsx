import { useState, useCallback, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import styled from 'styled-components'
import Layout from '../../components/Layout'
import Loading from '../../components/Loading'
import Error from '../../components/Error'
import { FooterActions } from '../../components/Footer'
import { Button, ButtonLink } from '../../components/Buttons'
import { URLS } from '../../components/Nav'
import Avatar from '../../components/Avatar'
import Status from '../../components/Status'
import { gql } from "apollo-boost"
import { updateChallenge } from '../../lib/api'
import { debounce } from '../../lib/utils'
import { withAuth } from '../../lib/auth'
import { findChallenge } from '../../lib/api'
import { toast } from 'react-toastify'

const TitleWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 1rem 0;
`

const Wrapper = styled.div`
  display: flex;
  justify-content: space-around;
  align-items: center;
  margin: 1rem 0;
`

const Center = styled.div`
  width: 100%;
  display: flex;
  justify-content: center;
`

function Challenge({ auth }) {
  const router = useRouter()
  const { matchId } = router.query
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<any>()
  const [error, setError] = useState();

  useEffect(() => {
    findChallenge(matchId)
      .then((res: any) => {
        setData(res.data)
        setLoading(false)
      })
      .catch(err => {
        setError(err.response.data)
      })
  }, [])

  if (error) return <Error error={error} />

  if (loading || !auth.user) return <Loading />

  if (!['Pending', 'Accepted'].includes(data.status)) {
    return <ChallengeStatus data={data} />
  }

  return auth.user.id == data.opponent.id ? (
    <Challengee router={router} data={data} />
  ) : (
      <Challenger router={router} data={data} />
    )
}

/**
 * Displays a challenge status of cancelled or declined
 *
 */
function ChallengeStatus({ data }) {

  return (
    <Layout title="Challenge">
      <TitleWrapper>
        <h2>Challenge</h2>
        <Status status={data.status} />
      </TitleWrapper>
      <Wrapper>
        <Avatar
          url={data.challenger?.avatar?.formats?.thumbnail?.url}
          alt={data.challenger.username}
          width="100px"
          height="100px"
          linkUrl={URLS.ladderProfile(data.ladder.id, data.challenger.id)}
        />
        <Avatar
          url={data.opponent?.avatar?.formats?.thumbnail?.url}
          alt={data.opponent.username}
          width="100px"
          height="100px"
          linkUrl={URLS.ladderProfile(data.ladder.id, data.opponent.id)}
        />
      </Wrapper>
      <Wrapper>
        <p>{data.challenger.username}</p>
        <p>vs</p>
        <p>{data.opponent.username}</p>
      </Wrapper>
    </Layout >
  )
}

/**
 * Displays a challenge to the challengee (the opponent)
 * - they are to accept with the agreed match date time or decline 
 */
function Challengee({ router, data }) {
  const [challengeAlertCount, setChallengeAlertCount] = useState<number>()

  useEffect(() => {
    const challengeAlertCount = Number(window.localStorage.getItem('challengeAlertCount'))
    setChallengeAlertCount(challengeAlertCount);
  }, [challengeAlertCount]);

  const handleAccept = useCallback(debounce(() => {
    updateChallenge(data.id, { status: 'Accepted' })
      .then(res => {
        setChallengeAlertCount(challengeAlertCount-1)
        // router.replace(URLS.home())
        router.replace(URLS.challenge(data.id))
      })
      .catch(err => {
        toast.error(err.response.data.message, { autoClose: false })
      })
  }, 3000, true), [])

  const handleDecline = useCallback(debounce(() => {
    const decline = data.ladder.deny_challenge_rank_change
      ? confirm('Are you sure you want to decline the challenge?  You will forfiet your ladder rank')
      : true

    if (decline) {
      updateChallenge(data.id, { status: 'Declined' })
        .then(res => router.replace(URLS.challenge(data.id)))
        .catch(err => {
          toast.error(err.response.data.message, { autoClose: false })
        })
    }
  }, 3000, true), [])

  const handleCancel = useCallback(debounce(() => {
    const cancel = confirm('Are you sure you want to cancel the challenge?')
    if (cancel) {
      updateChallenge(data.id, { status: 'Cancelled' })
        .then(res => router.replace(URLS.challenge(data.id)))
        .catch(err => {
          toast.error(err.response.data.message, { autoClose: false })
        })
    }
  }, 3000, true), [])

  return (
    <Layout title="Challenge">
      <TitleWrapper>
        <h2>Challenge</h2>
        <Status status={data.status} />
      </TitleWrapper>
      <Center>
        <Avatar
          url={data.challenger?.avatar?.formats?.thumbnail?.url}
          alt={data.challenger.username}
          width="100px"
          height="100px"
          linkUrl={URLS.ladderProfile(data.ladder.id, data.challenger.id)}
        />
      </Center>
      <Center>
        {data.challenger.username}
      </Center>
      { data.opponent.challenger && (
        <>
          <h3>Availability</h3>
          <p>{data.opponent.availability}</p>
        </>
      )}
      <h3>Email</h3>
      <p><a href={`mailto: ${data.challenger.email}`}>{data.challenger.email}</a></p>
      { data.challenger.phone && (
        <>
          <h3>Phone</h3>
          <p><a href={`tel: ${data.challenger.phone}`}>{data.challenger.phone}</a></p>
        </>
      )}
      <h3>Info</h3>
      <ul className="info">
        {data.status === 'Accepted' ? (
          <>
            <li>You have 10 days to arrange and play the match.</li>
            <li>If the challenge expires you both move a place down the ladder.</li>
            <li>You may cancel the challenge without penalty.</li>
          </>
        ) : (
            <>
              <li>Please note you have 3 days to accept or decline this challenge.</li>
              <li>If the challenge expires you automatically lose the match and move down a place on the ladder.</li>
            </>
          )
        }
      </ul>
      <FooterActions>
        {data.status === 'Accepted' ? (
          <>
            <Link href={URLS.report(data.id)} passHref>
              <ButtonLink>
                Match Report
              </ButtonLink>
            </Link>
            <Button color="red" onClick={handleCancel}>
              Cancel
            </Button>
          </>
        ) : (
            <>
              <Button type="submit" onClick={handleAccept}>
                Accept
              </Button>
              <Button color="red" onClick={handleDecline}>
                Decline
              </Button>
            </>
          )
        }
      </FooterActions >
    </Layout >
  )
}

/**
 * Displays a challenge to the challenger
 * - allows them to cancel the challenge
 */
function Challenger({ router, data }) {

  const handleCancel = useCallback(debounce(() => {
    const cancel = confirm('Are you sure you want to cancel the challenge?')
    if (cancel) {
      updateChallenge(data.id, { status: 'Cancelled' })
        .then(res => router.replace(URLS.challenge(data.id)))
        .catch(err => {
          toast.error(err.response.data.message, { autoClose: false })
        })
    }
  }, 3000, true), [])

  return (
    <Layout title="Challenge">
      <TitleWrapper>
        <h2>Challenge</h2>
        <Status status={data.status} />
      </TitleWrapper>
      <Center>
        <Avatar
          url={data.opponent?.avatar?.formats?.thumbnail?.url}
          alt={data.opponent.username}
          width="100px"
          height="100px"
          linkUrl={URLS.ladderProfile(data.ladder.id, data.opponent.id)}
        />
      </Center>
      <Center>
        {data.opponent.username}
      </Center>
      { data.opponent.availability && (
        <>
          <h3>Availability</h3>
          <p>{data.opponent.availability}</p>
        </>
      )}
      <h3>Email</h3>
      <p><a href={`mailto: ${data.opponent.email}`}>{data.opponent.email}</a></p>
      { data.opponent.phone && (
        <>
          <h3>Phone</h3>
          <p><a href={`tel: ${data.opponent.phone}`}>{data.opponent.phone}</a></p>
        </>
      )}
      <h3>Info</h3>
      <ul className="info">
        {data.status === 'Accepted' ? (
          <>
            <li>You have 10 days to arrange and play the match.</li>
            <li>If the challenge expires you both move a place down the ladder.</li>
            <li>If you can’t find a mutually convenient time you can cancel the match without penalty.</li>
          </>
        ) : (
            <>
              <li>Your opponent has 3 days to accept or decline this challenge.</li>
              <li>If your opponent does not respond automatically you move above them on the ladder</li>
              <li>You may cancel the challenge without penalty.</li>
            </>
          )
        }
      </ul>
      <FooterActions>
        {data.status === 'Accepted' ? (
          <>
            <Link href={URLS.report(data.id)} passHref>
              <ButtonLink>
                Match Report
              </ButtonLink>
            </Link>
            <Button color="red" onClick={handleCancel}>
              Cancel
            </Button>
          </>
        ) : (
            <Button color="red" onClick={handleCancel}>
              Cancel Challenge
            </Button>
          )
        }
      </FooterActions>
    </Layout >
  )
}

export default withAuth(Challenge)