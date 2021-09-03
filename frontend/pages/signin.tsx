import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { login } from "../lib/auth";
import { useAuthContext } from '../auth/AuthProvider'
import Layout from '../components/Layout'
import Loading from '../components/Loading'
import { FooterActions } from '../components/Footer'
import { ButtonLink } from '../components/Buttons'
import Link from 'next/link'
import { URLS } from '../components/Nav'
import styled from 'styled-components'

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 70vh;
`

export default function Sigin() {
  return (
    <Layout title="Login and play local tennis ladder league matches">
      <Container>
      <h2>New Members</h2>
      <p>Create a new account today.</p>
      <Link href={URLS.register()} passHref>
          <ButtonLink>
            Sign Up
          </ButtonLink>
        </Link>
      <br/>
      <br/>
      <h2>Members</h2>
      <p>Already have an account?</p>
        <Link href={URLS.login()} passHref>
          <ButtonLink>
            Log In
          </ButtonLink>
        </Link>
      </Container>
    </Layout>
  );
}