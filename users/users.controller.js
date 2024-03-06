const express = require("express");
const router = express.Router();
const Joi = require("joi");
const validateRequest = require("_middleware/validate-request");
const Role = require("_helpers/role");
const userService = require("./user.service");

// routes

// get
router.get("/search", searchSchema, searchUsers);
router.get("/profile/:id", getUserProfile);
router.get("/", getAll);
router.get("/:id", getById);

// create
router.post("/", createSchema, create);

// update
router.put("/profile/:id", updateSchema, updateUserProfile);
router.put("/profile/password/:id", updateSchema, updatePassword);
router.put("/:id", updateSchema, update);

// delete
router.delete("/:id", _delete);

// deactivate and reactivate
router.put("/:id/deactivate", deactivate, deactivateSchema);
router.put("/:id/reactivate", reactivate, reactivateSchema);
router.post("/login", loginSchema, login);

// user role
router.put("/:id/role", updateRole);
router.put("/:id/permission", updatePermission);

module.exports = router;

// route functions
function updateUserProfile(req, res, next) {
  userService
    .updateUserProfile(req.body)
    .then(() => res.json({ message: "User Updated" }))
    .catch(next);
}

function getUserProfile(req, res, next) {
  userService
    .getUserProfile(req.params.id)
    .then((users) => res.json(users))
    .catch(next);
}

function getAll(req, res, next) {
  userService
    .getAll()
    .then((users) => res.json(users))
    .catch(next);
}

function getById(req, res, next) {
  userService
    .getById(req.params.id)
    .then((user) => res.json(user))
    .catch(next);
}

function create(req, res, next) {
  userService
    .create(req.body)
    .then(() => res.json({ message: "User created" }))
    .catch(next);
}

function update(req, res, next) {
  userService
    .update(req.params.id, req.body)
    .then(() => res.json({ message: "User Updated" }))
    .catch(next);
}

function _delete(req, res, next) {
  userService
    .delete(req.params.id)
    .then(() => res.json({ message: "User deleted" }))
    .catch(next);
}

function updatePassword(req, res, next) {
  userService
    .update(req.params.id, req.body)
    .then(() => res.json({ message: "Password Updated" }))
    .catch(next);
}

function deactivate(req, res, next) {
  userService
    .deactivate(req.params.id, req.body)
    .then(() => res.json({ message: "user deactivated" }))
    .catch(next);
}
function reactivate(req, res, next) {
  userService
    .reactivate(req.params.id, req.body)
    .then(() => res.json({ message: "User Activated" }))
    .catch(next);
}

function login(req, res, next) {
  userService
    .getByUsername(req.body.userName)
    .then((user) => {
      if (!user) {
        return res.status(404).json({ message: "User does not exist" });
      }

      if (user.status === "inactive") {
        return res.status(401).json({ message: "User is not active" });
      }

      res.json({ message: "Login successful" });
    })
    .catch(next);
}

// user role

async function searchUsers(req, res, next) {
  try {
    const users = await userService.searchUsers(req.query);
    res.json(users);
  } catch (error) {
    next(error);
  }
}

async function updateRole(req, res, next) {
  const { id } = req.params;
  const { newRole } = req.body;

  try {
    await userService.updateUserRole(id, newRole);
    res.json({ message: "User role updated" });
  } catch (error) {
    next(error);
  }
}

async function updatePermission(req, res, next) {
  const { id } = req.params;
  const { permission } = req.body;

  try {
    await userService.updatePermission(id, permission);
    res.json({ message: "User permission updated" });
  } catch (error) {
    next(error);
  }
}

// schema functions

function searchSchema(req, res, next) {
  const schema = Joi.object({
    userName: Joi.string(),
    email: Joi.string().email(),
  });
  validateRequest(req, next, schema);
}

function loginSchema(req, res, next) {
  const schema = Joi.object({
    userName: Joi.string().required(),
    password: Joi.string().min(6).required(),
    confirmPassword: Joi.string().valid(Joi.ref("password")).required(),
  });
  validateRequest(req, next, schema);
}

function deactivateSchema(req, res, next) {
  const schema = Joi.object({
    datedeactivated: Joi.date().default(new Date()).empty(""),
    status: Joi.string().valid("0").default("0").empty(""),
  });
  validateRequest(req, res, schema);
}

function reactivateSchema(req, res, res) {
  const schema = Joi.object({
    datereactivated: Joi.date().default(new Date()).empty(""),
    status: Joi.string().valid("1").default("1").empty(""),
  });
  validateRequest(req, res, schema);
}

function createSchema(req, res, next) {
  const schema = Joi.object({
    firstName: Joi.string().required(),
    lastName: Joi.string().required(),
    userName: Joi.string().required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    confirmPassword: Joi.string().valid(Joi.ref("password")).required(),
  });
  validateRequest(req, next, schema);
}

function updateSchema(req, res, next) {
  const schema = Joi.object({
    firstName: Joi.string().empty(""),
    lastName: Joi.string().empty(""),
    userName: Joi.string().empty(""),
    email: Joi.string().email().empty(""),
    role: Joi.string()
      .valid(
        Role.Admin,
        Role.User,
        Role.Faculty,
        Role.Student,
        Role.admin,
        Role.student,
        Role.user,
        Role.faculty
      )
      .empty(""),
    password: Joi.string().min(6).empty(""),
    confirmPassword: Joi.string().valid(Joi.ref("password")).empty(""),
  }).with("password", "confirmPassword");
  validateRequest(req, next, schema);
}
