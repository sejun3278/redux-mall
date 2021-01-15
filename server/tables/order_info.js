module.exports = (sequelize, DataTypes) => {
    return sequelize.define(
      'order_info',
      {
        'user_id' : {
            type: DataTypes.INTEGER(10),
            allowNull : false
        },

        'order_id' : {
            type: DataTypes.INTEGER(10),
            allowNull : false
        },

        'final_price' : {
            type: DataTypes.INTEGER(10),
            allowNull : false

            // 결제된(할) 총 가격
        },

        'get_user_name' : {
            type: DataTypes.STRING(20),
            allowNull : false

            // 받는이
        },

        'get_host_code' : {
            type: DataTypes.STRING(20),
            allowNull : false

            // 우편번호
        },

        'get_host' : {
            type: DataTypes.STRING(50),
            allowNull : false

            // 주소
        },

        'get_host_detail' : {
            type: DataTypes.STRING(50),
            allowNull : false

            // 상세 주소
        },

        'get_phone' : {
            type: DataTypes.STRING(20),
            allowNull : false

            // 전화번호
        },

        'delivery_message' : {
            type: DataTypes.STRING(60),
            allowNull : true

            // 배송 메세지
        },

        'post_name' : {
            type: DataTypes.STRING(20),
            allowNull : false

            // 주문인
        },

        'post_email' : {
            type: DataTypes.STRING(50),
            allowNull : false

            // 주문자 이메일
        },

        'post_phone' : {
            type: DataTypes.STRING(30),
            allowNull : false

            // 주문자 전화번호
        },

        // 'delivery_state' : {
        //     type: DataTypes.INTEGER(20),
        //     allowNull : false

        //     // 배송 상황
        //     // 0 : 배송 시작 전
        //     // 1 : 배송 준비
        //     // 2 : 배송 중
        //     // 3 : 배송 완료
        // },

        'info_agree' : {
            type: DataTypes.INTEGER(10),
            allowNull : false

            // 회원 정보 수집 동의 여부
            // 0 : false
            // 1 : true
        },

        'create_date' : {
            type: DataTypes.STRING(20),
            allowNull : false
        },
      },
      {
        charset: 'utf8',
        collate: 'utf8_general_ci',
        timestamps: false,
        freezeTableName : true
      }
  )};