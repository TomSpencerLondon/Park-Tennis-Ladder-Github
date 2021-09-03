import React from 'react';
import Link from 'next/link'
import Layout from '../components/Layout'
import {gql} from "apollo-boost";
import {useQuery} from "@apollo/react-hooks";
import styled from 'styled-components'
import Error from "../components/Error";
import Loading from "../components/Loading";
import { URLS } from "../components/Nav";
import {ListItem} from "../components/List";


const LocationLink = styled.a``
const H2 = styled.h2`
  color: ${(props: any) => props.theme.menuColor};
${LocationLink}:hover & {
  color: ${(props: any) => props.theme.menuActiveColor};
}`

const Center = styled.div`
  width: 100%;
  display: flex;
  justify-content: center;
`

const QUERY = gql`
  query {
    locations {
      id
      name
    }
  }
`;

/**
 * Displays a list of locations
 */
export default function Locations() {
  const { loading, error, data } = useQuery(QUERY);
  if (error) return <Error error='Error loading' />
  if (loading) return <Loading />

  return (
    <Layout title="Locations">
      <h2>Locations</h2>
      <p>Here is a list of locations for your next tennis ladder. Choose the nearest to you!</p>
      <p>You can play at a local public court, tennis club or sports center.</p>
      <Center>
        <ul>
          {
            data.locations.map(({id, name}) =>
              <ListItem style={{ listStyleType: 'none' }}>
                <Link href={URLS.location(id)} passHref>
                  <LocationLink>
                    <li><H2>{name}</H2></li>
                  </LocationLink>
                </Link>
              </ListItem>
            )
          }
        </ul>
      </Center>
    </Layout>
  )
}
