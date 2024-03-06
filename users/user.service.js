const bcrypt = require("bcryptjs");
const db = require("_helpers/db");
const oldPasswordModel = require("./oldPassword.model");
const { Op } = require("sequelize");

module.exports = {
  getAll,
  getById,
  create,
  update,
  delete: _delete,
  getUserProfile,
  updateUserProfile,
  updatePassword,

  // user role
  updatePermission,
  updateUserRole,
  searchUsers,
  getByUsername,

  // user deactivation
  deactivate,
  reactivate,
};

async function getByUsername(username) {
  const user = await db.User.findOne({ where: { userName: username } });
  return user;
}

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

  // user.passwordHash = params.password;

  // save user
  await user.save();
}

async function update(id, params) {
  const user = await db.User.findByPk(id, {
    attributes: [
      "id",
      "email",
      "firstName",
      "lastName",
      "passwordHash",
      "userName",
    ],
  });

  // validate
  const emailChanged = params.email && user.email !== params.email;

  if (
    emailChanged &&
    (await db.User.findOne({ where: { email: params.email } }))
  ) {
    throw 'Email "' + params.email + '" is already registered';
  }

  Object.assign(user, params);
  await user.save();
}

async function updatePassword(id, params) {
  const user = await db.User.findByPk(id, {
    attributes: ["id", "passwordHash"],
  });

  if (params.password) {
    if (params.password === user.passwordHash) {
      throw new Error(
        "New password cannot be the same as the current password"
      );
    }

    if (params.password) {
      const isOldPassword = await db.OldPassword.findOne({
        where: {
          userId: user.id,
          oldPassword: params.password,
        },
      });

      if (isOldPassword) {
        throw new Error("New password cannot be the same as any old password");
      }

      await db.OldPassword.create({
        userId: user.id,
        oldPassword: user.passwordHash,
      });

      user.passwordHash = await bcrypt.hash(params.password, 10);
    }
  }

  Object.assign(user, params);
  await user.save();
}

async function _delete(id) {
  const user = await getUser(id);
  await user.destroy();
}

// helper functions

// async function getUser(id) {
//   const user = await db.User.findByPk(id);
//   if (!user) throw "User not found";
//   return user;
// }

async function getUserProfile(id) {
  const user = await db.User.findByPk(id);
  if (!user) {
    throw `User with ID ${id} not found`; // Informative error message
  }
  return user;
}

async function updateUserProfile(params) {
  const userIdToFind = 1;

  // Retrieve the user with explicit selection of passwordHash
  const user = await db.User.findByPk(userIdToFind, {
    attributes: ["id", "email", "firstName", "lastName", "passwordHash"],
  });

  if (params.password) {
    const isOldPassword = await db.OldPassword.findOne({
      where: {
        userId: user.id,
        oldPassword: params.password,
      },
    });

    if (isOldPassword) {
      throw new Error("New password cannot be the same as any old password");
    }

    await db.OldPassword.create({
      userId: user.id,
      oldPassword: user.passwordHash,
    });

    user.passwordHash = params.password;
  }

  Object.assign(user, params);

  await user.save();
}

// DEACTIVATE

async function deactivate(id) {
  const user = await getUser(id);

  // Set isactive to 0 and set datedeactivated to current date
  user.status = "inactive";
  user.datedeactivated = new Date(); // This will set the current date and time

  // Save the updated user
  await user.save();
}

async function reactivate(id) {
  const user = await getUser(id);

  // Set status to 0 and set datedeactivated to current date
  user.status = "active";
  user.datereactivated = new Date(); // This will set the current date and time

  // Save the updated user
  await user.save();
}

// USER ROLE

// ! Search Users
async function searchUsers({ name, email }) {
  let whereClause = {};

  if (name) {
    const nameClause = {
      [Op.or]: [
        { firstName: { [Op.like]: `%${name}%` } },
        { lastName: { [Op.like]: `%${name}%` } },
      ],
    };
    whereClause = { ...whereClause, ...nameClause };
  }

  if (email) {
    whereClause.email = { [Op.like]: `%${email}%` };
  }

  if (!name && !email) {
    return await getAll(); // Assuming getAll() is another function that retrieves all users
  } else {
    return await db.User.findAll({ where: whereClause });
  }
}

// ! Update user role
async function updateUserRole(userId, newRole) {
  const field = "Role"; // Specify the field being updated
  const user = await getUser(userId);

  // Update user role
  user.role = newRole;
  await user.save();

  // Create entry in Updated table
  await db.Updated.create({
    userId,
    Field: field,
    value: newRole,
    updatedAt: new Date(),
  });
}

// ! Update Permission
async function updatePermission(userId, permission) {
  const field = "Permission"; // Specify the field being updated
  const user = await getUser(userId);

  // Update user permission
  user.permission = permission;
  await user.save();

  // // Create entry in Updated table
  await db.Updated.create({
    userId,
    Field: field,
    value: permission,
    updatedAt: new Date(),
  });
}
