import styled from 'styled-components'
import { URLS } from './Nav'
import Link from 'next/link'
import Image from 'next/image'
import { useAuthContext } from '../auth/AuthProvider'
import Avatar from './Avatar'

const Wrapper = styled.div`
  margin-left: 10px;
  display: flex;
  align-items: center:
  justify-content: center;
`;

const HeaderContainer = styled.header`
  display: flex;
  align-items: center;
  justify-content: space-between;
  z-index: 10;
  background-color: #181A1B;
  border-bottom: 1px solid #222426;
`
const AnchorLink = styled.a`
`
const H1 = styled.h1`
  ${AnchorLink}:hover & {
    color: ${(props: any) => props.theme.menuActiveColor};
  }  
`

export default function Header() {
  return (
    <HeaderContainer className="container">
      <Link href={URLS.home()}>
        <AnchorLink title="Home">
          <Wrapper>
            <Image
              src="/img/logo.svg"
              alt="Park Tennis Ladders"
              width="35"
              height="35"
            />
          </Wrapper>
        </AnchorLink>
      </Link>
      <Link href={URLS.home()}>
        <AnchorLink title="Home">
          <H1>{process.env.NEXT_PUBLIC_APP_NAME}</H1>
        </AnchorLink>
      </Link>
      <span>&nbsp;</span>
    </HeaderContainer>
  )
}