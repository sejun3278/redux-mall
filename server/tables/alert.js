module.exports = (sequelize, DataTypes) => {
    return sequelize.define(
      'alert',
      {
        'user_id' : {
            type: DataTypes.INTEGER(10),
            allowNull : false
        },

        'reason' : {
            type: DataTypes.TEXT(),
            allowNull : false

            // alert 메세지
        },

        'move_url' : {
            type: DataTypes.STRING(80),
            allowNull : false

            // 링크 포함
        },

        'create_date' : {
          type: DataTypes.STRING(20),
          allowNull : false
        },

        'confirm' : {
            type: DataTypes.INTEGER(10),
            allowNull : false

            // 0 : 확인 전
            // 1 : 확인
          },
      },
      {
        charset: 'utf8',
        collate: 'utf8_general_ci',
        timestamps: false,
        freezeTableName : true
      }
  )};