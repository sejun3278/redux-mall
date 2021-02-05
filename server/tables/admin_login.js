module.exports = (sequelize, DataTypes) => {
    return sequelize.define(
      'admin_login',
      // 관리자 로그인 로그 테이블
      {
        'user_id' : {
            type: DataTypes.INTEGER(10),
            allowNull : false
        },

        'code' : {
            type: DataTypes.STRING(20),
            allowNull : true
        },

        'login_date' : {
          type: DataTypes.STRING(20),
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