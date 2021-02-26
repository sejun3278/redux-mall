module.exports = (sequelize, DataTypes) => {
    return sequelize.define(
      'feedback',
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

          // 0 : Default
          // 1 : 확인 완료
          // 2 : 완료
          // 3 : 삭제
        },

        'page' : {
          type: DataTypes.STRING(40),
          allowNull : false

          // 페이지 이름 & 주소  
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

        'confirm_date' : {
            type: DataTypes.STRING(20),
            allowNull : true

            // 확인 날짜
        },

        'complate_date' : {
            type: DataTypes.STRING(20),
            allowNull : true

            // 완료 날짜
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