module.exports = (sequelize, DataTypes) => {
    return sequelize.define(
      'chat',
      {
        'user_id' : {
          type: DataTypes.INTEGER(10),
          allowNull : false

          // 유저 아이디
        },

        'ip' : {
            type: DataTypes.STRING(20),
            allowNull : true

          // 비로그인에는 아이피로 조회
        },

        'state' : {
          type: DataTypes.INTEGER(10),
          allowNull : false

          // 0 : 기본
          // 1 : 삭제
        },

        'type' : {
            type: DataTypes.INTEGER(10),
            allowNull : false
  
            // 0 : 유저
            // 1 : 챗봇
        },

        'chat_id' : {
          type: DataTypes.INTEGER(10),
          allowNull : false

          // 질문 ID
        },

        'contents' : {
            type: DataTypes.TEXT(),
            allowNull : false

            // 채팅 내용
        },

        'create_date' : {
            type: DataTypes.STRING(20),
            allowNull : false

            // 생성 날짜
        },

        'remove_date' : {
            type: DataTypes.STRING(20),
            allowNull : true

            // 삭제 날짜
        }
      },
      {
        charset: 'utf8',
        collate: 'utf8_general_ci',
        timestamps: false,
        freezeTableName : true
      }
  )};