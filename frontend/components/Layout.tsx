import { useCallback, useState } from 'react';
import styled from 'styled-components'
import Head from 'next/head'
import Header from './Header'
import Footer from './Footer'
import Nav from './Nav'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import Image from 'next/image'

const Container = styled.div`
  background-color: #181A1B;
  padding-bottom: 250px;
  min-height: 100vh;
`

type PropTypes = {
  title: string;
  children: React.ReactNode;
}

export default function Layout({ title, children }: PropTypes) {

  const [showNav, setShowNav] = useState<boolean>(false)

  const handleShowNav = () => {
    setShowNav(!showNav)
  }

  return (
    <Container>
      <Head>
        <title>{process.env.NEXT_PUBLIC_APP_NAME}: {title}</title>
        <meta charSet='utf-8' />
        <meta httpEquiv='X-UA-Compatible' content='IE=edge' />
        <meta name='viewport' content='width=device-width,initial-scale=1,minimum-scale=1,maximum-scale=5' />
        <meta name="description" content="Park Tennis Ladders. You only live once but get to serve twice!  Join your local park tennis community and play tennis with players of your ability." />

        <meta property="og:title" content="Park Tennis Ladders" />
        <meta property="og:description" content="You only live once, but get to serve twice" />
        <meta property="og:image" content="https://park-tennis-ladders.co.uk/img/og-image.png" />
        <meta property="og:url" content="https://park-tennis-ladders.co.uk/" />
        <meta property="og:site_name" content="Park Tennis Ladders"/>

        <meta name="twitter:title" content="Park Tennis Ladders"/>
        <meta name="twitter:description" content="All ability levels"/>
        <meta name="twitter:image"  content="https://park-tennis-ladders.co.uk/img/summary-card.png" />
        <meta name="twitter:card" content="summary_large_image"/>
        <meta name="twitter:image:alt" content="You only live once, but get to serve twice."/>

        <link rel='manifest' href='/manifest.json' />
        <link href='/favicon-16x16.png' rel='icon' type='image/png' sizes='16x16' />
        <link href='/favicon-32x32.png' rel='icon' type='image/png' sizes='32x32' />
        <link rel='apple-touch-icon' href='/apple-icon.png'></link>
        <meta name='theme-color' content='#181A1B' />
        <link rel="icon" href="/favicon.ico?v=2" />
      </Head>
      <Header />
      <ToastContainer
        closeOnClick
        autoClose={false}
      />
      <div className="container">
        {children}
      </div>
      <div onBlur={handleShowNav}>
        <Nav show={showNav} />
      </div>
      <Footer
        handleShowNav={handleShowNav}
      />
    </Container>
  )
}