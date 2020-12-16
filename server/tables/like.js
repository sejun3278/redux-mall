module.exports = (sequelize, DataTypes) => {
    return sequelize.define(
      'like',
      {
        'user_id' : {
            type: DataTypes.INTEGER(10),
            allowNull : false
        },

        'goods_id' : {
            type: DataTypes.INTEGER(10),
            allowNull : false
        },

        'state' : {
          type: DataTypes.INTEGER(10),
          allowNull : false
        },

        'create_date' : {
            type: DataTypes.STRING(20),
            allowNull : false
        },

        'modify_date' : {
          type: DataTypes.STRING(20),
          allowNull : true
        }
      },
      {
        charset: 'utf8',
        collate: 'utf8_general_ci',
        timestamps: false,
        freezeTableName : true
      }
  )};