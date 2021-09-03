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
        challenger: yup.number().required().positive().integer(),
        opponent: yup.number().required().positive().integer(),
      });
      const {ladder, challenger, opponent} = data
      try {
        await schema.validate({ ladder, challenger, opponent })
      } catch (e) {
        throw strapi.errors.badRequest(e)
      }        
    }
  }
};