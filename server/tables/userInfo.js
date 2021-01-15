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

       name : {
        type: DataTypes.STRING(20),
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

       host_code: {
        type: DataTypes.STRING(10),
        allowNull : true
       },

       host : {
        type: DataTypes.STRING(30),
        allowNull : true
       },

       host_detail : {
        type: DataTypes.STRING(30),
        allowNull : true
       },

       point : {
        type: DataTypes.INTEGER(10),
        allowNull : false 

        // 현재 포인트
       },

       use_point : {
        type: DataTypes.INTEGER(10),
        allowNull : false

        // 사용한 포인트
       },

       acc_point : {
        type: DataTypes.INTEGER(10),
        allowNull : false 

        // 적립된 포인트
       },

       signup_date: {
        type: DataTypes.STRING(20),
        allowNull : false
       },

       modify_date: {
        type: DataTypes.STRING(20),
        allowNull : true
       },

       login_date: {
        type: DataTypes.STRING(20),
        allowNull : true
       },

       disable_date: {
        type: DataTypes.STRING(20),
        allowNull : true
       },

       admin: {
        type: DataTypes.STRING(5),
        allowNull : false
       },

       state : {
        type: DataTypes.INTEGER(5),
        allowNull : false 
       }

      },
      {
        charset: 'utf8',
        collate: 'utf8_general_ci',
        timestamps: false,
        freezeTableName : true
      }
  )};