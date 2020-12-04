const path = require('path');
const AWS = require('aws-sdk');
const fs = require('fs');

const model = require('./model');

const salt = require(path.join(__dirname, 'config', 'db.json'))
 .salt

const S3_info = require(path.join(__dirname, 'config', 's3_upload'))
const hashing = require(path.join(__dirname, 'config', 'hashing.js'))
const mailer = require(path.join(__dirname, 'config', 'nodemailer.js'))
// 메일 전송자 환경 설정
const mailer_poster = mailer.mailer_poster();

AWS.config.loadFromPath(
    path.join(__dirname, 'config', 'awsConfig.json')
);
AWS.config.region = 'ap-northeast-2';
const S3 = new AWS.S3(require(path.join(__dirname, 'config', 'awsConfig.json')));

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

        query : (req, res) => {
            const body = req.body;

            let qry = "";
            if(!body.qry) {
                // 타입 설정 (// SELECT, UPDATE, DELETE, INSERT)
                qry += (body.type + " ");

                // 검색 컬럼 설정 // 없으면 *
                let columns = "* "
                if(body.columns) {
                    columns = "";
                    body.columns.forEach( (el, key) => {
                        columns += "`" + el + "`";

                        if(body.columns.length !== (key + 1)) {
                            columns += ", ";
                        }
                    })
                }
                qry += columns

                // SELECT 타입
                if(body.type === 'SELECT') {
                    qry += ' FROM `' + body.table + '` WHERE ';
                }

                let where = "";
                body.where.forEach( (el, cnt) => {
                    let result_entries = Object.entries(el);

                    for (let [key, value] of result_entries) {
                        // where += key + " = '" + value + "'"
                        if(key === 'result_price') {
                            where += "result_price >= " + value[0] + " AND ";
                            where += "result_price <= " + value[1];

                        } else {
                            where += key + " " + body.option[key] + " '" + value + "' ";
                        }

                        if(body.where.length !== (cnt + 1)) {
                            where += "AND ";
                        }
                    }
                })
                qry += where;

            } else {
                qry = body.qry;
            }

            // let qry = "SELECT * FROM `goods` WHERE ";

            model.api.query(qry, body.type, result => {
                if(result) {
                    return res.send(result);
                }
                return res.send(false);
            })
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

        send_mail : (req, res) => {
            const body = req.body;

            const mailOption = mailer.mailOpt(body.email, body.title, body.contents);
            mailer.sendMail(mailer_poster, mailOption)

            return res.send(true)
        },

        save_file : (req, res) => {
            let result = { 'result' : false, 'ment' : "" };
            const files = req.files.files;

            const dir = path.normalize(__dirname + '/..');
            const file_type = files.mimetype.split('/');

            const date = moment().format('YYYY-MM-DD,HH_mm_ss');
            const file = date + '_' + files.md5 + '.' + file_type[1];

            const fileUpload = req.files.files;
            fileUpload.mv(
                `${dir}/upload/goods/origin/${file}`,

                function(err) {
                    if(err) { 
                        result['result'] = false;
                        result['ment'] = err;

                        console.log(err)
                        return res.send(result);
                    }
                }
            )

            result['result'] = true;
            result['ment'] = file;

            return res.send(result);
        },

        upload_file : async (req, res) => {
            const body = req.body;
            let result = { 'result' : false, 'ment' : '' }

            // 사이즈 조절하기
            const filename = body.filename;
            // const file_arr = filename.split('.');
            // const file_type = file_arr[file_arr.length - 1];

            // const file_path = path.normalize(__dirname + '/../upload/' + body.origin_path); // 원본 파일이 있는 경로
            // const thumb_dir = path.normalize(__dirname + '/../upload/' + body.thumb_path) // 변환된 썸네일을 저장할 경로

            // const target_file = file_path + '/' + filename;
            // const thumb_name = filename + '_thumb.' + file_type

            const params_files = path.normalize(__dirname + '/..') + '/upload/goods/origin/' + filename
            const bucket_params = S3_info.create_bucket(params_files, filename);

            const _s3_upload = async () => {
                await S3.upload(bucket_params, function(err, data) {
    
                    if(err) {
                        result['ment'] = err;
    
                    } else {
                        result['result'] = true;
                        result['ment'] = data.Location;
                    }
                    
                    return res.send(result);
                })
            }

            return await _s3_upload();
        },

        s3_upload : (req, res) => {
            const body = req.body;
            let result = { 'result' : false, 'ment' : '' }

            // S3 에 업로드하기
            
        }
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
        },

        admin_check : (req, res) => {
            console.log(req.cookie)
            // console.log(req.)

            return res.send(false)
        },

        goods_data : (req, res) => {
            const body = req.body;
            
            let obj = { 'result' : false, 'data' : null, 'cnt' : 0 };

            model.get.goods_count( body, cnt => {
                // goods 총 갯수 가져오기
                if(cnt < 0) {
                    // 하나도 없을 경우 false 리턴
                    return res.send(obj);

                } else {
                    obj['cnt'] = cnt;

                    model.get.goods_data( body, result => {
                        if(result) {
                            obj['result'] = true;
                            obj['data'] = result;
                        }
        
                    return res.send(obj);
                    })
                }
            })
        },

        write_goods_data : (req, res) => {
            const body = req.body;

            model.get.write_goods_data(body, result => {
                return res.send(result)
            })
        },

        user_data : (req, res) => {
            const body = req.body;
            const result_obj = { cnt : 0, data : null, bool : false }

            model.get.get_user_data(body, data => {

                if(data.cnt <= 0) {
                    return res.send(result_obj);

                } else {
                    result_obj['cnt'] = data.cnt;
                    result_obj['data'] = data.data;

                    return res.send(result_obj);
                }
            })
        },
    },

    check : {
        user_data : (req, res) => {
            // 회원 정보 중복 체크
            const body = req.body;

            let columns = '*';
            if(body[0]['columns']) {
                columns = "";
                for(let key in body[0]['columns']) {
                    columns += body[0]['columns'][key];

                    if((body[0]['columns'].length - 1) > 0 && Number(key) < (body[0]['columns'].length - 1)) {
                        columns += ', ';
                    }
                }
            }

            let qry = "SELECT " + columns + " FROM `userInfo` WHERE ";
            body.forEach( (el, key2) => {
                let result_entries = Object.entries(el);

                for (let [key, value] of result_entries) {
                    if(key === 'columns') {
                        return;
                    }

                    if(key === 'password') {
                        const hash_pw = hashing.enc(value[1], value[0], salt);
                        qry += 'password = "' + hash_pw + '" AND user_id = "' + value[1] + '"';

                        if(value[2]) {
                            qry += ' AND id =' + value[2];
                        }
                        return;
                    }

                    qry += key + ' = "' + value + '" ';

                    if(body.length > 0 && key2 !== (body.length - 1)) {
                        qry += 'AND ';
                    }
                }
            })

            let result_obj = { 'result' : false, 'data' : null }
            model.check.user_data(qry, result => {
                if(body[0]['columns']) {
                    // columns 이 있는 경우
                    result_obj['data'] = result;
                    if(result.length > 0) {
                        result_obj['result'] = true
                    }
                    return res.send(result_obj);
                }

                if(result.length === 0) {
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
        },
    },

    add : {
        signup : (req, res) => {
            // 1차 회원가입
            const body = req.body;
            const hash_pw = hashing.enc(body.id, body.pw, salt);

            const data = {
                id : body.id,
                nick : body.nick,
                name : body.name,
                email : body.email,
                pw : hash_pw,
                signup_date : now_date
            }
            
            model.add.signup( data, () => {
                return res.send(true)
            })
        },

        admin_check : (req, res) => {
            // 관리자 쿠키 추가
            res.cookie('admin', true, { maxAge: 3600000, httpOnly: true });

            return res.send(true)
        },

        goods : (req, res) => {
            const body = req.body;
            
            model.add.goods( body, now_date, result => {
                if(!result) {
                    return res.send(false);
                }
                return res.send(true);
            })
        }
    },

    update : {
        user_info : (req, res) => {
            const body = req.body;

            let cnt = 0;
            let max = Number(body.max);
            let update_qry = "UPDATE `userInfo` SET ";

            for(let key in body) {
                if(key !== 'id' && key!== 'user_id' && key !== 'max') {
                    if(key !== 'modify_date') {
                        if(key === 'password') {
                            update_qry += "`password`= '" + hashing.enc(body.user_id, body.password, salt) + "'";

                        } else {
                            update_qry += "`" + key + "`= '" + body[key] + "'";
                        }

                    } else if(key === 'modify_date') {
                        update_qry += "`modify_date`= '" + now_date + "'";

                    }
                    cnt += 1;

                    if(cnt < max) {
                        update_qry += ', ';
                    }
                }
            }

            let where_str = ' WHERE '
            if(body.id) {
                update_qry += ' WHERE id = ' + body.id
                where_str = ' AND '
            }

            model.update.user_info( update_qry, () => {
                return res.send(true)
            })
        },

        goods_state : (req, res) => {
            const body = req.body;

            model.update.goods_state( body, () => {
                return res.send(true)
            })
        },

        goods : (req, res) => {
            const body = req.body;

            model.update.goods( body, now_date, () => {
                return res.send(true)
            })
            return res.send(true)
        }
    },

    remove : {
        cookie : (req, res) => {
            res.clearCookie(req.body.cookie);

            return res.send(true)
        }
    },

    delete : {
        goods : (req, res) => {
            const body = req.body;

            model.delete.goods( body, result => {
                return res.send(true)
            })
        }
    }
}