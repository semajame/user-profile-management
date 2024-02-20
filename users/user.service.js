const bcrypt = require("bcryptjs");
const db = require("_helpers/db");

module.exports = {
  getAll,
  getById,
  create,
  update,
  delete: _delete,
  getUserProfile,
  updateUserProfile,
};

async function getAll() {
  return await db.User.findAll();
}

async function getById(id) {
  console.log("BUSHET");
  return await getUser(id);
}

async function create(params) {
  // validate
  if (await db.User.findOne({ where: { email: params.email } })) {
    throw 'Email "' + params.email + '" is already registered';
  }

  const user = new db.User(params);

  // hash password

  // user.passwordHash = await bcrypt.hash(params.password, 10);
  user.passwordHash = params.password;

  // save user
  await user.save();
}

async function update(id, params) {
  const user = await getUser(id);

  // validate
  const emailChanged = params.email && user.email !== params.email;
  if (
    emailChanged &&
    (await db.User.findOne({ where: { email: params.email } }))
  ) {
    throw 'Email "' + params.email + '" is already registered';
  }

  // if (params.password) {
  //   user.passwordHash = await bcrypt.hash(params.password, 10);
  // }

  Object.assign(user, params);
  await user.save();
}

async function _delete(id) {
  const user = await getUser(id);
  await user.destroy();
}

// helper functions

async function getUser(id) {
  const user = await db.User.findByPk(id);
  if (!user) throw "User not found";
  return user;
}

async function getUserProfile() {
  // Retrieve user data from the database based on the authenticated user's ID
  const userIdToFind = 1;
  const user = await db.User.findByPk(userIdToFind);

  if (!user) throw "Way user nakit an";

  return user;
}

async function updateUserProfile(params) {
  const userIdToFind = 1;

  const user = await db.User.findByPk(userIdToFind);

  if (params.password) {
    user.passwordHash = params.password;
  }
  Object.assign(user, params);
  // user.set(params);

  await user.save();
  console.log("User object after update:", user.toJSON());
}
