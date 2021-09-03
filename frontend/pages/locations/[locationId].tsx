import Link from 'next/link'
import {useRouter} from 'next/router'
import styled from 'styled-components'
import Layout from '../../components/Layout'
import Loading from '../../components/Loading'
import {URLS} from '../../components/Nav'
import {useQuery} from "@apollo/react-hooks";
import {gql} from "apollo-boost";
import Error from '../../components/Error'
import moment from 'moment'
import React from "react";

const H2 = styled.h2`
  font-size: 2rem;
`
const Center = styled.div`
  width: 100%;
  display: flex;
  justify-content: center;
`

const QUERY = gql`
  query($locationId: ID!) {
    location(id: $locationId) {
      name
      ladders {
       id
       name
      }
    } 
  }
`;

/**
 * Displays a list of ladders
 */
export default function Location() {
  const nowDate = moment().format('YYYY-MM-DD');
  const router = useRouter();
  const { locationId } = router.query;
  const {loading, error, data} = useQuery(QUERY, {
    variables: { locationId }
  })
  if (error) return <Error error='Error loading'/>
  if (loading) return <Loading/>
  return (
    <Layout title="Play local tennis ladder leagues">
      <H2>{data.location.name}</H2>
      <Center>
        <ul>
          {
            data.location.ladders.map(({id, name}) =>
              <Link href={URLS.ladder(id)} passHref>
                <li style={{ listStyleType: 'none' }}><h2>{name}</h2></li>
              </Link>
            )
          }
        </ul>
      </Center>
    </Layout>
  )
}