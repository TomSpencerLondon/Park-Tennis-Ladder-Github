'use strict';
const { yup, sanitizeEntity } = require('strapi-utils');

/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/concepts/controllers.html#core-controllers)
 * to customize this controller
 */

module.exports = {
  /**
   * Create a record.
   *
   * @return {Object}
   */

  async index(ctx) {
    console.log('NODE_ENV', process.env.NODE_ENV)
    // const result = await strapi.services.rank.promote(1, 1, 4)
    // // const result = await strapi.services.rank.leapfrog(3, 8, 1)
    // return {'demote': result}
  },

  async update(ctx) {
    const schema = yup.object().shape({
      id: yup.number().required().positive().integer(),
      status: yup.string().required().oneOf(["Played", "Forfeited", "Cancelled", "Disputed"]),
      winner: yup.number().positive().integer(),
      challenger_set_scores: yup.array().of(yup.number().required().positive().integer()),
      opponent_set_scores: yup.array().of(yup.number().required().positive().integer()),
    });

    const user = ctx.state.user;
    const { id } = ctx.params;
    const { winner, status, challenger_set_scores, opponent_set_scores, comment } = ctx.request.body;

    try {
      await schema.validate({ id, winner, status })
    } catch (e) {
      throw ctx.throw(422, e.message)
    }

    const matchEntity = await strapi.services.match.findOne({ id });
    if (!matchEntity) {
      ctx.throw(404, 'Match not found')
    }
    const { challenger, opponent, ladder } = matchEntity
    const loser = winner == challenger.id ? opponent.id : challenger.id

    if (![challenger.id, opponent.id].includes(user.id)) {
      throw ctx.throw(403, 'You must be part of the challenge to update the result')
    }

    // Allow only accepted challenges to be cancelled
    if (status === 'Cancelled' && matchEntity.status === 'Accepted') {
      if (challenger.id === user.id) {
        const opponentHtml = `
        <p>Hey ${opponent.username},</p>
        <p>${challenger.username} has entered their match with you as cancelled.</p>
        <p><a href="https://park-tennis-ladders.co.uk">Park Tennis Ladder</a></p>
        `
        if (process.env.NODE_ENV === 'production') {
          await strapi.plugins['email'].services.email.send({
            to: opponent.email,
            from: 'admin@park-tennis-ladders.co.uk',
            subject: '🎾 [Park Tennis Ladders] Cancelled Match',
            text: opponentHtml,
            html: opponentHtml,
          });
        }
        console.log({ opponentHtml })
      } else if (opponent.id === user.id) {
        const challengertHtml = `
        <p>Hey ${challenger.username},</p>
        <p>${opponent.username} has entered their match with you as cancelled.</p>
        <p><a href="https://park-tennis-ladders.co.uk">Park Tennis Ladder</a></p>
        `
        if (process.env.NODE_ENV === 'production') {
          await strapi.plugins['email'].services.email.send({
            to: challenger.email,
            from: 'admin@park-tennis-ladders.co.uk',
            subject: '🎾 [Park Tennis Ladders] Cancelled Match',
            text: challengertHtml,
            html: challengertHtml,
          });
        }
        console.log({ challengertHtml })
      }
      const entity = await strapi.services.match.update({ id }, { status: 'Cancelled', status_updated_at: new Date(), comment });
      return sanitizeEntity(entity, { model: strapi.models.match });
    } else if (status === 'Cancelled') {
      ctx.throw(403, 'Only accepted challenges can be cancelled')
    }

    // Allow only one result dispute
    if (status === 'Disputed' && ['Played', 'Forfeited'].includes(matchEntity.status)) {
      // undo rank change
      console.log(user.id, matchEntity.id)
      // await strapi.services.rank.dispute(user.id, matchEntity.id);
      const entity = await strapi.services.match.update({ id }, { status: 'Disputed', status_updated_at: new Date(), comment });
      return sanitizeEntity(entity, { model: strapi.models.match });
    } else if (status === 'Disputed') {
      ctx.throw(403, 'Only played or forfeited matches can be disputed')
    }

    if (matchEntity.status !== 'Accepted') {
      throw ctx.throw(422, 'You can only enter results for accepted challenges')
    } 

    // Prevent more than one result update
    if (['Played', 'Forfeited'].includes(matchEntity.status)) {
      ctx.throw(422, 'Match has already been updated')
    }

    if (![challenger.id, opponent.id].includes(Number(winner))) {
      throw ctx.throw(422, 'Winner must be either the challenger or opponent')
    }

    let affectedRanks
    // Rank change?
    try {
      const isDownardChallenge = await strapi.services.rank.isDownwardChallenge(ladder.id, challenger.id, opponent.id)

      if (matchEntity.ladder.downward_challenges && isDownardChallenge) {
        affectedRanks = await strapi.services.rank.downwardChallengeResult(matchEntity.id, winner, loser, challenger.id, opponent.id)
      } else {
        affectedRanks = await strapi.services.rank.leapfrog(matchEntity.id, winner, loser)
      }
      console.log({ affectedRanks })

    } catch (e) {
      console.log('match rank update error', e)
      throw ctx.throw(500, 'Something went wrong with the rank change')
    }

    if (status === 'Played') {
      console.log({challenger_set_scores, opponent_set_scores})
      const r = challenger_set_scores.reduce((acc, v, k) => {
        const cs = Number(v)
        const os = Number(opponent_set_scores[k])
        if (isNaN(cs) || isNaN(os)) {
          throw ctx.throw(422, `Invalid Score must be in numbers`)
        } else if (cs === os) {  
          throw ctx.throw(422, `Invalid Score ${cs} - ${os}`)
        } else if (cs < 6 && os < 6) {  
          throw ctx.throw(422, `Invalid Score ${cs} - ${os}`)
        } else if (cs > 7 || os > 7) {  
          throw ctx.throw(422, `Invalid Score ${cs} - ${os}`)
        } else if ((cs === 6 && os !== 7) && (os > 6 || os < 0)) {  
          throw ctx.throw(422, `Invalid Score ${cs} - ${os}`)
        } else if ((os === 6 && cs !== 7) && (cs > 6 || cs < 0)) {  
          throw ctx.throw(422, `Invalid Score ${cs} - ${os}`)
        }  
        const r = cs > os
        return [...acc, r]
      }, [])
      
      const cg = r.filter(x => x === true)
      const og = r.filter(x => x === false)
      if (cg.length === og.length) {
         throw ctx.throw(422, `Invalid Score sets drawn`)
      }
      const scoreResult = cg.length > og.length ? 'challenger' : 'opponent'
      console.log(winner, typeof winner)
      console.log(challenger.id, typeof challenger.id)
      if (scoreResult === 'challenger' && winner != challenger.id) {
        throw ctx.throw(422, 'Winner is challenger according to score')
      }
      if (scoreResult === 'opponent' && winner != opponent.id) {
        throw ctx.throw(422, 'Winner is opponent according to score')
      }      
    }

    if (challenger.id === user.id) {
      const opponentHtml = `
      <p>Hey ${opponent.username},</p>
      <p>${challenger.username} has entered a result for your match</p>
      <p>Please login and go the <a href="https://park-tennis-ladders.co.uk/results/${matchEntity.id}">result page</a> to see the score</p>
      <p><a href="https://park-tennis-ladders.co.uk">Park Tennis Ladder</a></p>
      `
      console.log({ opponentHtml })
      if (process.env.NODE_ENV === 'production') {
        await strapi.plugins['email'].services.email.send({
          to: opponent.email,
          from: 'admin@park-tennis-ladders.co.uk',
          subject: '🎾 [Park Tennis Ladders] Match Result',
          text: opponentHtml,
          html: opponentHtml,
        });
      }
    } else if (opponent.id === user.id) {
      const challengertHtml = `
      <p>Hey ${challenger.username},</p>
      <p>${opponent.username} has entered a result for your match</p>
      <p>Please login and go the <a href="https://park-tennis-ladders.co.uk/results/${matchEntity.id}">result page</a> to see the score</p>
      <p><a href="https://park-tennis-ladders.co.uk">Park Tennis Ladder</a></p>
      `
      console.log({ challengertHtml })
      if (process.env.NODE_ENV === 'production') {
        await strapi.plugins['email'].services.email.send({
          to: challenger.email,
          from: 'admin@park-tennis-ladder.co.uk',
          subject: '🎾 [Park Tennis Ladders] Match Result',
          text: challengertHtml,
          html: challengertHtml,
        });    
      }
    }

    // Save played or forfieted match
    const entity = await strapi.services.match.update({ id },
      { winner, loser, status, status_updated_at: new Date(), challenger_set_scores, opponent_set_scores, comment, status_updated_by: user.id }
    );
    console.log({ updatedMatch: entity })
    const sanitizedEntity = sanitizeEntity(entity, { model: strapi.models.match })
    return { ...sanitizedEntity, affectedRanks }
  },
};