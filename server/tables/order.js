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
            // 2 : 확정
            // 3 : 취소
        },

        "order_type" : {
            type : DataTypes.INTEGER(10),
            allowNull : false

            // 0 : null
            // 1 : 무통장 입금
            // 2 : 카드 결제
            // 3 : 포인트 & 쿠폰 결제
        },

        "payment_state" : {
            type : DataTypes.INTEGER(10),
            allowNull : false

            // 0 : 결제 전 (= 무통장 입금)
            // 1 : 결제 완료 (카드 결제 및 입금 확인)
        },

        "delivery_state" : {
            type : DataTypes.INTEGER(10),
            allowNull : false

            // 0 : null
            // 1 : 상품 준비중 (취소 가능)
            // 2 : 배송중
            // 3 : 배송 완료
        },

        "cart_list" : {
            type : DataTypes.TEXT(),
            allowNull : false
        },

        "goods_num" : {
            type: DataTypes.INTEGER(10),
            allowNull : false

            // 바로 구매시 상품 갯수
        },

        "order_title" : {
            type: DataTypes.STRING(100),
            allowNull : false
        },

        "code" : {
            type: DataTypes.INTEGER(10),
            allowNull : false
        },

        "origin_price" : {
            type: DataTypes.INTEGER(10),
            allowNull : false
        },

        "discount_price" : {
            type: DataTypes.INTEGER(10),
            allowNull : false

            // 할인가
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

        "point_price" : {
            type: DataTypes.INTEGER(10),
            allowNull : false,
            defaultValue : 0

            // 적용한 포인트
        },

        "coupon_price" : {
            type: DataTypes.INTEGER(10),
            allowNull : false,
            defaultValue : 0

            // 적용한 쿠폰 가격
        },

        "final_price" : {
            type: DataTypes.INTEGER(10),
            allowNull : false,
            defaultValue : 0

            // 결제한 총 가격
        },

        "coupon_id" : {
            type: DataTypes.INTEGER(10),
            allowNull : true

            // 사용한 쿠폰 번호
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
        
        'payment_date' : {
            type: DataTypes.STRING(20),
            allowNull : true
        },

        'order_complate_date' : {
            type: DataTypes.STRING(20),
            allowNull : true

            // 주문 확정된 날짜
        },

        'delivery_start_date' : {
            type: DataTypes.STRING(20),
            allowNull : true

            // 배송 출발일
        },

        'delivery_complate_date' : {
            type: DataTypes.STRING(20),
            allowNull : true

            // 수취 완료일
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