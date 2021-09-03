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

    // const userId = ctx.state.user.id;
    // const { ladderId } = ctx.request.body;
    const { userId, ladderId } = ctx.request.body;

    try {
      await schema.validate({ ladderId, userId})
    } catch (e) {
      throw ctx.throw(422, e.message)
    }

    
  }
};
