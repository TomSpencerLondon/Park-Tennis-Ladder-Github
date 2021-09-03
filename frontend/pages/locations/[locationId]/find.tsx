import {useRouter} from 'next/router'
import styled from 'styled-components'
import Layout from '../../../components/Layout'
import Loading from '../../../components/Loading'
import LadderList from '../../../components/LadderList'
import {useQuery} from "@apollo/react-hooks";
import {gql} from "apollo-boost";
import Error from '../../../components/Error'
import moment from 'moment'
import Tabs, {TabPanel} from '../../../components/Tabs'

const Anchor = styled.a`
  display: block;
  position: relative;
  top: -50px;
  visibility: hidden;
`

const TitleWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  margin: 1rem 0;
`
const H2 = styled.h2`
  font-size: 2rem;
`


const Title = styled.h3`
  margin: 0;
  width: 80%;
  font-size: 1.5rem;
  color: ${(props: any) => props.theme.textColor};
`

const Players = styled.span`
  font-weight: bold;
  line-height: 1.3;
  width: 
`

const QUERY = gql`
  query($current: JSON, $upcoming: JSON, $archive: JSON, $locationId: ID!) {
    location(id: $locationId) {
      name
    currentLadders: ladders(where: $current) {
      id
      name
      start_date
      end_date
      location {
        name
      }
      ranks (sort: "rank:asc") {
        id 
        user {
          avatar {
            formats 
          }
        }        
      }
    }
    upcomingLadders: ladders(where: $upcoming) {
      id
      name
      start_date
      end_date
      ranks (sort: "rank:asc") {
        id 
        user {
          avatar {
            formats  
          }
        }
      }
    }    
    archiveLadders: ladders(where: $archive) {
      id
      name
      start_date
      end_date
      ranks (sort: "rank:asc") {
        id 
        user {
          avatar {
            formats 
          }
        }
      }
    }
    }    
  }
`;

export function ladderLocationFrom(data) {
  return data.location.name;
}

/**
 * Displays a list of ladders
 */
export default function Ladders() {
  // const { loading, error, data } = useQuery(QUERY, {
  // })
  const nowDate = moment().format('YYYY-MM-DD');
  const upcoming = {"start_date_gt": nowDate}
  const current = {"start_date_lte": nowDate, "end_date_gt": nowDate}
  const archive = {"end_date_lt": nowDate}
  const router = useRouter();
  const {locationId} = router.query;
  const {loading, error, data} = useQuery(QUERY, {
    variables: {current, upcoming, archive, locationId}
  })
  if (error) return <Error error='Error loading'/>
  if (loading) return <Loading/>
  // variables: { name: "Wimbledon" }
  const location = ladderLocationFrom(data);
  return (
    <Layout title="Find a local Ladder league near me and play tennis">
      <H2>{location}</H2>
      <Tabs>
        <TabPanel label="Current">
          <LadderList items={data.location.currentLadders} emptyMessage="No current ladders"/>
        </TabPanel>
        <TabPanel label="Upcoming">
          <LadderList items={data.location.upcomingLadders} emptyMessage="No upcoming ladders"/>
        </TabPanel>
      </Tabs>
    </Layout>
  )
}