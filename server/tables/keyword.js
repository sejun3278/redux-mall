module.exports = (sequelize, DataTypes) => {
    return sequelize.define(
      'keyword',
      {
        'keyword' : {
          type: DataTypes.STRING(100),
          allowNull : false

          // 채팅 키워드
        },

        'result' : {
            type: DataTypes.TEXT(),
            allowNull : true

          // 채팅 키워드 결과
        },
      },
      {
        charset: 'utf8',
        collate: 'utf8_general_ci',
        timestamps: false,
        freezeTableName : true
      }
  )};