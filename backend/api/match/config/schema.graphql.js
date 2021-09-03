module.exports = {
  query: `
    matchCount(where: JSON): Int!
  `,
  resolver: {
    Query: {
      matchCount: {
        description: 'Return the count of matches',
        resolverOf: 'application::match.match.count',
        resolver: async (obj, options, ctx) => {
          return await strapi.api.match.services.match.count(options.where || {});
        },
      },
    },
  },
};