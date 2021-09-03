'use strict';
const { parseMultipartData, sanitizeEntity } = require('strapi-utils');

module.exports = {
  /**
   * Create a record.
   * 
   * @TODO unused? delete.
   *
   * @return {Object}
   */

  async create(ctx) {
    let entity;
    console.log(ctx.request.body)
    if (ctx.is('multipart')) {
      const { data, files } = parseMultipartData(ctx);
      entity = await strapi.services.match.create(data, { files });
    } else {
      entity = await strapi.services.match.create(ctx.request.body.entity);
    }
    entity = sanitizeEntity(entity, { model: strapi.models.match });

    await strapi.plugins['email'].services.email.send({
      to: ctx.request.body.email.to,
      from: 'admin@park-tennis-ladder.co.uk',
      subject: '🎾 [Park Tennis Ladder] Challenge',
      text: `You have been challenged!`,
      html: `
        <p>Hey ${ctx.request.body.email.challengeeName},</p>

        <p>You have been challenged by ${ctx.request.body.email.challengerName}!</p>

        <p>Ladder: ${ctx.request.body.email.ladderName}</p>

        <p>Please login and go the <a href="https://park-tennis-ladder/challenges/${entity.id}">challenge page</a> to accept / decline.</p>
        
        <p><a href="https://park-tennis-ladder">Park Tennis Ladder</a></p>
      `,
    });

    return entity
  },
};