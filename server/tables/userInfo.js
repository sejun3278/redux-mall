module.exports = (sequelize, DataTypes) => {
    return sequelize.define(
      'userInfo',
      {
       user_id: {
        type: DataTypes.STRING(20),
        allowNull : true
       },

       nickname: {
        type: DataTypes.STRING(20),
        allowNull : true
       },

       password: {
        type: DataTypes.STRING(150),
        allowNull : true
       },

       email: {
        type: DataTypes.STRING(50),
        allowNull : true
       },

       phone: {
        type: DataTypes.STRING(20),
        allowNull : true
       },

       host: {
        type: DataTypes.STRING(40),
        allowNull : true
       },

       signup_date: {
        type: DataTypes.DATE,
        allowNull : true
       },
      },
      {
        charset: 'utf8',
        collate: 'utf8_general_ci',
        timestamps: false,
        freezeTableName : true
      }
  )};