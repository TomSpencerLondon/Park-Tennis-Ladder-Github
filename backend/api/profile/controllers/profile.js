'use strict';
const { yup, sanitizeEntity, parseMultipartData } = require('strapi-utils');

/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/concepts/controllers.html#core-controllers)
 * to customize this controller
 */

module.exports = {
  /**
   * Get user profile as email and telephone are private fields else where in the API
   *
   * @return {Object}
   */

  async index(ctx) {
    const schema = yup.object().shape({
      id: yup.number().required().positive().integer(),
    });

    const { id } = ctx.state.user;

    try {
      await schema.validate({ id })
    } catch (e) {
      throw ctx.throw(422, e.message)
    }

    const user = await strapi.query('user', 'users-permissions').findOne({ id })

    if (!user) {
      ctx.throw(404, 'User not found')
    }

    const {
      username,
      email,
      phone,
      firstname,
      lastname,
      gender,
      away,
      skill,
      availability,
      avatar
    } = user

    console.log({ user })

    return {
      username,
      email,
      phone,
      firstname,
      lastname,
      gender,
      skill,
      availability,
      avatar
    }
  },

  async update(ctx) {
    const schema = yup.object().shape({
      id: yup.number().required().positive().integer(),
      firstname: yup.string().required(),
      lastname: yup.string().required(),
      skill: yup.string().required(),
      email: yup.string().email().required(),
      phone: yup.number().positive().integer(),
    })

    const { id } = ctx.state.user;

    const {
      email,
      phone,
      firstname,
      lastname,
      away,
      skill,
      availability,
      avatar
    } = ctx.request.body;

    try {
      await schema.validate({
        id,
        email,
        phone,
        skill,
        firstname,
        lastname,
        away,
      })
    } catch (e) {
      throw ctx.throw(422, e.message)
    }

    let entity;
    if (ctx.is('multipart')) {
      const { data, files } = parseMultipartData(ctx);
      entity = await strapi.plugins['users-permissions'].update({ id }, data, {
        files,
      });
    } else {
      console.log('UPDATE SKILL', ctx.request.body)
      entity = await strapi.plugins['users-permissions'].update({ id }, ctx.request.body);
    }
      
    console.log('GET PROFILE', {id, ...sanitizeEntity(entity, { model: strapi.models.user })})
    return {id, ...sanitizeEntity(entity, { model: strapi.models.user })};
  }
};