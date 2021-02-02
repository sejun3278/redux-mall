module.exports = (sequelize, DataTypes) => {
    return sequelize.define(
      'q&a',
      {
       user_id: {
        type: DataTypes.INTEGER(10),
        allowNull : false
       },

       goods_id: {
        type: DataTypes.INTEGER(10),
        allowNull : false
       },

       question_id: {
        type: DataTypes.INTEGER(10),
        allowNull : true

        // 답변일 때만 기입됨
        // 질문글의 id 값이 들어감
       },

       type: {
        type: DataTypes.INTEGER(10),
        allowNull : false

        // 0 : 문의
        // 1 : 답변
       },

       state: {
        type: DataTypes.INTEGER(10),
        allowNull : false

        // 0 : default
        // 1 : 답변 완료
        // 2 : 삭제
       },

       secret_state: {
        type: DataTypes.INTEGER(10),
        allowNull : false

        // 0 : default
        // 1 : 비밀글 (관리자만 볼 수 있음)
       },

       title: {
        type: DataTypes.STRING(40),
        allowNull : false

        // 글 제목
       },

       contents: {
        type: DataTypes.STRING(300),
        allowNull : false

        // 글 내용
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