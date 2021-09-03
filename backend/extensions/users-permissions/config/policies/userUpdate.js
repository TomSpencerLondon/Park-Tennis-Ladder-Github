const { yup } = require('strapi-utils');

module.exports = async (ctx, next) => {
  // If the user is an administrator we allow them to perform this action unrestricted
  if (ctx.state.user.role.name === "Administrator") {
    return next();
  }

  const { id: currentUserId } = ctx.state.user;
  // If you are using MongoDB do not parse the id to an int!
  const userToUpdate = Number.parseInt(ctx.params.id, 10);

  if (currentUserId !== userToUpdate) {
    return ctx.unauthorized("Unable to edit this user ID");
  }

  // Provide custom validation policy here
  const schema = yup.object().shape({
    firstname: yup.string().required(),
    lastname: yup.string().required(),
    skill: yup.string().required(),
    email: yup.string().email(),
  })

  const {
    username,
    email,
    phone,
    firstname,
    lastname,
    away,
    skill,
    availability,
  } = ctx.request.body

  try {
    await schema.validate({
      email,
      phone,
      firstname,
      lastname,
      skill,
      away,
    })
  } catch (e) {
    throw ctx.throw(422, e.message)
  }

  ctx.request.body = {
    username,
    email,
    phone,
    firstname,
    lastname,
    away,
    skill,
    availability,
  };
  return next();
};