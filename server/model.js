const sequelize = require('./tables').sequelize;
sequelize.sync();

const {
  Connection,
  UserInfo,
  Sequelize: { Op }
} = require('./tables');
sequelize.query('SET NAMES utf8;');

module.exports = {
    get : {
        db_data : callback => {
            Connection.findAll()
            .then( result => { callback(result) })
            .catch( err => { throw err })
        },
    },

    check : {
        user_id : (data, callback) => {
            UserInfo.findOne({
                where : { user_id : data.id }
            })
            .then( result => { callback(result) })
            .catch( err => { throw err })
        },

        nickname : (data, callback) => {
            UserInfo.findOne({
                where : { nickname : data.nick }
            })
            .then( result => { callback(result) })
            .catch( err => { throw err })
        },
    },

    add : {
        signup : (data, callback) => {
            UserInfo.create({
                user_id : data.id,
                nickname : data.nick,
                password : data.pw,
                email : "-",
                phone : "-",
                host : "-",
                signup_date : data.signup_date,
                admin : "N"
            })
            .then( result => { callback(result) })
            .catch( err => { throw err })
        },
    },

    api : {
        login : (data, callback) => {
            UserInfo.findOne({
                where : { 
                    [Op.and] : { 'user_id' : data.id, 'password' : data.pw }
                }
            })
            .then( result => { callback(result) })
            .catch( err => { throw err })
        }
    }
}