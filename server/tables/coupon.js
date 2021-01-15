module.exports = (sequelize, DataTypes) => {
    return sequelize.define(
      'coupon',
      {
        'code' : {
          type: DataTypes.STRING(40),
          allowNull : false

          // 쿠폰 코드
        },

        'name' : {
          type: DataTypes.STRING(80),
          allowNull : false

          // 쿠폰 이름
        },

        'user_id' : {
            type: DataTypes.STRING(20),
            allowNull : false
        },

        'discount' : {
            type: DataTypes.INTEGER(10),
            allowNull : false
        },

        'percent' : {
            type: DataTypes.INTEGER(3),
            allowNull : false

            // 퍼센트 할인?
        },

        'max_discount' : {
            type: DataTypes.INTEGER(10),
            allowNull : false

            // 할인 최대 제한가
        },

        'limit_price' : {
            type: DataTypes.INTEGER(10),
            allowNull : false

            // 금액 제한
        },

        'state' : {
          type: DataTypes.INTEGER(10),
          allowNull : false

          // 0 : 사용 전
          // 1 : 사용
          // 2 : 기간 지남
          // 3 : 사용 불가
        },

        'create_date' : {
            type: DataTypes.STRING(20),
            allowNull : false

            // 발급일
        },

        'limit_date' : {
          type: DataTypes.STRING(20),
          allowNull : false

            // 사용 제한 기간
        },

        'use_date' : {
          type: DataTypes.STRING(20),
          allowNull : true
  
            // 사용한 기간
        },

        'use_order_id' : {
          type: DataTypes.INTEGER(10),
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