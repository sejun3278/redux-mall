module.exports = (sequelize, DataTypes) => {
    return sequelize.define(
      'userInfo',
      {
       user_id: {
        type: DataTypes.STRING(20),
        allowNull : false
       },

       nickname: {
        type: DataTypes.STRING(20),
        allowNull : false
       },

       password: {
        type: DataTypes.STRING(150),
        allowNull : false
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
        type: DataTypes.STRING(20),
        allowNull : false
       },

       modify_date: {
        type: DataTypes.STRING(20),
        allowNull : true
       },

       connet_date: {
        type: DataTypes.STRING(20),
        allowNull : true
       },

       admin: {
        type: DataTypes.STRING(5),
        allowNull : false
       },
      },
      {
        charset: 'utf8',
        collate: 'utf8_general_ci',
        timestamps: false,
        freezeTableName : true
      }
  )};