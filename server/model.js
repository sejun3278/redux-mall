const { QueryTypes } = require('sequelize');
const sequelize = require('./tables').sequelize;
sequelize.sync();

const {
  Connection,
  UserInfo,
  Goods,
  Like,
  Cart,
  Sequelize: { Op },
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
                },
                attributes : ['id', 'user_id', 'nickname', 'name', 'host_code', 'host', 'host_detail', 'email', 'phone', 'point', 'use_point', 'acc_point', 'signup_date', 'modify_date']
            })
            .then( result => { callback(result) })
            .catch( err => { throw new createError.BadRequest(); })
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

            if(data.query.count) {
                const count_query = await sequelize.query(data.query.count, {
                    logging: console.log,
                    plain: false,
                    raw: false,
                    type: QueryTypes.COUNT
                })
                result['cnt'] = count_query[0][0].count;
            }

            const select_query = await sequelize.query(data.query.select, {
                logging: console.log,
                plain: false,
                raw: false,
                type: QueryTypes.SELECT
            })

            result['data'] = select_query;

            callback(result);
        },

        like : (data, callback) => {
            Like.findAll({
                where : { user_id : data.user_id, goods_id : data.goods_id }
            })
            .then( result => { callback(result) })
            .catch( err => { throw err })
        }
    },

    check : {
        user_data : async (qry, callback) => {

            const get_user_data = await sequelize.query(qry, {
                logging: console.log,
                plain: false,
                raw: false,
                type: QueryTypes.SELECT
            })

            callback(get_user_data);
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
                name : data.name,
                email : data.email,
                password : data.pw,
                signup_date : data.signup_date,
                admin : "N",
                state : 1,
                point : 0,
                use_point : 0,
                acc_point : 0
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
        },

        like : (data, now_date, callback) => {
            Like.create({
                user_id : data.user_id,
                goods_id : data.goods_id,
                state : 1,
                create_date : now_date,
                modify_date : now_date
            })
            .then( result => { callback(result) })
            .catch( err => { throw err })
        }
    },

    api : {
        login : (data, callback) => {
            UserInfo.findOne({
                where : { 
                    [Op.and] : { 'user_id' : data.user_id, 'password' : data.pw }
                },
                attributes : ['id', 'user_id', 'nickname', 'name', 'host_code', 'host', 'host_detail', 'email', 'phone', 'signup_date', 'modify_date', 'point', 'use_point', 'acc_point' ]
            })
            .then( result => { callback(result) })
            .catch( err => { throw err })
        },

        query : async (query, types, callback) => {
            const set_query = await sequelize.query(query, {
                logging: console.log,
                plain: false,
                raw: false,
                type: QueryTypes.types
            })

            if(set_query) {
                callback(set_query);

            } else {
                throw new createError.BadRequest();
            }
        }
    },

    update : {
        login_date : (data, callback) => {
            UserInfo.update({ login_date : data.date }, {
                where : { id : data.id }
            })
            .then( result => { callback(result) })
            .catch( err => { throw err })
        },

        user_info : async (qry, callback) => {
            const update_user_info = await sequelize.query(qry, {
                logging: console.log,
                plain: false,
                raw: false,
                type: QueryTypes.UPDATE
            })

            callback(update_user_info);
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