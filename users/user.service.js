const bcrypt = require("bcryptjs");
const db = require("_helpers/db");

module.exports = {
  getAll,
  getById,
  create,
  update,
  delete: _delete,
};

async function getAll() {
  return await db.User.findAll();
}

async function getById(id) {
  return await getUser(id);
}

async function create(params) {
  // validate
  if (await db.User.findOne({ where: { email: params.email } })) {
    throw 'Email "' + params.email + '" is already registered';
  }

  const user = new db.User(params);

  // hash password

  user.passwordHash = await bcrypt.hash(params.password, 10);

  // save user
  await user.save();
}

async function update(id, params) {
  const user = await getUser(id);

  if (params.password === user.oldPassword) {
    throw new Error("Cannot use the old password as the new password");
  }

  if (params.password) {
    user.oldPassword = user.passwordHash;

    user.passwordHash = params.password;
  }

  // if (params.password) {
  //   user.passwordHash = await bcrypt.hash(params.password, 10);
  // }

  console.log("UPDATED");
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
