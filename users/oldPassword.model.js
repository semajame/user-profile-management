// oldPassword.model.js
const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  return sequelize.define("OldPassword", {
    oldPassword: {
      type: DataTypes.STRING,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  });
};
