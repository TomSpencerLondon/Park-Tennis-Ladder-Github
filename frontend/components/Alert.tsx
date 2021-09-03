import React from 'react'
import styled from 'styled-components';
import { FaSpinner } from 'react-icons/fa'

const StyledAlert = styled.div`
  padding: 10px;
  background-color: #F2D7D5;
  border-left: 5px solid #C0392B; 
  border-radius: 5px;
  color: #C0392B;
`;

type PropTypes = {
  children: React.ReactNode;
}

export default function Alert({children} : PropTypes) {
  return (
    <StyledAlert>
      {children}
    </StyledAlert>
  )
}