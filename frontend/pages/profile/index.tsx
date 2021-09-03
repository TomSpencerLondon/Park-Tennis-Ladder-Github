import styled from 'styled-components'
import {useState, useEffect } from 'react'
import Link from 'next/link'
import Layout from '../../components/Layout'
import Avatar from '../../components/Avatar'
import Error from '../../components/Error'
import Section from '../../components/Section'
import { FooterActions } from '../../components/Footer'
import Loading from '../../components/Loading'
import { ButtonLink } from '../../components/Buttons'
import { URLS } from '../../components/Nav'
import { withAuth } from '../../lib/auth'
import { getProfile } from '../../lib/api';
import { SIGKILL } from 'constants'

const Center = styled.div`
  width: 100%;
  display: flex;
  justify-content: center;
`

function Profile({ auth }) {
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<any>()
  const [error, setError] = useState()

  useEffect(() => {
    getProfile()
      .then((res: any) => {
        setData(res.data)
        setLoading(false)
      }).catch(setError)
  }, [])

  if (error) return <Error error='Error loading' />
  if (loading) return <Loading />

  const { username, email, firstname, lastname, phone, away, skill, availability, avatar } = data || {}
  return (
    <Layout title="Tennis player profile">
      <h2>{firstname} {lastname}</h2>
      <Center>
      <Avatar
        url={avatar?.formats?.thumbnail?.url}
        alt={username}
        width="100px"
        height="100px"/>
      </Center>
      <Center>
        <p>{away ? 'Away' : 'Available'}</p>
      </Center>
        <h3>Email</h3>
        <p>{email}</p>
        <Section title="Phone" text={phone} />
        <Section title="Ability" text={skill?.name} />
        <Section title="Availability" text={availability} />
      <FooterActions>
        <Link href={URLS.profileEdit()} passHref>
          <ButtonLink>
            Edit Profile
            </ButtonLink>
        </Link>
        <Link href={URLS.logout()} passHref>
          <ButtonLink color="red">
            Log out
            </ButtonLink>
        </Link>
      </FooterActions>
    </Layout>
  )
}

export default withAuth(Profile)