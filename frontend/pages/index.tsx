import styled from 'styled-components'
import React, { useEffect } from 'react'
import Link from 'next/link'
import Layout from '../components/Layout'
import Avatar from '../components/Avatar'
import Loading from '../components/Loading'
import Error from '../components/Error'
import { FooterActions } from '../components/Footer'
import { ButtonLink } from '../components/Buttons'
import { URLS } from '../components/Nav'
import { useAuthContext } from '../auth/AuthProvider'
import { List, ListItem } from '../components/List'
import { useQuery } from '@apollo/react-hooks'
import { gql } from "apollo-boost"
import UserList from '../components/UserList'
import Result from '../components/Result'
import { SocialIcon } from 'react-social-icons'
import { useRouter } from 'next/router'

const CenteredContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Center = styled.div`
  width: 100%;
  display: flex;
  justify-content: center;
`

const TitleWrapper = styled.a`
  display: flex;
  justify-content: start;
  margin: 0;
`

const AnchorLink = styled.a`
  height: 100%;
  width: 100%;
  display: flex;
  align-items: center;
  padding: 0px;
`

const StyledSocialIcon = styled(SocialIcon)`
  margin-right: 1em;
  margin-top: 1em;
`;


const Rank = styled.span`
  font-size: 2em;
  margin-right: 20px;
  color: ${(props: any) => props.active ? props.theme.menuActiveColor : props.theme.textColor};
  ${AnchorLink}:hover & {
    color: ${(props: any) => props.theme.menuActiveColor}; 
  } 
`

const Title = styled.span`
  font-size: 1.7rem;
  margin-top: 10px;
  margin-right: 10px;
  color: ${(props: any) => props.active ? props.theme.menuActiveColor : props.theme.textColor};
  ${AnchorLink}:hover & {
    color: ${(props: any) => props.theme.menuActiveColor};
  } 
`

const QUERY = gql`
  query($userId: ID!) {
    user(id: $userId) {
      id
      username
      avatar {
        formats
      }
      ranks {
        rank
        ladder {
          id
          name
          end_date
        }
      }
    }
    challengeAlertCount: matchCount(where: {status: "Pending", opponent: $userId}) 
    challenges: matches(sort: "id:desc", where: {status: "Pending", _or: [{challenger: $userId},{opponent: $userId}]}) {        
      id
      ladder {
        end_date
      }
      challenger {
        id
        username
        avatar {
          formats
        }        
      }
      opponent {
        id
        username
        avatar {
          formats
        }        
      }     
    }        
    pending_results: matches(sort: "id:desc", where: {status: "Accepted", _or: [{challenger: $userId},{opponent: $userId}]}) {
      id
      ladder {
        id
        end_date
      }      
      challenger {
        id
        username
        avatar {
          formats
        }        
      }
      opponent {
        id
        username
        avatar {
          formats 
        }        
      }
    }
    results: matches(sort: "status_updated_at:desc", where: {status: "Played", _or: [{challenger: $userId},{opponent: $userId}]}) {
      id
      status
      ladder {
        id
      }
      challenger_set_scores
      opponent_set_scores      
      challenger {
        id
        username
        avatar {
          formats
        }        
      }
      opponent {
        id
        username
        avatar {
          formats
        }           
      }
      winner {
        id
      }
    }
  }
`;
function Home() {
  const auth = useAuthContext()

  if (!auth.isAuthenticated && !auth.user?.id) {
    return (
      <Layout title="Play tennis ladder leagues at your local park">
        <CenteredContainer>
          <div>
            {/* <Image
              src="/img/logo_circle.png"
              alt="Park Tennis Ladders"
              width="100%"
              height="100%"
            /> */}
            <h2>Anyone For Tennis?</h2>
            <p>Would you like to...</p>
            <ul className="info">
              <li>Play more tennis at your local park?</li>
              <li>Improve your tennis?</li>
              <li>Find players of a similar ability?</li>
              <li>Get 10% discount off tennis equipment (at Gyles Brothers)</li>
            </ul>
            <p>If so, Park Tennis Ladders is for you!</p>
            <Link href={URLS.laddersFind()} passHref>
              <ButtonLink>
                Find Your Local Ladder
              </ButtonLink>
            </Link>
            <br />
            <br />
            <h2>How Does A Ladder Work?</h2>
            <p>A tennis ladder is a way of ranking tennis players according to ability level. </p>
            <p>It provides a fun and fast way to meet other players at your park.</p>
            <p>You challenge other players, arrange matches and report your results.</p>
            <p>As you win or lose, you move up or down in position on the tennis ladder.</p>
            <Link href={URLS.rules()} passHref>
              <ButtonLink>
                Read the rules
            </ButtonLink>
            </Link>
            <br />
            <br />
            <h2>All Ability Levels Welcome</h2>
            <p>We encourage all ability levels to enter as you will be initially grouped with players of similar ability, then as you play you move up or down the ladder depending on your results.</p>
            <Link href={URLS.abilities()} passHref>
              <ButtonLink>
                Whats my ability?
            </ButtonLink>
            </Link>
            <br />
            <br />
            <h2>Features</h2>
            <ul className="info">
              <li>Mobile friendly web app.</li>
              <li>Unlock player contact details as your challenges are accepted.</li>
              <li>Simple interface for managing your ladder position, challenges and match reports.</li>
              <li>Track your progress with stats and results.</li>
            </ul>
            {/* <br />
            <h2>News</h2>
            <p>We are proud to announce our debut Bristol ladders Canford and St George are now open and free to enter!</p>
            <Link href={URLS.ladders()} passHref>
              <ButtonLink>
                Join Now!
            </ButtonLink>
            </Link> */}
            {/* <br /> */}
            <br />
            <h2>You Only Live Once</h2>
            <p>But you get to serve twice!</p>
            <p>To get started all you need to do is register and join your local park ladder.</p>
            <Link href={URLS.register()} passHref>
              <ButtonLink>
                Get Started
            </ButtonLink>
            </Link>
            <br />
            <br />            
            <h2>About Us</h2>
            <p>Park Tennis Ladders has been created by Dave and Phil two local Bristol park players looking for a new way to create a
              social tennis community at your local park.</p>
            <p>We hope you enjoy this new service and look forward to seeing you on court!</p>
            <br />
            <h2>Contact Us</h2>
            <p>If you have any questions or queries please do not hesitate to get in touch.</p>
            <p>We would love to hear your feedback and suggestions.</p>
            <Link href={URLS.mailTo()} passHref>
              <ButtonLink>
                Contact Us
            </ButtonLink>
            </Link>
            <br />
            <br />
            <h2>Sharing is Caring</h2>
            <p>Please invite your tennis friends to join us and give us a like and share on facebook.</p>
            <StyledSocialIcon url="https://facebook.com/parktennisladders" />
            {/* <StyledSocialIcon url="https://twitter.com/parktennisladd1" />
            <StyledSocialIcon url="https://www.instagram.com/parktennisladders/" />
            <StyledSocialIcon url="https://www.youtube.com/channel/UCdIbQon8UYWMsbPrzM7Ssrw" />
            <StyledSocialIcon url="https://www.linkedin.com/in/philip-davies-41a291215/" /> */}
          </div>

        </CenteredContainer>
        <FooterActions>
          <Link href={URLS.register()} passHref>
            <ButtonLink>
              Sign Up
            </ButtonLink>
          </Link>
          <Link href={URLS.login()} passHref>
            <ButtonLink>
              Log In
            </ButtonLink>
          </Link>
        </FooterActions>
      </Layout>
    )
  } else {
    return (
      <Dashboard user={auth.user} />
    )
  }
}

