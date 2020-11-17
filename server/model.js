const sequelize = require('./tables').sequelize;
sequelize.sync();

const {
  Connection,
  UserInfo,
  Goods,
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

        user_info : (data, callback) => {
            UserInfo.findOne({
                where : { 
                    [Op.and] : { 'user_id' : data.user_id, 'id' : data.id }
                }
            })
            .then( result => { callback(result) })
            .catch( err => { throw err })
        },

        admin_info : (data, callback) => {
            UserInfo.findOne({
                where : {
                    [Op.and] : {
                        'user_id' : data.user_id,
                        'id' : data.id,
                        'admin' : 'Y'
                    }
                }
            })
            .then( result => { callback(result) })
            .catch( err => { throw err })
        }
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
                host_code : "-",
                host : "-",
                host_detail : "-",
                signup_date : data.signup_date,
                admin : "N"
            })
            .then( result => { callback(result) })
            .catch( err => { throw err })
        },

        goods : (data, now_date, callback) => {
            Goods.create({
                name : data.name,
                first_cat : data.first_cat,
                last_cat : data.last_cat,
                thumbnail : data.thumbnail,
                origin_price : data.origin_price,
                discount_price : data.discount_price,
                result_price : data.result_price,
                stock : data.stock,
                bonus_img : data.bonus_img,
                img_where : data.img_where,
                contents : data.contents,
                date : now_date
            })
            .then( result => { callback(result) })
            .catch( err => { throw err })
        }
    },

    api : {
        login : (data, callback) => {
            UserInfo.findOne({
                where : { 
                    [Op.and] : { 'user_id' : data.id, 'password' : data.pw }
                },
                attributes : ['id', 'user_id', 'nickname', 'host_code', 'host', 'host_detail', 'email', 'phone', 'signup_date']
            })
            .then( result => { callback(result) })
            .catch( err => { throw err })
        }
    },

    update : {
        login_date : (data, callback) => {
            UserInfo.update({ login_date : data.date }, {
                where : { user_id : data.id }
            })
            .then( result => { callback(result) })
            .catch( err => { throw err })
        }
    }
}