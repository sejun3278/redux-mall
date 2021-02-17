const path = require('path');
const AWS = require('aws-sdk');
// const fs = require('fs');
const sharp = require('sharp');

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

const createError = require('createerror');

const MyError = createError({
    name: 'MyError',
    // Used when no message is handed to the constructor:
    message: '/////// 에러 발생　:　'
});


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

                if(body.type === 'SELECT') {
                    // SELECT 타입
                    if(body.union === true) {
                        if(!body.count) {
                            qry = '(' + qry;
                        }
                    }

                    // 검색 컬럼 설정 // 없으면 *
                    let columns = ""
                    if(body.columns) {
                        body.columns.forEach( (el, key) => {
                            if(el.table) {
                                columns += "`" + el.table + "`." + el.columns;
                            } else {
                                columns += "`" + el + "`";
                            }

                            if(body.columns.length !== (key + 1)) {
                                columns += ", ";
                            }
                        })
                        
                    } else if(body.count === true) { 
                        columns = "count(*)";
                    
                    } else if(body.on === true) {
                        // on 사용
                        body.on_arr.forEach( (el) => {
                            columns += "`" + el.name + "`.";

                            if(typeof el.value === 'object') {
                                el.value.forEach( (cu) => {
                                    columns += cu.name + " as ";
                                    columns += cu.as;

                                    if(!cu['last']) {
                                        columns += ", ";
                                    }
                                })

                            } else {
                                columns += el.value + ", ";
                            }
                        })
                    
                    } else {
                        columns = "`" + body.table + "`.*";
                    }
                    qry += columns

                    if(body['join_where']) {
                        if(body['join_where'] !== '*') {
                            body['join_where'].forEach( (el) => {
                                if(el.opt === 'count') {
                                     qry += ', count(*) as count'

                                } else {
                                    let table = el.table ? el.table : body.join_table

                                    qry += ', `' + table + '`.' + el.columns + ' AS "' + el.as + '"'; 
                                }
                            })

                        } else if(body['join_where'] === '*') {
                            qry += ', `' + body.join_table + '`.*';
                        }
                    }
                    
                    qry += ' FROM `' + body.table + '`';
                    if(body.on === true) {
                        qry += ' ' + body.on_arr[0].name;
                    }

                    if(body.join === true) {
                        let join_name = ' INNER JOIN `';

                        if(body.join_type) {
                            join_name = ' ' + body.join_type + ' `'
                        }

                        if(!body.on) {
                            qry += join_name + body.join_table + '`'; 

                        } else {

                            if(!body.special_opt) {
                                join_name = ' LEFT JOIN `'
                            }

                            qry += join_name + body.table + '` ' + body.on_arr[1].name;
                        }

                        qry += ' ON ';
                        
                        body.join_arr.forEach( (el) => {
                            const join_table = !body.on ? body.join_table : body.on_arr[0].name;
                            const table = !body.on ? body.table : body.on_arr[1].name;

                            qry += '`' + join_table + '`.' + el.key1 + ' = ';
                            qry += '`' + table + '`.' + el.key2;
                        })
                    }

                    if(body.add_table) {
                        body.add_table.forEach( (el) => {
                            let add_table_qry = "";

                            add_table_qry += " " + el.type + " `" + el.table + "` ON ";
                            add_table_qry += "`" + el['key1']['table'] + "`." + el['key1']['value'] + ' = ';
                            add_table_qry += "`" + el['key2']['table'] + "`." + el['key2']['value'];

                            qry += add_table_qry;
                        })
                    }

                    if(body.where && body.where.length > 0) {
                        // qry += ' WHERE ';
                        let where = ' WHERE ';

                        body.where.forEach( (el, cnt) => {
                            // let result_entries = Object.entries(el);
                            // for (let [key, value] of result_entries) {
                            //     // where += key + " = '" + value + "'"
                            if(body.on === true) {
                                el.table = body.on_arr[0].name;
                            }
                            let cover_where = '';

                            if(cnt > 0 && body.where.length > (cnt)) {
                                cover_where += "AND ";
                            }

                                if(el.key === 'result_price') {
                                    cover_where += '`' + el.table + "`.result_price >= " + el.value[0] + " AND ";
                                    cover_where += '`' + el.table + "`.result_price <= " + el.value[1] + ' ';
        
                                } else if(el.key === 'final_price') { 
                                    cover_where += '`' + el.table + "`.final_price >= " + el.value[0] + " AND ";
                                    cover_where += '`' + el.table + "`.final_price <= " + el.value[1] + ' ';

                                } else if(el.key.includes('date')) {
                                    if(el.value === null) {
                                        cover_where += '`' + el.table + "`." + el.key + " " + body.option[el.key] + " '" + now_date + "' ";

                                    } else {
                                        if(el.option) {
                                            if(el.option === 'BETWEEN') {
                                                cover_where += '`' + el.table + "`." + el.key + " " + body.option[el.key] + " '" + el.value + "' ";
                                                cover_where += 'AND "' + el.between_value + '" ';
                                            }
                                        }
                                    }

                                } else {
                                    if(el.value !== null) {
                                        cover_where += '`' + el.table + "`." + el.key + " " + body.option[el.key] + " '" + el.value + "' ";

                                    } else {
                                        cover_where += '`' + el.table + "`." + el.key + " " + body.option[el.key] + " ";
                                    }
                                }
                            // }

                            if(body.count_remove_where) {
                                if(!body.count_remove_where.includes(el.key)) {
                                    where += cover_where;
                                }

                            } else {
                                where += cover_where;
                            }
                        })

                        qry += where;
                    }

                    let order = ' ORDER BY ';
                    if(!body['count']) {
                        if(body['order']) {
                            body['order'].forEach( (el, key) => {

                                if(body.on === true) {
                                    el.table = body.on_arr[0].name;
                                }

                                order += "`" + el.table + "`." + el.key + " " + el.value
                                if(key < body['order_limit']) {
                                    order += ', ';
                                }

                                if(el.key === 'limit') {
                                    order = " limit " + el.value[0];
                                    
                                    if(el.value[1]) {
                                        order += ', ' + el.value[1];
                                    }
                                }
                                qry += order
                            })
                        } else {
                            order = '';
                        }
                    }

                    if(body.re_qry === true) {
                        const from_where = body.re_qry_count === true ? 'count(*)' : '*'
                        
                        qry = 'SELECT ' + from_where + ' FROM (' + qry + ') AS re_qry WHERE ';
                        
                        if(body.re_qry_where) {
                            body.re_qry_where.forEach( (el) => {
                                qry += el.key + " " + el.value;
                            })
                        }
                    }

                    if(body.union === true) {
                        if(!body.count) {
                            qry += ') UNION SELECT ';
                            qry += '`' + body.union_table + '`.* FROM `' + body.union_table + '`';

                            if(body.union_where) {
                                qry += ' WHERE '

                                body.union_where.forEach( (el, cnt) => {
                                    if(cnt > 0 && body.union_where.length > cnt) {
                                        qry += ' AND '
                                    }

                                    qry += '`' + body.union_table + '`.' + el.key;
                                    if(el.key === 'result_price') {
                                        qry += ' >= ' + el.value[0] + ' AND ';
                                        qry += '`' + body.union_table + '`.result_price <= ' + el.value[1];

                                    } else {
                                        qry += ' ' + el.option + ' "' + el.value + '" '
                                    }
                                })
                            }

                            if(order !== '') {
                                qry += order;
                            }
                        }
                    }

                } else if(body.type === 'INSERT') {
                    // INSERT 타입
                    qry += 'INTO `' + body.table + '` (';
                    
                    let columns = "";
                    let value = "";
                    body.columns.forEach( (el, key) => {
                        columns += '`' + el.key + '`';

                        if(el.key.includes('date')) {
                            if(el.value === null) {
                                const cover_now_date = moment().format('YYYY-MM-DD HH:mm:ss');

                                value += "'" + cover_now_date + "'"; 

                            } else {
                                const add_date = moment().add(el.value, "d").format('YYYY-MM-DD HH:mm:ss');

                                value += "'" + add_date + "'"; 
                            }

                        } else {
                            value += "'" + el.value + "'"; 
                        }

                        if(body.columns.length !== (key + 1)) {
                            columns += ', ';
                            value += ', ';

                        } else {
                            columns += ') ';
                            value += ')';
                        }
                    })
                    qry += columns;
                    qry += "VALUES (";

                    qry += value;

                } else if(body.type === 'DELETE') {
                    // DELETE 타입
                    qry += 'FROM `' + body.table + '` WHERE ';

                    let columns = '';
                    body.columns.forEach( (el, key) => {
                        columns += "`" + el.key + "` = " + el.value;

                        if((body.columns.length - 1) !== key) {
                            columns += ' AND ';
                        }
                    })
                    qry += columns;

                } else if(body.type === 'UPDATE') {
                    // UPDATE 타입
                    qry += "`" + body.table + "` SET ";

                    let columns = "";
                    body.columns.forEach( (el, key) => {

                        if(el.key.includes('date')) {
                            columns += "`" + el.key + "` = '" + now_date + "'";

                        } else {
                            columns += "`" + el.key + "` = " 
                            
                            if(el.option) {
                                columns += "`" + el.key + "` " + el.option + ' ' + el.value + ' '

                            } else {
                                columns += "'" + el.value + "'";
                            }
                        }

                        if((body.columns.length - 1) !== key) {
                            columns += ', ';
                        }
                    })
                    qry += columns;

                    qry += " WHERE ";
                    let where = "";
                    body.where.forEach( (el, key) => {
                        where += "`" + el.key + "` = '" + el.value + "'";

                        if(key !== body.where_limit) {
                            where += ' AND ';
                        }
                    })
                    qry += where;
                }

            } else {
                qry = body.qry;
            }

            model.api.query(qry, body.type, result => {
                if(result) {
                    return res.send(result);
                }
                
                // throw new createError.BadRequest();
                return res.send(false);
            })
        },

        login : (req, res) => {
            let body = req.body;
            const hash_pw = hashing.enc(body.user_id, body.pw, salt);
            
            const data = { user_id : body.user_id, pw : hash_pw };
            model.api.login( data, result => {
                let result_obj = { 'bool' : false, 'data' : false };

                if(result !== null) {
                    result_obj.bool = true;
                    result_obj.data = result.toJSON();

                    const update_data = { id : result.dataValues.id, date : now_date }

                    model.update.login_date(update_data, () => {  
                        // req.session.login = { 'id' : result.dataValues.id };

                        var expiryDate = new Date( Date.now() + 60 * 60 * 1000 * 24 * 1 ); // 24 hour 1일
                        // res.cookie('login', result.dataValues.user_id, { expires: expiryDate, httpOnly: true, signed : true });

                        // const cookie = JSON.stringify({ 
                        //     'id' : result.dataValues.id,
                        //     'user_id' : result.dataValues.user_id
                        // })

                        // res.cookie('login', cookie, )

                        // result_obj.session = req.session.login
                        return res.send(result_obj)
                    })
                    
                } else {
                    return res.send(result_obj)
                }
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

            console.log(body)
            // const file_arr = filename.split('.');
            // const file_type = file_arr[file_arr.length - 1];

            // const file_path = path.normalize(__dirname + '/../upload/' + body.origin_path); // 원본 파일이 있는 경로
            // const thumb_dir = path.normalize(__dirname + '/../upload/' + body.thumb_path) // 변환된 썸네일을 저장할 경로

            // const target_file = file_path + '/' + filename;
            // const thumb_name = filename + '_thumb.' + file_type

            const _s3_upload = async (bucket) => {
                await S3.upload(bucket, function(err, data) {
    
                    if(err) {
                        result['ment'] = err;
    
                    } else {
                        result['result'] = true;
                        result['ment'] = data.Location;
                    }
                    
                    return res.send(result);
                })
            }

            let params_files = path.normalize(__dirname + '/..') + '/upload/goods/origin/' + filename
            let bucket_params = S3_info.create_bucket(params_files, filename);

            if(body.thumb === true) {
                sharp(params_files).resize(200, 200).toFile(path.normalize(__dirname + '/..') + '/upload/goods/thumb/' + filename, async (err, thumb) => {
                    if(err) {
                        result['result'] = false;
                        result['ment'] = err;

                        return res.send(result);

                    } else if(thumb) {
                        params_files = path.normalize(__dirname + '/..') + '/upload/goods/thumb/' + filename;
                        bucket_params = S3_info.create_bucket(params_files, filename);

                        return await _s3_upload(bucket_params);
                    }
                })

            } else {
                return await _s3_upload(bucket_params);
            }
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

        cookie_data : async (req, res) => {
            const body = req.body;
            const api_cookie = async (type) => {
                if(type === 'get') {
                    let data = null;
                    if(req.signedCookies[body.key]) {
                        data = req.signedCookies[body.key];
                    }
    
                    return res.send(data);
    
                } else if(type === 'remove') {
                    if(req.signedCookies[body.key]) {
                        res.clearCookie(body.key);
                    }
                    return res.send(true)
    
                } else if(type === 'add') {
                    // req.session[body.key] = body.value;
    
                    let time = 60 * 60 * 1000 * 24 * 1;
                    if(body.opt.hour) {
                        time = body.opt.time;
                    }
    
                    const expiryDate = new Date( Date.now() + time ); // 24 hour 1일
                    res.cookie(body.key, body.value, { expires: expiryDate, httpOnly: true, signed : true });
    
                    return res.send(true)
                }
            }
            
            await api_cookie(body.type);
            // return res.send(true);
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

        like : (req, res) => {
            const body = req.body;

            model.get.like(body, result => {
                if(result) {
                    return res.send(result);
                }
                return res.send(false);
            })
        }
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
            return res.send(true);
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
        },

        like : (req, res) => {
            const body = req.body;

            model.add.like(body, now_date, result => {
                if(result) {
                    return res.send(result.dataValues);
                }
                return res.send(false);
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