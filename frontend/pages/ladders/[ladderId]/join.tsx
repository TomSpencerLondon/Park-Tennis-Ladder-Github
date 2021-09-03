import React from 'react'
import Layout from '../../../components/Layout'
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js"
import { postRank } from '../../../lib/api'
import { toast } from 'react-toastify'
import { useRouter } from 'next/router'
import { URLS } from '../../../components/Nav'
import styled from 'styled-components'

const AnchorLink = styled.a`
  color: ${(props: any) => props.theme.linkTextColor};
`

export default function PaymentContainer() {
  return (
    <PayPalScriptProvider options={{
      "client-id": process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID,
      "currency": process.env.NEXT_PUBLIC_PAYPAL_CURRENCY,
      // "components": process.env.NEXT_PUBLIC_PAYPAL_COMPONENTS,
    }}>
      <Join />
    </PayPalScriptProvider>
  )
}

function Join() {

  const router = useRouter()
  const { ladderId } = router.query

  async function createPayPalOrder(data: any, actions: any) {
    const value = 5 
    const order = {
      purchase_units: [{
        amount: {
          value,
          currency_code: 'GBP',
          breakdown: { item_total: { value, currency_code: 'GBP' } }
        },
      }]
    };
    return actions.order.create(order)
  }

  async function onPayPalApprove(data: any, actions: any) {
    return actions.order.capture().then(async function (details: any) {
      postRank({ ladderId })
        .then(res => router.push(URLS.ladderWelcome(ladderId)))
        .catch(err => {
          toast.error(err.response.data.message, { autoClose: false })
        })
    })
  }

  return (
    <Layout title="Join a tennis ladder">
      <h2>Prizes</h2>
      <ul className="info">
        <li>First Place - £20 <AnchorLink href="https://gylesbros.co.uk/sports-equipment/tennis/" target="_blank">Gyles Sports Voucher</AnchorLink>  &amp; Trophy</li>
        <li>Star Player - <AnchorLink href="https://www.tshirtstudio.com/marketplace/park-tennis-ladders/sports-polo" target="_blank">Park Tennis Ladders Sports Polo T-Shirt</AnchorLink> &amp; Trophy</li>
        <li>Play Three Matches - New Tennis Balls (limited supply)</li>
      </ul>
      <h2>Benefits</h2>
      <ul className="info">
        <li>WhatsApp group - for arranging matches and no show court alerts</li>
        <li>Facebook group - for friendlies and social events</li>
      </ul>
      <h2>Entrance Fee</h2>
      <p>£5 entrance fee payable below by Pay pal</p>
      <ul className="info">
        <li>Covers prizes, administration costs and future upgrades</li>
        <li>We hope it also encourages a more active ladder</li>
      </ul>
      <br/>
      <PayPalButtons
        style={{ color: "blue", shape: "pill", label: "pay", height: 40 }}
        createOrder={createPayPalOrder}
        onApprove={onPayPalApprove}
        onError={(err: any) => {
          console.log('PAY PAL ERROR', err)
          // apiCatch(err, { items, checkout: getValues() });
          // setIsLoading(false);
          // router.push(URLS.error());
        }}
      />
    </Layout >
  )
}