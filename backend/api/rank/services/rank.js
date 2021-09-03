'use strict';
const { yup } = require('strapi-utils');;

/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/concepts/services.html#core-services)
 * to customize this service
 */

module.exports = {

  leapfrog: async (matchId, winnerId, loserId) => {
    const schema = yup.object().shape({
      matchId: yup.number().required().positive().integer(),
      winnerId: yup.number().required().positive().integer(),
      loserId: yup.number().required().positive().integer(),
    });

    try {
      await schema.validate({ matchId, winnerId, loserId })
    } catch (e) {
      throw strapi.errors.badRequest(e)
    }

    const result = await strapi.connections.default.transaction(async (trx) => {
      // Find the match and ranks
      const [match] = await trx('matches').where('id', matchId);
      if (!match) {
        throw strapi.errors.notFound(404, 'match not found')
      }
      const ladderId = match.ladder
      const [winnerRank] = await trx('ranks').where({ ladder: ladderId, user: winnerId })
      if (!winnerRank) {
        throw strapi.errors.notFound(`rank not found ${JSON.stringify({ winnerId, ladderId })}`)
      }
      const [loserRank] = await trx('ranks').where({ ladder: ladderId, user: loserId })
      if (!loserRank) {
        throw strapi.errors.notFound(`rank not found ${JSON.stringify({ loserId, ladderId })}`)
      }

      // Challenger wins and leapfrogs losers rank
      if (winnerRank.rank > loserRank.rank) {
        console.log({ winner: winnerRank.rank, loser: loserRank.rank })

        const movableRanks = await trx('ranks').where({ ladder: ladderId })
          .andWhere('rank', '<', winnerRank.rank)
          .andWhere('rank', '>=', loserRank.rank)
          .orderBy('rank', 'desc')
        console.log({ movableRanks })

        try {
          // Record rank history for effected ladder participants before changes @TODO check if this prevents retries after errors
          const [winnerHistory] = await trx('rank_histories').insert({ match: match.id, user: winnerId, rank: winnerRank.rank })
          const rankHistories = await Promise.all(movableRanks.map((r) => (
            trx('rank_histories').insert({ match: match.id, user: r.user, rank: r.rank })
          )))
          console.log({ winnerHistory, rankHistories })
        } catch (e) {
          console.log('HISTORY ERROR', e)
        }

        // Handle leap frog
        // To side step the unique rank contraint we make the changes negativley and then again positively
        // https://stackoverflow.com/jobs/503592/software-engineer-backend-nodejs-moneyhub-financial-technology
        const result = await trx('ranks').where({ id: winnerRank.id }).update({ rank: -loserRank.rank })
        const results = await Promise.all(movableRanks.map((r) => (
          trx('ranks').where({ id: r.id }).update({ rank: -(r.rank + 1) })
        )))
        console.log({ result, results })
        // Leap frog winner's rank
        const result1 = await trx('ranks').where({ id: winnerRank.id }).update({ rank: loserRank.rank })
        // Loser and ranks inbetween move down a rank
        const results1 = await Promise.all(movableRanks.map((r) => (
          trx('ranks').where({ id: r.id }).update({ rank: r.rank + 1 })
        )))
        console.log({ result1, results1 })

        const newRankings = await trx('ranks').where({ ladder: ladderId }).orderBy('rank', 'asc')
        const result2 = newRankings.map(r => ({ username: r.user, rank: r.rank }))
        return Promise.resolve({ result2 })

        // Challenger loses so no rank changes, we record the rank history just for the match participants and their stats
      } else {

        try {
          const [winnerHistory] = await trx('rank_histories').insert({ match: match.id, user: winnerId, rank: winnerRank.rank })
          const [loserHistory] = await trx('rank_histories').insert({ match: match.id, user: loserId, rank: loserRank.rank })
          console.log({ winnerHistory, loserHistory })
          return Promise.resolve([{ winnerId, rank: winnerRank.rank }, { loserId, rank: loserRank.rank }])
        } catch (e) {
          console.log('HSITORY ERROR', e)
        }

      }
    })

    return result
  },

  isDownwardChallenge: async (ladderId, challengerId, opponentId) => {
    const schema = yup.object().shape({
      ladderId: yup.number().required().positive().integer(),
      challengerId: yup.number().required().positive().integer(),
      opponentId: yup.number().required().positive().integer(),
    });

    try {
      await schema.validate({ ladderId, challengerId, opponentId })
    } catch (e) {
      throw strapi.errors.badRequest(e)
    }

    const challengerRank = await strapi.services.rank.findOne({ ladder: ladderId, user: challengerId })
    if (!challengerRank) {
      throw strapi.errors.notFound(`rank not found ${JSON.stringify({ challengerId, ladderId })}`)
    }
    const opponentRank = await strapi.services.rank.findOne({ ladder: ladderId, user: opponentId })
    if (!opponentRank) {
      throw strapi.errors.notFound(`rank not found ${JSON.stringify({ opponentId, ladderId })}`)
    }
    return challengerRank.rank < opponentRank.rank
  },

  downwardChallengeResult: async (matchId, winnerId, loserId, challengerId, opponentId) => {
    const schema = yup.object().shape({
      matchId: yup.number().required().positive().integer(),
      winnerId: yup.number().required().positive().integer(),
      loserId: yup.number().required().positive().integer(),
      challengerId: yup.number().required().positive().integer(),
      opponentId: yup.number().required().positive().integer(),
    });

    try {
      await schema.validate({ matchId, winnerId, loserId, challengerId, opponentId })
    } catch (e) {
      throw strapi.errors.badRequest(e)
    }

    const result = await strapi.connections.default.transaction(async (trx) => {
      try {
        const [match] = await trx('matches').where('id', matchId);
        if (!match) {
          throw strapi.errors.notFound(404, 'match not found')
        }
        const ladderId = match.ladder
        const [winnerRank] = await trx('ranks').where({ ladder: ladderId, user: winnerId })
        if (!winnerRank) {
          throw strapi.errors.notFound(`rank not found ${JSON.stringify({ winnerId, ladderId })}`)
        }
        const [loserRank] = await trx('ranks').where({ ladder: ladderId, user: loserId })
        if (!loserRank) {
          throw strapi.errors.notFound(`rank not found ${JSON.stringify({ loserId, ladderId })}`)
        }

        console.log((winnerId == opponentId, winnerRank.rank > loserRank.rank), { winnerId, opponentId, WR: winnerRank.rank, LR: loserRank.rank })

        // Opponent wins against higher up challenger and is allowed to move up only one rank
        if (winnerId == opponentId && winnerRank.rank > loserRank.rank) {

          const [rankAbove] = await trx('ranks').where({ ladder: ladderId, rank: winnerRank.rank - 1 })
          console.log({ rankAbove })

          try {
            // Record rank history for effected ladder participants before changes
            const [winnerHistory] = await trx('rank_histories').insert({ match: match.id, user: winnerId, rank: winnerRank.rank })
            const [rankAboveHistory] = await trx('rank_histories').insert({ match: match.id, user: rankAbove.user, rank: rankAbove.rank })
            console.log({ winnerHistory, rankAboveHistory })
          } catch (e) {
            console.log('HSITORY ERROR', e)
          }

          // Make rank changes negatively first to avoid unique rank contraint
          const result0 = await trx('ranks').where({ id: winnerRank.id }).update({ rank: -(rankAbove.rank) })
          const result1 = await trx('ranks').where({ id: rankAbove.id }).update({ rank: -(rankAbove.rank + 1) })
          console.log({ result0, result1 })
          // Winner is promoted one rank
          const winnerResult = await trx('ranks').where({ id: winnerRank.id }).update({ rank: (rankAbove.rank) })
          // // Loser and ranks inbetween move down a rrankAbove
          const demotedResult = await trx('ranks').where({ id: rankAbove.id }).update({ rank: (rankAbove.rank + 1) })
          console.log({ winnerResult, demotedResult })

          const newRankings = await trx('ranks').where({ ladder: ladderId }).orderBy('rank', 'asc')
          const result2 = newRankings.map(r => ({ username: r.user, rank: r.rank }))
          return Promise.resolve({ result2 })

          // Challenger loses so no rank changes, we record the rank history just for the match participants and their stats
        } else {

          try {
            const [winnerHistory] = await trx('rank_histories').insert({ match: match.id, user: winnerId, rank: winnerRank.rank })
            const [loserHistory] = await trx('rank_histories').insert({ match: match.id, user: loserId, rank: loserRank.rank })
            console.log({ winnerHistory, loserHistory })
            return Promise.resolve({ winnerHistory, loserHistory })
          } catch (e) {
            console.log('HSITORY ERROR', e)
          }

        }
      } catch (e) {
        return Promise.reject(e)
      }
    })

    return result;
  },

  promote: async (ladderId, userId, numRanks) => {
    const schema = yup.object().shape({
      ladderId: yup.number().required().positive().integer(),
      userId: yup.number().required().positive().integer(),
      numRanks: yup.number().required().positive().integer(),
    });
    console.log({ denote: true })

    try {
      await schema.validate({ ladderId, userId, numRanks })
    } catch (e) {
      throw strapi.errors.badRequest(e)
    }

    const result = await strapi.connections.default.transaction(async (trx) => {
      try {
        const [userRank] = await trx('ranks').where({ ladder: ladderId, user: userId })
        console.log({ userRank })

        if (!userRank) {
          throw strapi.errors.notFound(`rank not found ${JSON.stringify({ userId, ladderId })}`)
        }

        console.log('PROMOTE', userRank.user.username)

        const movableRanks = await trx('ranks').where({ ladder: ladderId })
          .andWhere('rank', '>=', userRank.rank - numRanks)
          .andWhere('rank', '<', userRank.rank)
          .orderBy('rank', 'asc')

        console.log({ movableRanks })

        let numRanksToPromote = numRanks
        // Only promote past available ranks
        if (movableRanks && movableRanks.length < numRanks) {
          numRanksToPromote = movableRanks.length
        }

        console.log({ numRanksToPromote })

        // User is demoted numRanks
        // To side step the unique rank contraint we make the changes negativley and then again positively
        const result0 = await trx('ranks').where({ id: userRank.id }).update({ rank: -(userRank.rank - numRanksToPromote) })
        const results0 = await Promise.all(movableRanks.map((r) => (
          trx('ranks').where({ id: r.id }).update({ rank: -(r.rank + 1) })
        )))
        const promotedResult = await trx('ranks').where({ id: userRank.id }).update({ rank: (userRank.rank - numRanksToPromote) })
        const results = await Promise.all(movableRanks.map((r) => (
          trx('ranks').where({ id: r.id }).update({ rank: (r.rank + 1) })
        )))
        console.log({ promotedResult, results })
        const newRankings = await trx('ranks').where({ ladder: ladderId }).orderBy('rank', 'asc')
        const result2 = newRankings.map(r => ({ username: r.user, rank: r.rank }))
        return Promise.resolve({ ranksDemoted: numRanksToPromote, result2 })

        // return Promise.resolve({ ranksDemoted: numRanksToDemote, ...results, demotedResult })
      } catch (e) {
        console.log('PROMOTE ERROR', e)
        return Promise.reject(e)
      }
    })
  },

  demote: async (ladderId, userId, numRanks) => {
    const schema = yup.object().shape({
      ladderId: yup.number().required().positive().integer(),
      userId: yup.number().required().positive().integer(),
      numRanks: yup.number().required().positive().integer(),
    });
    console.log({ denote: true })

    try {
      await schema.validate({ ladderId, userId, numRanks })
    } catch (e) {
      throw strapi.errors.badRequest(e)
    }

    const result = await strapi.connections.default.transaction(async (trx) => {
      try {
        const [userRank] = await trx('ranks').where({ ladder: ladderId, user: userId })
        console.log({ userRank })

        if (!userRank) {
          throw strapi.errors.notFound(`rank not found ${JSON.stringify({ userId, ladderId })}`)
        }

        console.log('DOMOTEE', userRank.user.username)

        const movableRanks = await trx('ranks').where({ ladder: ladderId })
          .andWhere('rank', '<=', userRank.rank + numRanks)
          .andWhere('rank', '>', userRank.rank)
          .orderBy('rank', 'desc')

        console.log({ movableRanks })

        let numRanksToDemote = numRanks
        // Only demote past available ranks
        if (movableRanks && movableRanks.length < numRanks) {
          numRanksToDemote = movableRanks.length
        }

        console.log({ numRanksToDemote })

        // User is demoted numRanks
        // To side step the unique rank contraint we make the changes negativley and then again positively
        const result0 = await trx('ranks').where({ id: userRank.id }).update({ rank: -(userRank.rank + numRanksToDemote) })
        const results0 = await Promise.all(movableRanks.map((r) => (
          trx('ranks').where({ id: r.id }).update({ rank: -(r.rank - 1) })
        )))
        const demotedResult = await trx('ranks').where({ id: userRank.id }).update({ rank: (userRank.rank + numRanksToDemote) })
        const results = await Promise.all(movableRanks.map((r) => (
          trx('ranks').where({ id: r.id }).update({ rank: (r.rank - 1) })
        )))
        console.log({ demotedResult, results })
        const newRankings = await trx('ranks').where({ ladder: ladderId }).orderBy('rank', 'asc')
        const result2 = newRankings.map(r => ({ username: r.user, rank: r.rank }))
        return Promise.resolve({ ranksDemoted: numRanksToDemote, result2 })

        // return Promise.resolve({ ranksDemoted: numRanksToDemote, ...results, demotedResult })
      } catch (e) {
        console.log('DEMOTE ERROR', e)
        return Promise.reject(e)
      }
    })

    return result;
  }
};