function Dashboard({ user }) {
  const userId = user.id
  const router = useRouter()
  const { loading, error, data, refetch } = useQuery(QUERY, {
    variables: { userId },
  })
  const challengeAlertCount = data?.challengeAlertCount || 0

  console.log({data})

  useEffect(() => {
    refetch()
  }, [refetch]);

  useEffect(() => {
    window.localStorage.setItem('challengeAlertCount', JSON.stringify(challengeAlertCount));
  }, [challengeAlertCount]);

  if (error) return <Error error="Loading fault" />

  if (loading) return <Loading />

  const ladders = data?.user?.ranks ? data?.user.ranks
    .filter(x => {
      const now = new Date();
      const endDate = new Date(x.ladder.end_date)
      console.log({now, endDate}, now <= endDate)
      return now <= endDate
    })
    .map(({ rank, ladder }) => (
      <ListItem key={ladder?.name}>
        <Link href={URLS.ladder(ladder?.id)}>
          <TitleWrapper>
            <Rank>
              #{rank}
            </Rank>
            <Title>
              {ladder?.name}
            </Title>
          </TitleWrapper>
        </Link>
      </ListItem>
    )) : []


  const challenges = data.challenges.filter(x => {
    const now = new Date();
    const endDate = new Date(x.ladder.end_date)
    return now <= endDate
  })
  
  const pending_results = data.pending_results.filter(x => {
    const now = new Date();
    const endDate = new Date(x.ladder.end_date)
    return now <= endDate
  }) 

  return (
    <Layout title="Dashboard">
      <h2>Hey {data.user.username}!</h2>
      <Center>
        <Link href={URLS.profile()} passHref>
          <a>
            <Avatar
              url={data.user.avatar?.formats?.thumbnail?.url}
              alt={data.user.username}
              width="100px"
              height="100px"
            />
          </a>
        </Link>
      </Center>
      <Center>
        <p>{data.user.away ? 'Away' : 'Available'}</p>
      </Center>
      <h2>Ladder Rankings</h2>
      <List>
        {ladders.length > 0 ? ladders : (<p>You are not a member of any ladders.</p>)}
      </List>
      <h2>Challenges Pending</h2>
      <UserList uri="challenges" user={user} items={challenges} emptyMessage="You have no pending challenges" />
      <h2>Results Pending</h2>
      <UserList uri="reports" user={user} items={pending_results} emptyMessage="You have no pending results" />

      { data.results.length > 0 && (
        <>
          <h2>Latest Result</h2>
          <Link href={URLS.result(data.results[0].id)} passHref>
            <a>
              <Result match={data.results[0]} />
            </a>
          </Link>
        </>
      )}
      <br />
      <h2>Contact Us</h2>
      <p>If you have any questions or queries please do not hesitate to get in touch.</p>
      <p>We would love to hear your feedback and suggestions.</p>
      <Link href={URLS.mailTo()} passHref>
        <ButtonLink>
          Contact Us
        </ButtonLink>
      </Link>
      <br />
      <br />
      <h2>Sharing is Caring</h2>
      <p>Please invite your tennis friends to join us and give us a like and share on facebook.</p>
      <StyledSocialIcon url="https://facebook.com/parktennisladders" />
      {/* <StyledSocialIcon url="https://twitter.com/parktennisladd1" />
      <StyledSocialIcon url="https://www.instagram.com/parktennisladders/" />
      <StyledSocialIcon url="https://www.youtube.com/channel/UCdIbQon8UYWMsbPrzM7Ssrw" />
      <StyledSocialIcon url="https://www.linkedin.com/in/philip-davies-41a291215/" /> */}
      { !ladders.length && (
        <FooterActions>
          <Link href={URLS.locations()} passHref>
            <ButtonLink>
              Find A Ladder
            </ButtonLink>
          </Link>
        </FooterActions>
      )}
    </Layout>
  )
}

export default Home