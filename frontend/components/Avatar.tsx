import React from 'react'
import styled from 'styled-components'
import Image from 'next/image'
import Link from 'next/link'

const Wrapper = styled.div`
  margin-right: 10px;
  display: flex;
  align-items: center:
  justify-content: center;
`;

const CircularImage = styled(Image)`
  border-radius: 50%;
  background-color: #e4e6e7;
  object-fit: cover;
  border-radius: 50%;
`

type PropTypes = {
  url?: string;
  alt: string;
  width: string;
  height: string;
  linkUrl?: string;
}

const loader = ({ src, width, quality }) => {
  return `${process.env.NEXT_PUBLIC_BASE_IMG_URL}${src}?w=${width}&q=${quality || 75}`
}

function Avatar({url, alt, width, height, linkUrl}: PropTypes) {
  const src = url || '/img/default_profile_pic.png'
  const output = 
    <Wrapper>
      <CircularImage
        loader={url && loader}
        src={src}
        alt={alt}
        width={width}
        height={height}
      />
    </Wrapper>
  return linkUrl ? (
    <Link href={linkUrl} passHref>
      <a>{output}</a>    
    </Link>  
  ) : (
    output
  )
}

export default Avatar;