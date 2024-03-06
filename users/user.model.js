const { DataTypes } = require("sequelize");

module.exports = model;

function model(sequelize) {
  const attributes = {
    email: { type: DataTypes.STRING, allowNull: false },
    firstName: { type: DataTypes.STRING, allowNull: false },
    lastName: { type: DataTypes.STRING, allowNull: false },
    userName: { type: DataTypes.STRING, allowNull: false },
    passwordHash: { type: DataTypes.STRING, allowNull: false },
    permission: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    role: { type: DataTypes.STRING, allowNull: true },
    status: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "active",
    },
    datedeactivated: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: new Date(),
    },
    datereactivated: { type: DataTypes.DATE, allowNull: true },
  };

  const options = {
    defaultScope: {
      // exclude password hash by default
      attributes: { exclude: ["passwordHash"] },
    },
    scopes: {
      // include hash with this scope
      withHash: { attributes: {} },
    },
  };

  return sequelize.define("User", attributes, options);
}
