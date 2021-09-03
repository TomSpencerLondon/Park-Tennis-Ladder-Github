import React, {useEffect, useState} from 'react'
import styled from 'styled-components'
import {URLS} from './Nav'
import Link from 'next/link'
import {FaHome, FaUser, FaEnvelope, FaTrophy, FaTableTennis, FaMapPin} from 'react-icons/fa'
import {useRouter} from 'next/router'
import {useAuthContext} from '../auth/AuthProvider'
import Cookie from 'js-cookie'

const FooterContainer = styled.footer`
  width: 100%;
  height: 60px;
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 100;
  background-color: ${(props: any) => props.theme.backgroundColor};
  border-top: 1px solid #222426;
`
const TabItems = styled.footer`
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 5px;
`

const AnchorLink = styled.a`
  display: flex;
  flex-direction: column;
  align-items: center;
`

export const FooterActions = styled.a.attrs(({
  className: 'container'
}))`
  width: 100%;
  position: Fixed;
  bottom: 60px;
  left: 0;
  right: 0;
  z-index: 5;
  display: flex;
  justify-content: center;  
  align-items: center;  
  flex-direction: row;
  background-color: ${(props: any) => props.theme.backgroundColor};
  border-top: 1px solid #222426;
`;

export const HiddenLabel = styled.span`
  display: none;
  visibility: hidden;
`;

const HomeLink = styled.a`
  display: flex;
  flex-direction: column;
  align-items: center;
`
const HomeIcon = styled(FaHome)`
  color: ${(props: any) => props.active ? props.theme.menuActiveColor : props.theme.menuColor};
  ${HomeLink}:hover & {
    color: ${(props: any) => props.theme.menuActiveColor};
  }
`
const HomeLabel = styled.p`
  font-size: 1.2rem;
  color: ${(props: any) => props.active ? props.theme.menuActiveColor : props.theme.menuColor};
  margin-top: 4px;
  ${HomeLink}:hover & {
    color: ${(props: any) => props.theme.menuActiveColor};
  }
`
const LadderLink = styled.a`
  display: flex;
  flex-direction: column;
  align-items: center;
`
const LadderIcon = styled(FaTableTennis)`
  color: ${(props: any) => props.active ? props.theme.menuActiveColor : props.theme.menuColor};
  ${LadderLink}:hover & {
    color: ${(props: any) => props.theme.menuActiveColor};
  }
`

const LocationLink = styled.a`
  display: flex;
  flex-direction: column;
  align-items: center;
`

const LocationIcon = styled(FaMapPin)`
  color: ${(props: any) => props.active ? props.theme.menuActiveColor : props.theme.menuColor};
  ${LocationLink}:hover & {
    color: ${(props: any) => props.theme.menuActiveColor};
  }
`

const LadderLabel = styled.p`
  font-size: 1.2rem;
  color: ${(props: any) => props.active ? props.theme.menuActiveColor : props.theme.menuColor};
  margin-top: 4px;
  ${LadderLink}:hover & {
    color: ${(props: any) => props.theme.menuActiveColor};
  }
`

const LocationLabel = styled.p`
  font-size: 1.2rem;
  color: ${(props: any) => props.active ? props.theme.menuActiveColor : props.theme.menuColor};
  margin-top: 4px;
  ${LocationLink}:hover & {
    color: ${(props: any) => props.theme.menuActiveColor};
  }
`

