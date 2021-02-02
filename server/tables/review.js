module.exports = (sequelize, DataTypes) => {
    return sequelize.define(
      'review',
      {
       user_id: {
        type: DataTypes.INTEGER(10),
        allowNull : false
       },

       goods_id: {
        type: DataTypes.INTEGER(10),
        allowNull : false
       },

       order_id: {
        type: DataTypes.INTEGER(10),
        allowNull : false

        // 해당 상품을 구매했던 주문 번호
       },

       score: {
        type: DataTypes.INTEGER(10),
        allowNull : false

        // 점수 = 5점 만점
       },

       state: {
        type: DataTypes.INTEGER(10),
        allowNull : false

        // 0 : default
        // 1 : 삭제
       },

       title: {
        type: DataTypes.STRING(40),
        allowNull : false

        // 리뷰 제목
       },

       contents: {
        type: DataTypes.STRING(300),
        allowNull : false

        // 리뷰 내용
       },

       image : {
        type: DataTypes.STRING(100),
        allowNull : true

        // 이미지 첨가
       },

       create_date: {
        type: DataTypes.STRING(20),
        allowNull : false

        // 작성일
       },

       remove_date: {
        type: DataTypes.STRING(20),
        allowNull : true

        // 삭제 일자
       },

      },
      {
        charset: 'utf8',
        collate: 'utf8_general_ci',
        timestamps: false,
        freezeTableName : true
      }
  )};