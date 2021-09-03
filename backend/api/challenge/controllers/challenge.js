'use strict';
const { yup, sanitizeEntity } = require('strapi-utils');
const moment = require('moment');
// const yup = require('yup'); // @todo uninstall

module.exports = {

  async test(ctx) {
    // in the challengers last match did they lose to the opponent?
    let autoLock = false
    const challenger = 8 // dt
    const opponent = 1 // tim 
    const matches = await strapi.services.match.find({ ladder: 1, challenger, _sort: 'match_date:desc' }); // opponents matches
    console.log({ matches })
    const [lastMatch] = matches
    if (!lastMatch) return false
    // if ((lastMatch.challenger === challenger || lastMatch.opponent === challenger) && lastMatch.winner === opponent) {
    if (lastMatch.winner.id === opponent) {
      autoLock = true
    }
    return {
      autoLock,
      lastMatch
    }
  },

  // Find a challenge - makes user's private email and phone number fields available
  async findOne(ctx) {
    const schema = yup.object().shape({
      id: yup.number().required().positive().integer(),
    });

    const userId = ctx.state.user.id;
    const { id } = ctx.params;

    try {
      await schema.validate({ id })
    } catch (e) {
      throw ctx.throw(422, e.message)
    }

    // Handle 404s
    const entity = await strapi.services.match.findOne({ id });
    if (!entity) {
      ctx.throw(404, 'Challenge not found')
    }

    if (![entity.challenger.id, entity.opponent.id].includes(userId)) {
      throw ctx.throw(403, 'Access denied. Only challenge participants may view')
    }

    const { status, ladder, challenger, opponent } = entity

    return {
      id: entity.id,
      status,
      ladder: {
        id: ladder.id,
        name: ladder.name,
        deny_challenge_rank_change: ladder.deny_challenge_rank_change,
      },
      challenger: {
        id: challenger.id,
        username: challenger.username,
        availability: challenger.availability,
        ability: challenger.ability,
        about: challenger.about,
        email: challenger.email,
        phone: challenger.phone,
        avatar: challenger.avatar
      },
      opponent: {
        id: opponent.id,
        username: opponent.username,
        availability: opponent.availability,
        ability: opponent.ability,
        about: opponent.about,
        email: opponent.email,
        phone: opponent.phone,
        avatar: opponent.avatar
      },
      status_updated_at: entity.status_update_at
    }
  },

  /**
   * Create a record.
   * 
   * @return {Object}
   */
  async create(ctx) {
    const schema = yup.object().shape({
      ladderId: yup.number().required().positive().integer(),
      challengerId: yup.number().required().positive().integer(),
      opponentId: yup.number().required().positive().integer(),
    });

    const challenger = ctx.state.user;
    const challengerId = challenger.id
    const { ladderId, opponentId } = ctx.request.body;

    try {
      await schema.validate({ ladderId, challengerId, opponentId })
    } catch (e) {
      throw ctx.throw(422, e.message)
    }

    // Handle 404s
    const ladderEntity = await strapi.services.ladder.findOne({ id: ladderId });
    if (!ladderEntity) {
      ctx.throw(404, 'Ladder not found')
    }
    const challengerRankEntity = ladderEntity.ranks.find(rank => rank.user === challengerId)
    if (!challengerRankEntity) {
      ctx.throw(404, 'Challenger not found in ladder')
    }
    const opponentRankEntity = ladderEntity.ranks.find(rank => rank.user === opponentId)
    if (!opponentRankEntity) {
      ctx.throw(404, 'Opponent not found in ladder')
    }

    if (ladderEntity.disabled) {
      ctx.throw(422, 'ladder has been disabled')
    }

    const now = new Date()
    const end_date = new Date(ladderEntity.end_date)
    if (end_date < now) {
      ctx.throw(422, 'Ladder has been archived')
    }

    // Prevent challenges for users with an away status
    if (challenger.away) {
      ctx.throw(422, 'You cannot make a challenge when your status is set to away')
    }
    const opponentEntity = await strapi.plugins['users-permissions'].services.user.fetch({ id: opponentId });
    if (opponentEntity.away) {
      ctx.throw(422, 'You cannot challenge an opponent whose status is set to away')
    }

    // Challenge range
    const rankDiff = challengerRankEntity.rank - opponentRankEntity.rank
    console.log('DISALLOW CHALLENGE', (rankDiff > ladderEntity.challenge_range || (!ladderEntity.downward_challenges && rankDiff < 0)))
    if (rankDiff > ladderEntity.challenge_range || (!ladderEntity.downward_challenges && rankDiff < 0)) {
      ctx.throw(422, 'Opponents rank is out of range for a challenge')
    }

    // Prevent re-challenges
    const challengeWithOpponent = await strapi.services.match.find({ ladder: ladderEntity.id, challenger: challengerId, opponent: opponentId, status: 'Pending' });
    console.log({ challengeWithOpponent })
    if (challengeWithOpponent.length > 0) {
      ctx.throw(422, 'You have already made a pending challenge')
    }

    // One challenge limit?
    console.log({ one_challenge_limit: ladderEntity.one_challenge_limit })
    if (ladderEntity.one_challenge_limit) {
      const challengerChallenges = await strapi.services.match.find({ ladder: ladderEntity.id, challenger: challengerId, _where: { _or: [{ status: 'Pending' }, { status: 'Accepted' }] } });
      console.log({ challengerChallenges })
      if (challengerChallenges.length > 0) {
        ctx.throw(422, 'You can only make one total challenge')
      }
      const opponentChallenges = await strapi.services.match.find({ ladder: ladderEntity.id, opponent: opponentId, _where: { _or: [{ status: 'Pending' }, { status: 'Accepted' }] } });
      console.log({ opponentChallenges })
      if (opponentChallenges.length > 0) {
        ctx.throw(422, 'They have already been challenged by another player')
      }
    }

    // Challenge auto locking
    const { auto_lock_challenges, auto_lock_duration } = ladderEntity
    if (auto_lock_challenges) {
      const lastMatch = await strapi.services.match.findOne({ ladder: ladderEntity.id, challenger: challengerId, status: 'Played', _sort: 'status_updated_at:desc' });
      if (lastMatch && auto_lock_duration && auto_lock_duration > 0) {
        console.log({ auto_lock_duration, lastMatch })
        const autoLockExpiryDate = moment(lastMatch.updated_at).add(auto_lock_duration, "days");
        if (lastMatch.winner.id === opponentId && autoLockExpiryDate > moment()) {
          ctx.throw(422, `You cannot re-challenge until ${autoLockExpiryDate.format('DD/MM/YYYY')}`);
        }
      } else if (lastMatch && lastMatch.winner.id === opponentId) {
        ctx.throw(422, 'You must play another player before a rematch');
      }
    }

    const match = {
      challenger: challengerId,
      opponent: opponentId,
      ladder: ladderEntity.id,
      status: 'Pending',
      status_updated_at: new Date(),
      created_by: challengerId,
      status_updated_by: challengerId,
    }
    console.log({match})

    let entity = await strapi.services.match.create(match);

    console.log({entity})

    const html = `
    <p>Hey ${entity.opponent.username},</p>

    <p>You have been challenged by ${entity.challenger.username}!</p>

    <p>Email: ${entity.challenger.email}</p>${entity.challenger.phone ? `<p>Phone: ${entity.challenger.phone}</p> ` : ''}

    <p>Please login and go the <a href="https://park-tennis-ladders.co.uk/challenges/${entity.id}">challenge page</a> to accept / decline.</p>
    
    <p>Your challenger can then contact you to arrange the match date time and location</p>

    <p><a href="https://park-tennis-ladders.co.uk">Park Tennis Ladder</a></p>
    `

    console.log({ html })

    if (process.env.NODE_ENV === 'production') {
      await strapi.plugins['email'].services.email.send({
        to: entity.opponent.email,
        from: 'admin@park-tennis-ladders.co.uk',
        subject: '🎾 [Park Tennis Ladders] Pending Challenge',
        text: html,
        html,
      });
    }

    return sanitizeEntity(entity, { model: strapi.models.match });
  },

  /**
   * Update record.
   *
   * @return {Object}
   */
  async update(ctx) {
    const schema = yup.object().shape({
      id: yup.number().required().positive().integer(),
      status: yup.string().required().oneOf(["Accepted", "Declined", "Cancelled"]),
    })

    const user = ctx.state.user;
    const { id } = ctx.params;
    const { status } = ctx.request.body;

    try {
      await schema.validate({ id, status })
    } catch (e) {
      throw ctx.throw(422, e.message)
    }

    const challengeEntity = await strapi.services.match.findOne({ id });
    if (!challengeEntity) {
      ctx.throw(404, 'Challenge not found')
    }
    const { ladder, challenger, opponent } = challengeEntity

    console.log('PART OF CHALLENGE', { challenger: challenger.id, opponent: opponent.id, user: user.id })
    if (![challenger.id, opponent.id].includes(user.id)) {
      throw ctx.throw(403, 'You must be part of the challenge to update')
    }

    console.log('ACCEPTED', user.id !== opponent.id, user.id, opponent.id)
    if (status === 'Accepted' && user.id !== opponent.id) {
      throw ctx.throw(422, 'You must be the opponent to accept a challenge')
    }
    if (status === 'Accepted' && challengeEntity.status !== 'Pending') {
      throw ctx.throw(406, 'You can only accept a pending challenge')
    }
    if (status === 'Accepted') {
      const challengerHtml = `
      <p>Hey ${challenger.username},</p>
      <p>Your challenge with ${opponent.username} has been accepted.</p>
      <p>Please contact them to arrange the match.</p>
      <p>After the game please report the result on the <a href="https://park-tennis-ladders.co.uk/reports/${challengeEntity.id}">match report page</a>.</p>
      <p>Email: ${opponent.email}</p>${opponent.phone ? `<p>Phone: ${opponent.phone}</p> ` : ''}
      <p><a href="https://park-tennis-ladders.co.uk">Park Tennis Ladder</a></p>
      `
      console.log({ challengerHtml })
      if (process.env.NODE_ENV === 'production') {
        await strapi.plugins['email'].services.email.send({
          to: challenger.email,
          from: 'admin@park-tennis-ladders.co.uk',
          subject: '🎾 [Park Tennis Ladders] Accepted Challenge',
          text: challengerHtml,
          html: challengerHtml,
        });
      }
    }

    if (status === 'Cancelled' && !['Pending', 'Accepted'].includes(challengeEntity.status)) {
      throw ctx.throw(406, 'You can only cancel a pending or accepted challenge')
    }
    if (status === 'Cancelled' && user.id !== challenger.id) {
      throw ctx.throw(422, 'Please ask the challenger to cancel the challenge')
    }
    if (status === 'Cancelled') {
      const opponentHtml = `
      <p>Hey ${opponent.username},</p>
      <p>${challenger.username} has cancelled their challenge with you.</p>
      <p><a href="https://park-tennis-ladders.co.uk">Park Tennis Ladder</a></p>
      `
      console.log({ opponentHtml })
      if (process.env.NODE_ENV === 'production') {
        await strapi.plugins['email'].services.email.send({
          to: opponent.email,
          from: 'admin@park-tennis-ladders.co.uk',
          subject: '🎾  [Park Tennis Ladders] Cancelled Challenge',
          text: opponentHtml,
          html: opponentHtml,
        });
      }
    }

    if (status === 'Declined' && user.id !== opponent.id) {
      throw ctx.throw(422, 'You must be the opponent to decline a challenge')
    }
    if (status === 'Declined' && challengeEntity.status !== 'Pending') {
      throw ctx.throw(406, 'You can only decline a pending challenge')
    }
    if (status === 'Declined' && ladder.deny_challenge_rank_change) {

      const leapfrog = await strapi.services.rank.leapfrog(challengeEntity.id, challenger.id, opponent.id);
      console.log('DECLINED', leapfrog)

      const opponentHtml = `
      <p>Hey ${challenger.username},</p>
      <p>You have declined the challenge with ${challenger.username}.</p>
      <p>${challenger.username} has won the challenge by default.</p>
      <p>We are sorry that you lost your place, but we need to keep the ladder moving.</p>
      <p><a href="https://park-tennis-ladders.co.uk">Park Tennis Ladder</a></p>
      `
      console.log({ opponentHtml })
      if (process.env.NODE_ENV === 'production') {
        await strapi.plugins['email'].services.email.send({
          to: opponent.email,
          from: 'admin@park-tennis-ladders.co.uk',
          subject: '🎾 [Park Tennis Ladders] Declined Challenge',
          text: opponentHtml,
          html: opponentHtml,
        });
      }

      const challengerHtml = `
      <p>Hey ${opponent.username},</p>
      <p>Your challenge with ${opponent.username} has been declined.</p>
      <p>You have automatically won the challenge!</p>
      <p><a href="https://park-tennis-ladders.co.uk">Park Tennis Ladder</a></p>
      `
      console.log({ challengerHtml })
      if (process.env.NODE_ENV === 'production') {
        await strapi.plugins['email'].services.email.send({
          to: challenger.email,
          from: 'admin@park-tennis-ladders.co.uk',
          subject: '🎾  [Park Tennis Ladder] Declined Challenge',
          text: challengerHtml,
          html: challengerHtml,
        });
      }
    }
    if (status === 'Declined' && !ladder.deny_challenge_rank_change) {
      const challengerHtml = `
      <p>Hey ${challenger.username},</p>
      <p>Your challenge with ${opponent.username} has been declined.</p>
      <p><a href="https://park-tennis-ladders.co.uk">Park Tennis Ladder</a></p>
      `
      console.log({ challengerHtml })
      if (process.env.NODE_ENV === 'production') {
        await strapi.plugins['email'].services.email.send({
          to: challenger.email,
          from: 'admin@park-tennis-ladders.co.uk',
          subject: '🎾 [Park Tennis Ladders] Declined Challenge',
          text: challengerHtml,
          html: challengerHtml,
        });
      }
    }
    const match = { 
      status, 
      status_updated_at: new Date(), 
      status_updated_by: user.id 
    }
    const entity = await strapi.services.match.update({ id }, match);

    return sanitizeEntity(entity, { model: strapi.models.match });
  },

  /**
   * Process challenges for foriets
   *
   * @return {Object}
   */
  async process(ctx) {
    /*
    Expired Challenges
      Find all pending challenges greater than 48 hours (ladder config) old
      Set status to expired
      Ladder leap opponent, opponent moves 5 places down
    */
    console.log('RANK SERVICE', strapi.services.rank)

    const now = moment().toISOString()
    const laddersWithAutoForfiet = await strapi.services.ladder.find({ disabled: false, start_date_lt: now, end_date_gt: now, auto_forfeit_challenge: true });

    console.log({laddersWithAutoForfiet})
    console.log('now', now)

    let expiredChallengeAlerts = 0
    let expiredChallengeErrors = []

    for (let i = 0; i < laddersWithAutoForfiet.length; i++) {

      const { id, auto_forfeit_challenge_thresold } = laddersWithAutoForfiet[i]
      console.log({ auto_forfeit_challenge_thresold })
      if (!auto_forfeit_challenge_thresold || auto_forfeit_challenge_thresold < 1) continue;

      const challengeExpiryDate = moment().subtract(auto_forfeit_challenge_thresold, "days").format("YYYY-MM-DD");
      const expiredChallenges = await strapi.services.match.find({ ladder: id, status: 'Pending', created_at_lt: challengeExpiryDate });

      for (let i = 0; i < expiredChallenges.length; i++) {
        try {
          const { id, ladder, challenger, opponent } = expiredChallenges[i];
          const updateChallenge = await strapi.services.match.update({ id }, { status: 'Expired', winner: challenger, loser: opponent });
          const leapfrog = await strapi.services.rank.leapfrog(id, challenger.id, opponent.id);
          console.log({ leapfrog })

          // <p>${opponent.username} has taken your position on the ladder and you have been moved down ${demotion.ranksDemoted} ranks as a penalty.</p>

          const opponentHtml = `
      <p>Hey ${opponent.username},</p>
      <p>Your challenge with ${challenger.username} has expired as you did not respond within ${auto_forfeit_challenge_thresold} days.</p>
      <p>You have automatically forfeited the match</p>
      <p><a href="https://park-tennis-ladders.co.uk">Park Tennis Ladder</a></p>
      `
          console.log({ opponentHtml })
          if (process.env.NODE_ENV === 'production') {
            await strapi.plugins['email'].services.email.send({
              to: opponent.email,
              from: 'admin@park-tennis-ladders.co.uk',
              subject: '🎾 [Park Tennis Ladders] Challenge Forfeit',
              text: opponentHtml,
              html: opponentHtml,
            });
          }

          const challengerHtml = `
      <p>Hey ${challenger.username},</p>
      <p>Your challenge with ${opponent.username} has exppired as they did not respond within ${auto_forfeit_challenge_thresold} days.</p>
      <p>You have automatically won the match</p>
      <p><a href="https://park-tennis-ladders.co.uk">Park Tennis Ladder</a></p>
      `
          // <p>You have automatically won the challenge! ${opponent.username} has been moved down ${demotion.ranksDemoted} ranks as a penalty.</p>
          console.log({ challengerHtml })

          expiredChallengeAlerts++
          if (process.env.NODE_ENV === 'production') {
            await strapi.plugins['email'].services.email.send({
              to: challenger.email,
              from: 'admin@park-tennis-ladders.co.uk',
              subject: '🎾 [Park Tennis Ladders] Challenge Forfiet',
              text: challengerHtml,
              html: challengerHtml,
            });
          }
        } catch (e) {
          console.log('Expired Challenge Error', e)
          expiredChallengeErrors.push(e)
        }
      }
    };


    const laddersWithAutoExpire = await strapi.services.ladder.find({ disabled: false, start_date_lt: now, end_date_gt: now, auto_expire_challenges: true });

    let expiredMatchAlerts = 0
    let expiredMatchErrors = []

    console.log({ laddersWithAutoExpire })

    for (let i = 0; i < laddersWithAutoExpire.length; i++) {

      const { id, auto_expire_challenge_threshold, auto_expire_challenge_penalty } = laddersWithAutoExpire[i]

      if (!auto_expire_challenge_threshold || !auto_expire_challenge_penalty) continue

      try {
        const matchExpiryDate = moment().subtract(auto_expire_challenge_threshold, "days").format("YYYY-MM-DD");
        const expiredMatches = await strapi.services.match.find({ ladder: id, status: 'Accepted', created_at_lt: matchExpiryDate });
        console.log({ expiredMatches })

        for (let i = 0; i < expiredMatches.length; i++) {

          const { id, ladder, challenger, opponent } = expiredMatches[i];
          const updateChallenge = await strapi.services.match.update({ id }, { status: 'Expired' });
          const demoteChallenger = await strapi.services.rank.demote(ladder.id, challenger.id, auto_expire_challenge_penalty);
          const demoteOpponent = await strapi.services.rank.demote(ladder.id, opponent.id, auto_expire_challenge_penalty);

          const challengerHtml = `
      <p>Hey ${challenger.username},</p>
      <p>Your accepted challenge with ${opponent.username} has expired as a score was not entered within 10 days.</p>
      <p>You have been moved down ${demoteChallenger.ranksDemoted} ranks as a penalty.</p>
      <p><a href="https://park-tennis-ladders.co.uk">Park Tennis Ladder</a></p>
      `
          if (process.env.NODE_ENV === 'production') {
            await strapi.plugins['email'].services.email.send({
              to: challenger.email,
              from: 'admin@park-tennis-ladders.co.uk',
              subject: '🎾 [Park Tennis Ladders] Expired Challenge',
              text: challengerHtml,
              html: challengerHtml,
            });
          }
          console.log({ challengerHtml })

          const opponentHtml = `
      <p>Hey ${opponent.username},</p>
      <p>The challenge you accepted with ${challenger.username} has exppired as a score was not entered within 10 days.</p>
      <p>You have been moved down ${demoteOpponent.ranksDemoted} ranks as a penalty.</p>
      <p><a href="https://park-tennis-ladders.co.uk">Park Tennis Ladder</a></p>
      `
          console.log({ opponentHtml })
          if (process.env.NODE_ENV === 'production') {
            await strapi.plugins['email'].services.email.send({
              to: opponent.email,
              from: 'admin@park-tennis-ladders.co.uk',
              subject: '🎾 [Park Tennis Ladders] Expired Challenge',
              text: opponentHtml,
              html: opponentHtml,
            });
          }
          expiredMatchAlerts++
        }
      } catch (e) {
        expiredMatchErrors.push(e)
      }
    }

    return {
      expiredChallengeAlerts,
      expiredChallengeErrors,
      expiredMatchAlerts,
      expiredMatchErrors
    }
  }
};