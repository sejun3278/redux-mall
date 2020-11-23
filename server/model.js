const { QueryTypes } = require('sequelize');
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
        },

        goods_data : (data, callback) => {
            Goods.findAll({
                where : {
                    name : {
                        [Op.like] : "%" + data.search + "%"
                    },

                    result_price : {
                        [Op.between] : [ data.min, data.max ]
                    },

                    first_cat : {
                        [Op.like] : "%" + data.first + "%"
                    },

                    last_cat : {
                        [Op.like] : "%" + data.last + "%"
                    }
                }, order : [
                    [data.filter_target, data.filter_value]
                ]
            })
            .then( result => { callback(result) })
            .catch( err => { throw err })
        },

        goods_count : (data, callback) => {
            Goods.count({
                where : {
                    name : {
                        [Op.like] : "%" + data.search + "%"
                    },

                    result_price : {
                        [Op.between] : [ data.min, data.max ]
                    },

                    first_cat : {
                        [Op.like] : "%" + data.first + "%"
                    },

                    last_cat : {
                        [Op.like] : "%" + data.last + "%"
                    }
                },
            })
            .then( result => { callback(result) })
            .catch( err => { throw err })
        },

        write_goods_data : (data, callback) => {
            Goods.findOne({
                where : { id : data.id }
            })
            .then( result => { callback(result) })
            .catch( err => { throw err })
        },

        get_user_data : async (data, callback) => {

            let result = {};

            const count_query = await sequelize.query(data.query.count, {
                logging: console.log,
                plain: false,
                raw: false,
                type: QueryTypes.COUNT
            })
            result['cnt'] = count_query[0][0].count;

            const select_query = await sequelize.query(data.query.select, {
                logging: console.log,
                plain: false,
                raw: false,
                type: QueryTypes.SELECT
            })

            result['data'] = select_query;

            callback(result);

            // UserInfo.count({
            //     where : {
            //         user_id : {
            //             [Op.like] : "%" + data.user_id + "%"
            //         },

            //         // nickname : {
            //         //     [Op.like] : "%" + data.nickname + "%"
            //         // },

            //         // name : {
            //         //     [Op.like] : "%" + data.name + "%"
            //         // },
                    
            //         // phone : {
            //         //     [Op.like] : "%" + data.phone + "%"
            //         // },
                    
            //         // email : {
            //         //     [Op.like] : "%" + data.email + "%"
            //         // },
            //     }
            // })
            // .then( result => { callback(result) })
            // .catch( err => { throw err })
        },

        user_data : async (data, callback) => {


            // callback(select_query[0][0].count);


            // UserInfo.findAll({
            //     where: {
            //         user_id : {
            //             [Op.like] : "%" + data.user_id + "%"
            //         },

                    // nickname : {
                    //     [Op.like] : "%" + data.nickname + "%"
                    // },

                    // name : {
                    //     [Op.like] : "%" + data.name + "%"
                    // },
                    
                    // phone : {
                    //     [Op.like] : "%" + data.phone + "%"
                    // },
                    
                    // email : {
                    //     [Op.like] : "%" + data.email + "%"
                    // },
            //     }
            // })
            // .then( result => { callback(result) })
            // .catch( err => { throw err })
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
                name : "-",
                email : "-",
                phone : "-",
                host_code : "-",
                host : "-",
                host_detail : "-",
                signup_date : data.signup_date,
                admin : "N",
                state : 1
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
                date : now_date,
                state : true
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
        },

        goods_state : (data, callback) => {
            Goods.update({ state : data.bool }, {
                where : { id : data.id }
            })
            .then( result => { callback(result) })
            .catch( err => { throw err })
        },

        goods : (data, now_date, callback) => {
            Goods.update({ 
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
                date : now_date,
                state : true
            }, {
                where : { id : data.id }
            })
            .then( result => { callback(result) })
            .catch( err => { throw err })
        }
    },

    delete : {
        goods : (data, callback) => {
            Goods.destroy({
                where : { 'id' : data.id }
            })
            .then( result => { callback(result) })
            .catch( err => { throw err })
        }
    }
}