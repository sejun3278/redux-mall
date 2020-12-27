module.exports = (sequelize, DataTypes) => {
    return sequelize.define(
      'order',
      {
        "user_id" : {
            type: DataTypes.INTEGER(10),
            allowNull : false
        },

        "order_state" : {
            type: DataTypes.INTEGER(10),
            allowNull : false
            // 0 : 임시
            // 1 : 구매
            // 2 : 취소
        },

        "cart_list" : {
            type : DataTypes.TEXT(),
            allowNull : false
        },

        "order_title" : {
            type: DataTypes.STRING(100),
            allowNull : false
        },

        "code" : {
            type: DataTypes.INTEGER(10),
            allowNull : false
        },

        "delivery_price" : {
            type: DataTypes.INTEGER(10),
            allowNull : false
        },

        "result_price" : {
            type: DataTypes.INTEGER(10),
            allowNull : false

            // 배달비, 쿠폰 적용 X
            // 원가 - 할인가를 뺀 가격
        },

        "discount_price" : {
            type: DataTypes.INTEGER(10),
            allowNull : false

            // 할인가
        },

        "cancel_reason" : {
            // 주문 취소 사유
            type: DataTypes.STRING(100),
            allowNull : true
        },

        'create_date' : {
            type: DataTypes.STRING(20),
            allowNull : false
        },

        'buy_date' : {
            type: DataTypes.STRING(20),
            allowNull : true
        },

        'cancel_date' : {
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