module.exports = (sequelize, DataTypes) => {
    return sequelize.define(
      'cart',
      {
        'user_id' : {
            type: DataTypes.INTEGER(10),
            allowNull : false
        },

        'goods_id' : {
            type: DataTypes.INTEGER(10),
            allowNull : false
        },

        'price' : {
            type: DataTypes.INTEGER(10),
            allowNull : false
        },

        'discount' : {
          type: DataTypes.INTEGER(10),
          allowNull : false
        },

        'num' : {
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
        },

        'buy_date' : {
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