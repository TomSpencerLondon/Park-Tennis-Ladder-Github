import React from 'react'
import Link from 'next/link'
import Layout from '../components/Layout'
import { FooterActions } from '../components/Footer'
import { ButtonLink } from '../components/Buttons'

export default function Contact() {
  return (
    <Layout title="Contact Us">
      <h2>Telephone</h2>
      <Link href={`tel:${process.env.NEXT_PUBLIC_CONTACT_PHONE}`}>{process.env.NEXT_PUBLIC_CONTACT_PHONE}</Link>
      <br/>
      <br/>
      <h2>Email</h2>
      <Link href={`mailto:${process.env.NEXT_PUBLIC_CONTACT_EMAIL}`}>{process.env.NEXT_PUBLIC_CONTACT_EMAIL}</Link>      
      <br/>
      <br/>
      <h2>Facebook</h2>
      <Link href="https://www.facebook.com/hotwellshideout"><a target="_blank">Follow our Facebook Page for updates:</a></Link><br/><br/>
      <Link href="https://www.facebook.com/hotwellshideout"><a target="_blank">www.facebook.com/hotwellshideout</a></Link>           
      <FooterActions>
        <Link href={`tel:${process.env.NEXT_PUBLIC_CONTACT_PHONE}`} passHref>
          <ButtonLink >Call Now</ButtonLink> 
        </Link>  
        <br/>
        <Link href={`mailto:${process.env.NEXT_PUBLIC_CONTACT_EMAIL}`} passHref>
          <ButtonLink>Email</ButtonLink> 
        </Link>  
        <br/>
        <Link href="https://www.facebook.com/hotwellshideout" passHref>
          <ButtonLink target="_blank">Facebook</ButtonLink>         
        </Link>  
      </FooterActions>      
    </Layout>
  )
}