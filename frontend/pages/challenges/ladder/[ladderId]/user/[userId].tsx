import { useState, useCallback } from 'react'
import { useRouter } from 'next/router'
import styled from 'styled-components'
import Layout from '../../../../../components/Layout'
import Loading from '../../../../../components/Loading'
import Avatar from '../../../../../components/Avatar'
import ChallengeList from '../../../../../components/ChallengeList'
import Tabs, { TabPanel } from '../../../../../components/Tabs'
import { FooterActions } from '../../../../../components/Footer'
import { Button } from '../../../../../components/Buttons'
import { URLS } from '../../../../../components/Nav'
import { useQuery } from "@apollo/react-hooks";
import { gql } from "apollo-boost";
import { useAuthContext } from '../../../../../auth/AuthProvider'
import { createChallenge } from '../../../../../lib/api'
import Section from '../../../../../components/Section'
import { debounce } from '../../../../../lib/utils'
import Error from '../../../../../components/Error'
import { withAuth } from '../../../../../lib/auth'
import { toast } from 'react-toastify'
import * as gtag from '../../../../../lib/gtag'

const Center = styled.div`
  width: 100%;
  display: flex;
  justify-content: center;
`

const QUERY = gql`
  query($userId: ID!, $ladderId: ID!) {
    ladder(id: $ladderId) {
      id
      name   
    }
    user(id: $userId) {
      id
      username
      availability
      avatar {
        formats
      }
    }     
  }
`;

/**
 * Creates a challenge
 */
function Challenges() {
  const router = useRouter()
  const { ladderId, userId } = router.query
  const auth = useAuthContext()
  const { loading, error, data } = useQuery(QUERY, {
    variables: { ladderId, userId },
  })

  const onCreate = useCallback(debounce(() => {
    const data = { ladderId, opponentId: Number(userId) }
    createChallenge(data)
      .then(res => {
        gtag.event({
          action: 'create',
          category: 'Challenge',
          label: '[create_label]',
          value: '[create_value]'
        })        
        router.replace(URLS.challenge(res.data.id))
      })
      .catch(err => {
        if (err.response?.status == 401) {
          router.replace(URLS.login())
        }
        toast.error(err.response.data.message, { autoClose: false })
      })
  }, 3000, true), [])

  if (error) return <Error error='Loading error' />
  if (loading || !auth.user) return <Loading />
  if (!data.user) return <Error error='User not found' />
  if (!data.ladder) return <Error error='Ladder not found' />

  const { availability, email, phone } = data.user

  return (
    <Layout title="Challenge">
      <h2>Challenge</h2>
      <Center>
        <Avatar
          url={data.user.avatar?.formats?.thumbnail?.url}
          alt={data.user.username}
          width="100px"
          height="100px"
          linkUrl={URLS.ladderProfile(data.ladder.id, data.user.id)}
        />
      </Center>
        <Center>
          <p>{data.user.username}</p>
        </Center>
      <Section title="Availability" text={availability} />
      <h3>Info</h3>
      <ul className="info">
        <li>Your opponent has 3 days to accept or decline your challenge.</li>
        {/* <li>If the challenge exipires you automatically win the match.</li> */}
      </ul>
      <FooterActions>
        <Button type="submit" onClick={onCreate}>
          Send Challenge
            </Button>
      </FooterActions>
    </Layout>
  )
}

export default withAuth(Challenges)