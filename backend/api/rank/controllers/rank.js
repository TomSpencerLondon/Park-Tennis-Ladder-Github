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
  async create(ctx) {
    const schema = yup.object().shape({
      ladderId: yup.number().required().positive().integer(),
      userId: yup.number().required().positive().integer(),
    });

    const userId = ctx.state.user.id;
    const { ladderId } = ctx.request.body;

    try {
      await schema.validate({ ladderId, userId })
    } catch (e) {
      throw ctx.throw(422, e.message)
    }

    // Handle 404s
    const ladderEntity = await strapi.services.ladder.findOne({ id: ladderId });
    if (!ladderEntity) {
      ctx.throw(404, 'Ladder not found')
    }
    const userEntity = await strapi.plugins['users-permissions'].services.user.fetch({ id: userId });
    if (!userEntity) {
      ctx.throw(404, 'User not found')
    }

    if (ladderEntity.disabled) {
      ctx.throw(422, 'Ladder has been disabled')
    }

    const now = new Date()
    const end_date = new Date(ladderEntity.end_date)
    if (end_date < now) {
      ctx.throw(422, 'Ladder has been archived')
    }

    const rankEntity = await strapi.services.rank.findOne({ ladder: ladderEntity.id, user: userEntity.id });
    if (rankEntity) {
      throw ctx.throw(422, 'You have already joined this ladder')
    }

    // Rank according to ability
    const result = await strapi.connections.default.transaction(async (trx) => {


      async function initalRanking() {
        await trx('ranks').insert({ ladder: ladderEntity.id, user: userEntity.id, rank: -999, created_by: userId });
        const rankEntities = await trx('users-permissions_user')
          .join('ranks', 'ranks.user', 'users-permissions_user.id')
          .where('ranks.ladder', ladderEntity.id)
          .orderBy('users-permissions_user.skill', 'desc')
          .orderBy('users-permissions_user.created_at', 'asc')

        for (let i = 0; i < rankEntities.length; i++) {
          await trx('ranks').where({ id: rankEntities[i].id }).update({ rank: (-(i + 1)) })
        }
        for (let i = 0; i < rankEntities.length; i++) {
          await trx('ranks').where({ id: rankEntities[i].id }).update({ rank: (i + 1) })
        }
      }

      async function updatingRankings() {
        const rankEntities = await trx('users-permissions_user')
          .join('ranks', 'ranks.user', 'users-permissions_user.id')
          .where('ranks.ladder', ladderEntity.id)
        const skillCounts = rankEntities.reduce((acc, x) => {
          acc[x.skill] = acc[x.skill] ? acc[x.skill] + 1 : 1
          return acc
        }, {});
        const rankThresholds = Object.fromEntries(Object.entries(skillCounts).reverse().reduce((acc, [skill, count], i, arr) => {
          const prevElement = acc[i - 1]
          const prevTotal = prevElement ? prevElement[1] : 0
          const result = prevTotal ? prevTotal + count : count
          acc.push([skill, result])
          return acc
        }, []));

        function closest(needle, haystack) {
          console.log({ haystack })
          if (haystack.length === 0) return 0
          return haystack.reduce((a, b) => {
            let aDiff = Math.abs(a - needle);
            let bDiff = Math.abs(b - needle);

            if (aDiff == bDiff) {
              return a > b ? a : b;
            } else {
              return bDiff < aDiff ? b : a;
            }
          });
        }

        // Find user's rank threshold, if there are no matching skills move up to the next closest skill level
        const userSkill = userEntity.skill.id
        const skillIndex = rankThresholds.hasOwnProperty(userSkill) ? userEntity.skill.id : closest(userSkill, Object.keys(rankThresholds))
        // If there isn't a rank threshold further up then move them to 1st 
        const userRank = Number(userSkill) > Number(skillIndex) ? 1 : rankThresholds[skillIndex] + 1;

        console.log('rankThresholds', rankThresholds)
        console.log('userSkill', userSkill)
        console.log('skillIndex', skillIndex)
        console.log('userRank', userRank)

        // First on ladder?
        if (rankEntities.length === 0) {
          await trx('ranks').insert({ ladder: ladderEntity.id, user: userEntity.id, rank: 1, created_by: userId });
        } else {
          const movableRanks = await trx('ranks').where({ ladder: ladderId })
            .where('rank', '>=', userRank)
            .orderBy('rank', 'desc')

          console.log('movableRanks', movableRanks)

          const results = await Promise.all(movableRanks.map((r) => (
            trx('ranks').where({ id: r.id }).update({ rank: -(r.rank + 1) })
          )))
          await trx('ranks').insert({ ladder: ladderEntity.id, user: userEntity.id, rank: userRank, created_by: userId });
          const results1 = await Promise.all(movableRanks.map((r) => (
            trx('ranks').where({ id: r.id }).update({ rank: r.rank + 1 })
          )))
        }
      }

      const start_date = new Date(ladderEntity.start_date)

      // Before the ladder starts rank according to skill and first come first serve
      console.log(start_date, now)
      if (start_date > now) {
        console.log('INIT RANKS')
        await initalRanking();
        // Insert new player at the bottom of their ability percentage range  
      } else {
        console.log('UPDATE RANKS')
        await updatingRankings();
      }

      const result = await trx('ranks').where('ladder', ladderEntity.id).orderBy('rank', 'asc')

      // return Promise.resolve(r)
      return Promise.resolve(result)
      // console.log({ rankEntities })
      // if (!rankEntities || rankEntities.length === 0) {
      //   rank = 1
      // } else {
      //   const lastRank = rankEntities.pop()
      //   rank = lastRank.rank + 1
      // }
      // let entity = await trx('ranks').insert({ ladder: ladderEntity.id, user: userEntity.id, rank, created_by: userId });
      // entity = sanitizeEntity(entity, { model: strapi.models.rank });
      // return Promise.resolve(entity)
    })

    // 0 Dave Thomson 5
    // 1 Snoop Doge 4
    // 2 Phil Colins 3
    // 3 Janet Smith 2
    // 4 Phil MacIntosh 1
    // 5 Phil Evans 1

    // Add to bottom of ladder
    // const result = await strapi.connections.default.transaction(async (trx) => {
    //   let rank
    //   // const rankEntities = await strapi.services.rank.find({ ladder: ladderEntity.id, _sort: 'rank:asc'  });
    //   const rankEntities = await trx('ranks').where('ladder', ladderEntity.id).orderBy('rank', 'asc')
    //   console.log({rankEntities})
    //   if (!rankEntities || rankEntities.length === 0) {
    //     rank = 1
    //   } else {
    //     const lastRank = rankEntities.pop()
    //     rank = lastRank.rank + 1
    //   } 
    //   let entity = await trx('ranks').insert({ladder: ladderEntity.id, user: userEntity.id, rank, created_by: userId});
    //   entity = sanitizeEntity(entity, { model: strapi.models.rank});
    //   return Promise.resolve(entity)
    // })

    return result
  }
};