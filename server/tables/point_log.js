module.exports = (sequelize, DataTypes) => {
    return sequelize.define(
      'point_log',
      {
        'user_id' : {
          type: DataTypes.INTEGER(10),
          allowNull : false
        },

        'type' : {
          type: DataTypes.STRING(10),
          allowNull : false

          // 0 : 포인트 적립
          // 1 : 포인트 삭감
        },

        'point' : {
          type: DataTypes.INTEGER(10),
          allowNull : false
        },

        'comment' : {
          type: DataTypes.STRING,
          allowNull : false

          // 포인트 내역
        },

        'date' : {
          type: DataTypes.STRING(20),
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