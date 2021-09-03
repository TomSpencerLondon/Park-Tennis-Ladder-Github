import React from "react";
import Layout from '../components/Layout';
import styled from 'styled-components'

const CenteredContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 70vh;
`;

export default function PageNotFound() {
  return (
    <Layout title="404 Page Not Found">
      <CenteredContainer>
        <p>404 Page Not Found</p>
      </CenteredContainer>
    </Layout>
  )
}