const ChallengeLink = styled.a`
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
`
const ChallengeIcon = styled(FaEnvelope)`
  color: ${(props: any) => props.active ? props.theme.menuActiveColor : props.theme.menuColor};
  ${ChallengeLink}:hover & {
    color: ${(props: any) => props.theme.menuActiveColor};
  }
`
const ChallengeLabel = styled.p`
  font-size: 1.2rem;
  color: ${(props: any) => props.active ? props.theme.menuActiveColor : props.theme.menuColor};
  margin-top: 4px;
  ${ChallengeLink}:hover & {
    color: ${(props: any) => props.theme.menuActiveColor};
  }
`
const ResultLink = styled.a`
  display: flex;
  flex-direction: column;
  align-items: center;
`
const ResultIcon = styled(FaTrophy)`
  color: ${(props: any) => props.active ? props.theme.menuActiveColor : props.theme.menuColor};
  ${ResultLink}:hover & {
    color: ${(props: any) => props.theme.menuActiveColor};
  }
`
const ResultLabel = styled.p`
  font-size: 1.2rem;
  color: ${(props: any) => props.active ? props.theme.menuActiveColor : props.theme.menuColor};
  margin-top: 4px;
  ${ResultLink}:hover & {
    color: ${(props: any) => props.theme.menuActiveColor};
  }
`
const ProfileLink = styled.a`
  display: flex;
  flex-direction: column;
  align-items: center;
`
const ProfileIcon = styled(FaUser)`
  color: ${(props: any) => props.active ? props.theme.menuActiveColor : props.theme.menuColor};
  ${ProfileLink}:hover & {
    color: ${(props: any) => props.theme.menuActiveColor};
  }
`
const ProfileLabel = styled.p`
  font-size: 1.2rem;
  color: ${(props: any) => props.active ? props.theme.menuActiveColor : props.theme.menuColor};
  margin-top: 4px;
  ${ProfileLink}:hover & {
    color: ${(props: any) => props.theme.menuActiveColor};
  }
`

const AlertPill = styled.span`
  position: absolute;
  top: -8px;
  right: 10px;
  background-color: red;
  color: white;
  font-size: 0.75em;
  padding: 0 5px;
  border-radius: 8px;
  font-family: "Raleway", "HelveticaNeue", "Helvetica Neue", Helvetica, Arial, sans-serif; 
`

type PropTypes = {
  handleShowNav: () => void;
}

export default function Footer({handleShowNav}: PropTypes) {
  const {route} = useRouter()
  const auth = useAuthContext()
  const isHome = route === '/'
  const isLadder = route.includes('ladder')
  const isChallenge = route.includes('challenge') && !route.includes('ladder')
  const isResult = route.includes('result') || route.includes('report')
  const isProfile = route.includes('profile') && !route.includes('ladders')

  const [challengeAlertCount, setChallengeAlertCount] = useState<string>()
  useEffect(() => {
    const challengeAlertCount = window.localStorage.getItem('challengeAlertCount')
    setChallengeAlertCount(challengeAlertCount);
  }, [challengeAlertCount]);

  return (
    <FooterContainer className="container">
      <TabItems>
        <Link href={URLS.home()} prefetch={false}>
          <HomeLink aria-label="profile">
            <HomeIcon size={24} active={isHome}/>
            <HomeLabel active={isHome}>{auth.isAuthenticated ? 'Dashboard' : 'Home'}</HomeLabel>
          </HomeLink>
        </Link>
        <Link href={auth.isAuthenticated ? URLS.ladders() : URLS.locations()} prefetch={false}>
          {
            auth.isAuthenticated ?
              <LadderLink aria-label="profile">
                <LadderIcon size={24} active={isLadder}/>
                <LadderLabel active={isLadder}>Ladders</LadderLabel>
              </LadderLink> :
              <LocationLink aria-label="profile">
                <LocationIcon size={24} active={isLadder}/>
                <LocationLabel active={isLadder}>Locations</LocationLabel>
              </LocationLink>
          }
        </Link>
        {auth.isAuthenticated ? (
          <>
            <Link href={URLS.challenges()} prefetch={false}>
              <ChallengeLink aria-label="Challenges">
                <ChallengeIcon size={24} active={isChallenge}/>
                {challengeAlertCount != '0' && (
                  <AlertPill>
                    {challengeAlertCount}
                  </AlertPill>
                )}
                <ChallengeLabel active={isChallenge}>Challenges</ChallengeLabel>
              </ChallengeLink>
            </Link>
            <Link href={URLS.results()} prefetch={false}>
              <ResultLink aria-label="results">
                <ResultIcon size={24} active={isResult}/>
                <ResultLabel active={isResult}>Results</ResultLabel>
              </ResultLink>
            </Link>
          </>
        ) : null}
        <Link href={URLS.profile()} prefetch={false}>
          <ProfileLink aria-label="profile">
            <ProfileIcon size={24} active={isProfile}/>
            <ProfileLabel active={isProfile}>{auth.isAuthenticated ? 'Me' : 'Join'}</ProfileLabel>
          </ProfileLink>
        </Link>
      </TabItems>
    </FooterContainer>
  )
}