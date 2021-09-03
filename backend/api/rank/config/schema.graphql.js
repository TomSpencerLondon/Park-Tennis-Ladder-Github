module.exports = {
  query: `
    rankCount(where: JSON): Int!
  `,
  resolver: {
    Query: {
      rankCount: {
        description: 'Return the count of ranks',
        resolverOf: 'application::rank.rank.count',
        resolver: async (obj, options, ctx) => {
          return await strapi.api.rank.services.rank.count(options.where || {});
        },
      },
    },
  },
};