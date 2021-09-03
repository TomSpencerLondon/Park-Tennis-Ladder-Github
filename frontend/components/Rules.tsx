import React from 'react'

// Thems the rules
export default function Rules() {
  return (
    <>
      <h2>The Ladder</h2>
      <ul className="info">
        <li>Park Tennis Ladders are mixed sex, singles competitions open to over-18s.</li>
        <li>The ladder is designed to allow people to play friendly competitive matches against people of their own ability.</li>
        <li>We intially rank people depending on their self declared ability.</li>
        <li>Please use your real name and not an alias or username</li>
        <li>You can challenge people up to 5 places above you and if you win you leapfrog above them in the ladder.</li>
        <li>If you are challenged and you lose you will move down one place as the challenger leaps above you. If you win there is no change in positions.</li>
        <li>If you are challenged you have 3 days to respond. You can deny the challenge. If you don’t respond within that time frame you lose the match.</li>
      </ul>
      <br />
      <h2>Challenges</h2>
      <ul className="info">
        <li>When you make a challenge, and it is accepted by your opponent you will be emailed each other’s contact details. Mobile numbers are optional but it would be helpful.</li>
        <li>It is up both players to find a mutually convenient time to play. You have 10 days to arrange and play the match. If you can’t arrange a match you can cancel the match.</li>
        <li>If you agree and arrange the match and then someone can’t play the match the result can be entered as a forfeit with a winner.</li>
        <li>You can’t rechallenge the same opponent for 7 days after a match.</li>
        <li>You can mark yourself as away under your profile if you are unable to play for a period of time.</li>
      </ul>
      <br />
      <h2>Results</h2>
      <ul className="info">
        <li>You can play up to 3 sets, and you need to agree on the number. We would recommend 3 sets, but it is possible to have a 1 set match if you both agree.</li>
        <li>The sets must be of 6 games with 2 clear games and a tiebreak at 6-6.</li>
        <li>If a player can’t complete the match due to an injury the match is declared as a forfeit with the uninjured player winning.</li>
      </ul>
      <br />
      <h2>Etiquette</h2>
      <ul className="info">
        <li>Make sure you have a decent set of balls.</li>
        <li>You call whether the ball was in or out on your side of the net. The opponent must accept your call but if you aren’t sure you can offer to play a let.</li>
        <li>If play is interrupted in anyway play a let.</li>
        <li>The server is responsible for keeping score, and should shout it out before the beginning of each point.</li>
        <li>Aim for competitive but friendly in your demeanor.</li>
      </ul>
      <br />
      <h2>Safety</h2>
      <ul className="info">
        <li>You are responsible for ensuring your own safety, and you compete at your own risk.</li>
        <li>You should agree on the weather and the state of the courts and if it is safe to play. Either player may decide if it isn’t safe and the other player must accept.</li>
      </ul>
      <br />
      <h2>Emoji Guide</h2>
      <ul className="info">
        <li>First place 🥇 </li>
        <li>Second place 🥈 </li>
        <li>Third place 🥉 </li>
        {/* <li>Won last match and moved up ⬆️</li> */}
        {/* <li>Lost last match and moved down ⬇️ </li> */}
        <li>Hot streak of three wins 🔥 </li>
        <li>Played most matches ⭐ </li>
        <li>Won match 🏆</li>
        <li>Won set 6 - 0  🍩 </li>
        <li>Player is on vacation  ⛱️ </li>
      </ul>
    </>
  )
}