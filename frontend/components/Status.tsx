import React from 'react'
import styled from 'styled-components';
import { FaSpinner } from 'react-icons/fa'

const StyledStatus = styled.span`
  padding: 5px;
  border: solid 1px ${(props: any) => statusColor(props.status)};
  color: ${(props: any) => statusColor(props.status)};
  border-radius: 4px;
  font-size: 1rem;
  text-transform: uppercase;
  font-family: "Raleway", "HelveticaNeue", "Helvetica Neue", Helvetica, Arial, sans-serif; 
  white-space: nowrap;
`

function statusColor(status) {
  switch (status) {
    case 'Accepted':
    case 'Played':
    case 'Challenge':
      return '#21ba45'
      break;
    case 'Pending':
    case 'Declined':
    case 'Forfeited':
      return 'orange'
      break;
    case 'Cancelled':
    case 'Disputed':
    case 'Expired':
      return 'red'
      break;
    default:
      return 'black'
  }
}

type PropTypes = {
  status: any;
  count?: any; // @todo fix
}

export default function Status({ status, count }: PropTypes) {
  console.log('COUNT', count)
  if (count == 0) return null
  if (count > 0) {
    return (
      <StyledStatus status={status}>{count} {status}</StyledStatus>
    )
  }
  return (
    <StyledStatus status={status}>{status}</StyledStatus>
  )
}