import styled from 'styled-components'

export const List = styled.ul`
  list-style-type: none;
  margin-bottom: 20px;
`;

export const ListItem = styled.li`
  border-bottom: 1px solid #222426;
  cursor: pointer;
`;

import Loading from '../components/Loading'

import { useQuery } from "@apollo/react-hooks";
import { gql } from "apollo-boost";

const TitleWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  margin: 1rem 0;
`

const Title = styled.h3`
  margin: 0;
  width: 80%;
  font-size: 1.5rem;
  color: ${(props: any) => props.theme.textColor};
`

const QUERY = gql`
  {
    ladders {
      name
    }
  }
`;

type PropTypes = {
  entity: string,
  query: any,
}

/**
 * Displays a list of ladders
 */
export default function ListData({ entity, query }: PropTypes) {
  const { loading, error, data } = useQuery(query)
  if (error) return "Error loading data"
  if (loading) return <Loading />
  return (
    <List>
      {data && data[entity].map(({ name }) => (
        <ListItem key={name}>
          {/* <Link href={`/product/${sku}`}> */}
          <a>
            <TitleWrapper>
              <Title>{name}</Title>
            </TitleWrapper>
          </a>
          {/* </Link> */}
        </ListItem>
      ))}
    </List>
  )
}