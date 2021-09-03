import React from 'react'
import Link from 'next/link'
import Layout from '../components/Layout'
import { FooterActions } from '../components/Footer'
import { ButtonLink } from '../components/Buttons'

export default function About() {
  return (
    <Layout title="Tennis ability levels and skills">
      <h2>Tennis Ability Levels</h2>
          <p>We use this to place your initial position on the ladder (if you haven’t played with Park Tennis Ladders before). 
            It's important you put a little bit of thought into your answer so you have the best experience when first playing matches.</p>
          <br />
          <h2>Beginner</h2>
          <p>You’ve either never played, just started playing or haven’t picked up a racket for years. You may be having lessons or joining in group sessions. You cannot sustain a rally yet and you are working primarily on getting to the ball and getting it back into play. You may not know all the rules, but have an understanding of the scoring system.</p>
          <br />
          <h2>Improver</h2>
          <p>You know the basic techniques and are able to keep a rally going with someone who hits the ball back to you. However, you still make quite a few mistakes and may find serving difficult. You are becoming more consistent when hitting medium pace shots but you are not comfortable with all strokes and lack control when trying to hit with accuracy, depth or power. Your game probably lacks variety but you are developing a tactical approach to winning points. You may have played some matches. You know how to keep score and when to change ends</p>
          <br />
          <h2>Intermediate</h2>
          <p>You are a decent player. You play regularly and your technique is solid. You attempt to implement the technique and tactics of the top players but struggle when putting together points against stronger players. You have dependable strokes, including accuracy on both forehand and backhand sides on moderate shots, plus the ability to use lobs, overheads, approach shots and volleys with some success. You are able to occasionally force errors when serving. You have begun to master the use of power and spins and are beginning to handle pace, have sound footwork and can control depth of shots. You can hit first serves with power and/or accuracy and have a dependable second serve</p>
          <br />
          <h2>Experienced</h2>
          <p>You’re good. You have played a lot of tennis and can serve with spin, placement and power. You can rally consistently and create opportunities to win points off both your forehand and backhand. You probably compete on a regular basis. You have excellent shot anticipation and court coverage. You can regularly hit winners or force errors off of short balls, can put away volleys, can successfully execute lobs, drop shots, half volleys and smashes, and have good depth and spin second serves. You have power and consistency and can vary strategy according to your opponent’s strengths and weaknesses.</p>
          <br />
          <h2>Advanced</h2>
          <p>For the top 10% of recreational players. There aren’t many people you get beaten by. You can see all the cards of the experienced player above and raise them. You are probably very fit, and a 3 set match is a breeze. You have a solid all round game and in addition some match winning attributes such as really heavy groundstrokes, a booming serve or brilliant net play.</p>
    </Layout>
  )
}