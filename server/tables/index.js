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
    db.Goods = require('./goods')(sequelize, Sequelize);
    db.Like = require('./like')(sequelize, Sequelize);
    db.Cart = require('./cart')(sequelize, Sequelize);
    db.Order = require('./order')(sequelize, Sequelize);
    db.Coupon = require('./coupon')(sequelize, Sequelize);
    db.PointLog = require('./point_log')(sequelize, Sequelize);
    db.OrderInfo = require('./order_info')(sequelize, Sequelize);

  /* UserInfo 테이블 관계 설정*/
    /* UserInfo 와 Like 의 관계 설정 (M : 1)*/
      db.UserInfo.hasMany(db.Like, {
        foreignKey: 'user_id',
        sourceKey : 'id'
      });

      db.Like.belongsTo(db.UserInfo, {
        foreignKey: 'user_id',
        targetKey : 'user_id'
      });
    /* ///////////////////////////////////// */

    /* UserInfo 와 Cart 의 관계 설정 (M : 1)*/
      db.UserInfo.hasMany(db.Cart, {
        foreignKey: 'user_id',
        sourceKey : 'id'
      });

      db.Cart.belongsTo(db.UserInfo, {
        foreignKey: 'user_id',
        targetKey : 'user_id'
      });
    /* ///////////////////////////////////// */

    /* UserInfo 와 Order 의 관계 설정 (M : 1)*/
      db.UserInfo.hasMany(db.Order, {
        foreignKey: 'user_id',
        sourceKey : 'id'
      });
  
      db.Order.belongsTo(db.UserInfo, {
        foreignKey: 'user_id',
        targetKey : 'user_id'
      });
    /* ///////////////////////////////////// */

    /* UserInfo 와 Coupon 의 관계 설정 (M : 1)*/
      // db.UserInfo.hasMany(db.Coupon, {
      //   foreignKey: 'user_id',
      //   sourceKey : 'user_id'
      // });
    
      // db.Coupon.belongsTo(db.UserInfo, {
      //   foreignKey: 'user_id',
      //   targetKey : 'user_id'
      // });
    /* ///////////////////////////////////// */

    /* UserInfo 와 PointLog 의 관계 설정 (M : 1)*/
      db.UserInfo.hasMany(db.PointLog, {
        foreignKey: 'user_id',
        sourceKey : 'id'
      });

      db.PointLog.belongsTo(db.UserInfo, {
        foreignKey: 'user_id',
        targetKey : 'user_id'
      });
    /* ///////////////////////////////////// */

    /* UserInfo 와 OrderInfo 의 관계 설정 (M : 1)*/
      db.UserInfo.hasMany(db.OrderInfo, {
        foreignKey: 'user_id',
        sourceKey : 'id'
      });

      db.OrderInfo.belongsTo(db.UserInfo, {
        foreignKey: 'user_id',
        targetKey : 'user_id'
      });
    /* ///////////////////////////////////// */


  /* //////////////////////////////////////// */

  /* Goods 테이블 관계 설정*/
    /* Goods 와 Like 의 관계 설정 (M : 1)*/
    db.Goods.hasMany(db.Like, {
      foreignKey: 'goods_id',
      sourceKey : 'id'
    });
    
    db.Like.belongsTo(db.Goods, {
      foreignKey: 'goods_id',
      targetKey : 'id'
    });
    /* ///////////////////////////////////// */

    /* Goods 와 Cart 의 관계 설정 (M : 1)*/
    db.Goods.hasMany(db.Cart, {
      foreignKey: 'goods_id',
      sourceKey : 'id'
    });
    
    db.Cart.belongsTo(db.Goods, {
      foreignKey: 'goods_id',
      targetKey : 'id'
    });
    /* ///////////////////////////////////// */

  /* //////////////////////////////////////// */


  /* Order 테이블 관계 설정*/
    /* Order 와 OrderInfo 의 관계 설정 (M : 1)*/
    db.Order.hasMany(db.OrderInfo, {
      foreignKey: 'order_id',
      sourceKey : 'id'
    });
    
    db.OrderInfo.belongsTo(db.Order, {
      foreignKey: 'order_id',
      targetKey : 'id'
    });
    /* ///////////////////////////////////// */

  /* //////////////////////////////////////// */


db.secret = 'gdf80fsadf8098qwej123l;1k9809sf8daf90sdajkl1j23';
module.exports = db;