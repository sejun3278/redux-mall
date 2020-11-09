const path = require('path');
const AWS = require('aws-sdk');
const model = require('./model');

const salt = require(path.join(__dirname, 'config', 'db.json'))
 .salt

const hashing = require(path.join(__dirname, 'config', 'hashing.js'))

AWS.config.loadFromPath(
    path.join(__dirname, 'config', 'awsConfig.json')
);

const moment = require('moment');
require('moment-timezone');
moment.tz.setDefault("Asia/Seoul");

const now_date = moment().format('YYYY-MM-DD HH:mm:ss');

module.exports = {
    needs: () => upload,
    api : {
        test : (req, res) => {
            console.log('컨트롤러 연결 성공!')
            return res.send('컨트롤러 연결 성공!')
        },

        login : (req, res) => {
            let body = req.body;
            const hash_pw = hashing.enc(body.id, body.pw, salt);
            
            const data = { id : body.id, pw : hash_pw };
            model.api.login( data, result => {
                let result_obj = { 'bool' : false, 'data' : false };

                if(result !== null) {
                    result_obj.bool = true;
                    result_obj.data = result.toJSON();

                    const update_data = { id : body.id, date : now_date }
                    model.update.login_date(update_data, () => {
                        
                        return res.send(result_obj)
                    })
                }

                return res.send(result_obj)
            })
        },
    },

    get : {
        allState : (req, res) => {
            let result = {}
            result.server_state = true;
            result.db_state = false;

            model.get.db_data( data => {
                if(data[0].string !== false) {
                    result.db_state = true;
                }
                return res.send( result )
            })
        },
        
        user_info : (req, res) => {
            const body = req.body;

            model.get.user_info(body, result => {
                return res.send(result);
            })
        },

        admin_info : (req, res) => {
            const body = req.body

            model.get.admin_info(body, result => {
                if(result === null) {
                    return res.send(false)
                }
                return res.send(true);
            })
        }
    },

    check : {
        user_id : (req, res) => {
            // 아이디 중복 검색
            const body = req.body;

            model.check.user_id( body, result => {
                if(result !== null) {
                    return res.send(false)
                }

                return res.send(true)
            })
        },

        nickname : (req, res) => {
            // 닉네임 중복 검색
            const body = req.body;

            model.check.nickname( body, result => {
                if(result !== null) {
                    return res.send(false)
                }
                
                return res.send(true)
            })
        }
    },

    add : {
        signup : (req, res) => {
            // 1차 회원가입
            let body = req.body;
            const hash_pw = hashing.enc(body.id, body.pw, salt);

            var result_obj = { 'id' : true, 'nick' : true }

            // 아이디 체크
            model.check.user_id( body, result => {
                if(result !== null) {
                    result_obj.id = false;
                    res.send(result_obj)

                    return

                } else {
                    // 닉네임 체크
                    model.check.nickname( body, result_nick => {
                        if(result_nick !== null) {
                            result_obj.nick = false;
                            res.send(result_obj)

                            return

                        } else {
                            const data = {
                                id : body.id,
                                nick : body.nick,
                                pw : hash_pw,
                                signup_date : now_date
                            }
                            
                            model.add.signup( data, () => {
                                return res.send(true)
                            })
                        }
                    })
                }
            })
        }
    },

    update : {
        user_info : (req, res) => {
            let body = req.body;
            body['nick'] = req.body.nickname;

            console.log(body)
            return res.send(true)
            // model.update.user_info( body, () => {
            //     return res.send(true)
            // })
        }
    }
}