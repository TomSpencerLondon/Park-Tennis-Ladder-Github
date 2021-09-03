import styled from 'styled-components'
import { List, ListItem } from './List'
import Link from 'next/link'
import { useAuthContext } from '../auth/AuthProvider'
import { logout } from '../lib/auth'

const StyledNav = styled.nav`
  display: ${(props: { show: boolean }) => props.show ? 'bock' : 'none'}; 
  background: #000;
  z-index: 10;
  position: fixed;
  bottom: 0;
  right: 0;
  left: 0;  
  border-radius: 20px 20px 0px 0px;
  padding: 10px 20px 0 20px;
  margin-bottom: 49px;
`;

export const AnchorLink = styled.a`
  color: ${(props: any) => props.theme.primary};
`;

export const URLS = {
  home: () => '/',
  signin: () => '/signin',
  profile: () => '/profile',
  profileEdit: () => '/profile/edit',
  register: () => '/register',
  registerConfirm: () => '/register/confirm',
  login: () => '/login',
  logout: () => '/logout',
  locations: () => '/locations',
  rules: () => '/rules',
  abilities: () => '/abilities',
  ladders: () => '/ladders',
  laddersFind: () => '/ladders/find',
  ladder: (id) => `/ladders/${id}`,
  ladderJoin: (id) => `/ladders/${id}/join`,
  ladderWelcome: (id) => `/ladders/${id}/welcome`,
  ladderPrizes: (id) => `/ladders/${id}/prizes`,
  ladderProfile: (ladderId, userId) => `/ladders/${ladderId}/profile/${userId}`,
  location: (id) => `locations/${id}/find`,
  makeChallenge: (ladderId, userId) => `/challenges/ladder/${ladderId}/user/${userId}`,
  challenge: (id) => `/challenges/${id}`,
  reschedule: (id) => `/reschedule/${id}`,
  result: (id) => `/results/${id}`,
  report: (id) => `/reports/${id}`,
  challenges: () => '/challenges',
  results: () => '/results',
  about: () => '/about',
  settings: () => '/settings',
  contact: () => '/contact',
  mailTo: () => 'mailto: parktennisladders@gmail.com',
  terms: () => '/terms',
  privacy: () => '/privacy-policy',
  error: () => '/error',
}

const navLinks = [
  { title: 'Home', url: URLS.home(), isAuthenticated: false },
  { title: 'Profile', url: URLS.profile(), isAuthenticated: true},
  { title: 'About', url: URLS.about(), isAuthenticated: false },
  // { title: 'Settings', url: URLS.settings(), action: 'settings:visit' },
  // { title: 'Contact', url: URLS.contact(), action: 'settings:visit' },
  // { title: 'Terms', url: URLS.terms(), action: 'terms:visit' },
  // { title: 'Privacy Policy', url: URLS.privacy(), action: 'privacy:visit' },
];

type PropTypes = {
  show: boolean;
}

export default function Nav({ show }: PropTypes) {

  const auth = useAuthContext()
 
  return (
    <StyledNav show={show} className="container">
      <List>
        {!auth.isAuthenticated && (
          <ListItem key='login'>
            <Link href={URLS.login()} prefetch={false}>
              <a><h4>Login</h4></a>
            </Link>
          </ListItem>
        )}
        {show && navLinks
          .filter(({ isAuthenticated }) => (!auth.isAuthenticated ? isAuthenticated === false : true))
          .map(({ title, url }) => (
          <ListItem key={url}>
            <Link href={url} prefetch={false}>
              <a><h4>{title}</h4></a>
            </Link>
          </ListItem>
        ))}
        {auth.isAuthenticated && (
          <AnchorLink onClick={() => auth.logout()}><h4>Logout</h4></AnchorLink>
        )}
      </List>
    </StyledNav>
  )
}