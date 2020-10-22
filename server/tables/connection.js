module.exports = (sequelize, DataTypes) => {
    return sequelize.define(
      'connection', // 테이블의 이름을 지정합니다.
      {
       string: { // string 컬럼 지정
        type: DataTypes.STRING(50), // 컬럼의 유형 결정
        allowNull : true // null 값 여부
       },
      },
      {
        charset: 'utf8',
        collate: 'utf8_general_ci',
        timestamps: false,
        freezeTableName : true
      }
  )};