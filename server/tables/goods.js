module.exports = (sequelize, DataTypes) => {
    return sequelize.define(
      'goods',
      {
       name: { 
        type: DataTypes.STRING(100), 
        allowNull : false 
       },

       first_cat: { 
        type: DataTypes.STRING(15), 
        allowNull : false 
       },

       last_cat: { 
        type: DataTypes.STRING(15), 
        allowNull : false 
       },

       thumbnail: { 
        type: DataTypes.TEXT(), 
        allowNull : false
       },

       origin_price: { 
        type: DataTypes.INTEGER(15), 
        allowNull : false
       },

       discount_price: { 
        type: DataTypes.INTEGER(5), 
        allowNull : true
       },

       result_price: { 
        type: DataTypes.INTEGER(15), 
        allowNull : false
       },

       stock: { 
        type: DataTypes.INTEGER(15), 
        allowNull : false
       },

       sales: { 
        type: DataTypes.INTEGER(15), 
        allowNull : false

        // 판매량
       },

       star: { 
        type: DataTypes.INTEGER(5), 
        allowNull : false

        // 평점
       },

       acc_star : {
        type: DataTypes.INTEGER(5), 
        allowNull : false

        // 누적 평점
       },

       bonus_img: { 
        type: DataTypes.TEXT(), 
        allowNull : true
       },

       img_where: {
        type: DataTypes.STRING(10), 
        allowNull : false
       },

       contents : {
        type : DataTypes.TEXT(),
        allowNull : true
       },

       date: {
        type: DataTypes.STRING(20),
        allowNull : false
       },

       state : {
        type: DataTypes.BOOLEAN(), 
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