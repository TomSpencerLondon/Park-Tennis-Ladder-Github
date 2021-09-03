import React from 'react'
import styled from 'styled-components'
import { FaSpinner } from 'react-icons/fa'
import Layout from './Layout'

const LoadingContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 70vh; 
`;

const LoadingIcon = styled(FaSpinner)`
  color: ${(props: any) => props.theme.menuActiveColor};
`

function Loading() {
  return (
    <Layout title="Loading">
      <LoadingContainer>
        <LoadingIcon className="icon-spin" size={48} />
      </LoadingContainer>
    </Layout>
  )
}

export default Loading;