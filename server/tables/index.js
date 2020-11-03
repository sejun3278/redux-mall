'use strict';

const Sequelize = require('sequelize');
const path = require('path');

const env = process.env.NODE_ENV || 'development';
const config = require(path.join(__dirname, '..', 'config', 'db.json'))[
    env
  ];
const db = {};

let sequelize = new Sequelize(
    'redux_mall',

    'sejun3278',

    'SEJUN930520',
    {
      host: "sejun-redux-blog.cgvoxnqd2sg8.ap-northeast-2.rds.amazonaws.com",

      dialect: "mysql",
      
      port: "3306",

      dialectOptions: { charset: "utf8mb4", dateStrings: true, typeCast: true },

      timezone: "+09:00",

      pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000,
      },
      
      define: {
        charset: 'utf8',
        collate: 'utf8_general_ci',
        freezeTableName: true,
        timestamps: false,
      }
    }
  );
  
    db.sequelize = sequelize;
    db.Sequelize = Sequelize;

    db.sequelize
    .authenticate()
    .then(() => {
        console.log('Success - Sequelize 연동 완료');
    })
    .catch(err => {
        console.log('Error - Sequelize 연동 실패 : ', err);
    });

    db.Connection = require('./connection')(sequelize, Sequelize);
    db.UserInfo = require('./userInfo')(sequelize, Sequelize);


db.secret = 'gdf80fsadf8098qwej123l;1k9809sf8daf90sdajkl1j23';
module.exports = db;