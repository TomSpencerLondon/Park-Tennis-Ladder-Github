'use strict';
const { yup } = require('strapi-utils');;
/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/concepts/models.html#lifecycle-hooks)
 * to customize this model
 */

module.exports = {
  lifecycles: {
    async beforeCreate(data) {
      const schema = yup.object().shape({
        ladder: yup.number().required().positive().integer(),
        user: yup.number().required().positive().integer(),
        rank: yup.number().required().positive().integer(),
      });
      const {ladder, user, rank} = data
      try {
        await schema.validate({ ladder, user, rank })
      } catch (e) {
        throw strapi.errors.badRequest(e)
      }        
    },
    async beforeUpdate(params, data) {
      const schema = yup.object().shape({
        ladder: yup.number().required().positive().integer(),
        user: yup.number().required().positive().integer(),
        rank: yup.number().required().positive().integer(),
      });
      const {ladder, user, rank} = data
      try {
        await schema.validate({ ladder, user, rank })
      } catch (e) {
        throw strapi.errors.badRequest(e)
      }          
    }, 
  }
};