const mysql = require('mysql');

const db = mysql.createPool({
    host: 'sejun-redux-blog.cgvoxnqd2sg8.ap-northeast-2.rds.amazonaws.com',

    port: '3306',

    user: 'sejun3278',

    password: 'SEJUN930520',
    
    database: 'my_blog'
});

module.exports = db;