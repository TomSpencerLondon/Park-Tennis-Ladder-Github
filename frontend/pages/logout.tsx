import React, { useState, useEffect } from "react"
import { useRouter } from "next/router";
import { useAuthContext } from '../auth/AuthProvider'
import styled from 'styled-components'
import Layout from '../components/Layout'

const Container = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 70vh; ;
`;

function Logout() {
  const router = useRouter();
  const auth = useAuthContext();

  useEffect(() => {
    auth.logout()
  }, []);

  return (
    <Layout title="Log out">
      <Container>
        Logging out...
      </Container>
    </Layout>
  )
}

export default Logout;