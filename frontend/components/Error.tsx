import React from 'react'
import styled from 'styled-components'
import Layout from './Layout'
import { FooterActions } from '../components/Footer'
import { URLS } from '../components/Nav'
import { ButtonLink, Button } from '../components/Buttons'
import Link from 'next/link'

const ErrorContainer = styled.div`
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: -80px;
  padding: 10px;
  text-align: center;
`;

function Error({ error }) {
  return (
    <Layout title="Error">
      <ErrorContainer>
        {typeof error === 'string' ? error : `${error.statusCode} ${error.message}`} 
      </ErrorContainer>
      <FooterActions>
        <Button onClick={() => window.location.reload()}>
          Reload Page
        </Button>
        <Link href={URLS.home()} passHref>
          <ButtonLink>
            Dashboard
          </ButtonLink>
        </Link>        
      </FooterActions>
    </Layout>
  )
}

export default Error;