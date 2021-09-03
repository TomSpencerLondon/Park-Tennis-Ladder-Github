import React from 'react'
import Layout from '../../../components/Layout'
import { useRouter } from 'next/router'
import { FooterActions } from '../../../components/Footer'
import { ButtonLink } from '../../../components/Buttons'
import Link from 'next/link'
import { URLS } from '../../../components/Nav'

export default function Welcome() {
  const router = useRouter()
  const { ladderId } = router.query

  return (
    <Layout title="Welcome to the ladder!">
      <h2>Welcome to the Ladder!</h2>
      <p>Thanks for joining.</p>
      <p>We hope you enjoy the ladder and play lots of matches.</p>
      <p>Best of luck!</p>
      <FooterActions>
        <Link href={URLS.ladder(ladderId)} passHref>
          <ButtonLink>Go to Ladder</ButtonLink>
        </Link>
      </FooterActions>
    </Layout>
  )
}