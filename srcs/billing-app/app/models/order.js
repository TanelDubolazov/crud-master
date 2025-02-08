const { DataTypes } = require("sequelize");
const sequelize = require("../config/database.js");

const Order = sequelize.define("Order", {
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  number_of_items: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  total_amount: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
});

module.exports = Order;
