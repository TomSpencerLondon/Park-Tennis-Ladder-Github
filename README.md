# Park Tennis Ladders
## You Only Live Once, But Get To Serve Twice!

[Park Tennis Ladders](https://park-tennis-ladders.co.uk/) (PTL) is a progressive web app for ranking tennis players that enables them to arrange and record match results.

Inspired by [Local Tennis Leagues](https://localtennisleagues.com/), we aim to provide a better match up of abilities and an opportunity to play more matches.

## How does it work?

Players register with a self proclaimed ability level.  They then can join a ladder of players.

Players are initially ranked on the ladder according to ability level.  Advanced players at the top ranging down to beginners at the bottom of the ladder.

Players can challenge up to 5 places above them.  If they win they leap frog the opponent, if they lose they maintain their position.  

Downward challenges are allowed, however if the challenger wins there is no rank changed, but if the opponent wins they are promoted a place as reward.

Ladder rules can be configured (eg challenge range) in the admin.

## Tech Stack

PTL uses a number of open source projects to work properly:

- [Node.js](https://nodejs.org/en/) - Back-end JavaScript runtime environment
- [npm](https://www.npmjs.com) - JavaScript package manager
- [React](https://reactjs.org) - Frontend view
- [Next.js](https://nextjs.org) - Server-side rendering for React
- [Strapi](https://strapi.io/) - Open-source headless CMS.
- [GraphQL](https://graphql.org/) - Data query and manipulation language for APIs
- [Sentry](https://sentry.io) - Error reporting platform

## Installation

Request the .env files and dev database from DT (djthomson@gmail.com)

PTL requires [Node.js](https://nodejs.org/) v10+ to run.

Install the frontend dependencies and devDependencies and start the Next.js server.

```sh
cd park-tennis-ladder/frontend
npm i
npm run dev
```

Install the backend dependencies and devDependencies and start the Strapi server.

```sh
cd ../../park-tennis-ladder/backend
npm i
npm run develop
```

## PayPal Test Credentials

For use locally and on staging.

### Customer 
Email
sb-h5uw86985249@personal.example.com
Password
G<Y84huI

### Credit Card
Card Type
Visa	
Card Number
4111111111111111

## Development

Want to contribute? Great!

We use Trellos for tasks, pick one and submit a pull request for code review.
