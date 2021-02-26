import React, { Component } from 'react';
import axios from 'axios';
import queryString from 'query-string';

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import * as goodsAction from '../Store/modules/goods';
import * as configAction from '../Store/modules/config';
import * as signupAction from '../Store/modules/signup';

import '../css/goods.css';
import Paging from './config/paging';

import { Loading } from './index';
import $ from 'jquery';
import icon from '../source/img/icon.json';
import URL from '../config/url';

let fade_alert;
let qna_remove = false;

let review_remove = false;
class Goods extends Component {

    async componentDidMount () {
        const { goodsAction, location } = this.props;

        const qry = queryString.parse(location.search);
        const goods_num = qry.goods_num;

        const user_info = JSON.parse(this.props.user_info)
        if(qry.filter_1 || qry.filter_3) {
            if(!user_info || !user_info.id) {
                return window.location.replace('/goods?goods_num=' + qry.goods_num);
            }

        } else if(qry.filter_4 && qry.filter_5) {
            return window.location.replace('/goods?goods_num=' + qry.goods_num);
        }

        if(!qry.goods_num) {
            alert('올바르지 않는 경로입니다.');
            return window.location.replace('/');
        }

        // $('html').css({ 'height' : '3000px' })
        // this._setScrollSize();
        window.addEventListener("scroll", this._setScrollSize);
        // window.addEventListener("resize", this._setScreenWitdhEvent); // 화면 가로 크기

        // 상품 정보 저장하기
        const get_goods_data = await this._getGoodsData(goods_num);

        // 라이크 정보 저장하기
        const get_like_data = await this._getLikeInfo(goods_num);

        if(get_goods_data && get_like_data) {
            goodsAction.set_loading();
        }
    }

    componentWillUnmount() {
        window.removeEventListener("scroll", this._setScrollSize);
        // window.removeEventListener("resize", this._setScreenWitdhEvent);
    }

    componentDidUpdate() {
        const { location, goods_loading, loading, _moveScrollbar, configAction, first_move } = this.props;
        const qry = queryString.parse(location.search);

        let move_height;
        if(first_move === true) {
            if(goods_loading && loading) {

                if(qry.qna_page && qry.review_page) {
                    const target = sessionStorage.getItem('page_move');
                    move_height = $('#goods_other_' + target).offset().top;

                } else {
                    if(qry.qna_page) {
                        move_height = $('#goods_other_qna').offset().top;
    
                    } else if(qry.review_page) {
                        move_height = $('#goods_other_review').offset().top;
                    }
                }

                _moveScrollbar('html', 'y', move_height);
                configAction.toggle_first_move();
            }
        }
    }

    // 스크롤 반응형
    _setScrollSize = () => {
        const height_size = window.scrollY;
        // const width_size = window.screen.width;

        const { goods_loading, goodsAction } = this.props;

        if(goods_loading) {
            const qna_target = $('#goods_main_qna_title').offset().top - 80;
            const review_target = $('#goods_main_review_title').offset().top - 80;
            const delivery_target = $('#goods_main_delivery_title').offset().top - 80;

            let start = 1000;
            if($('#goods_main_contents_div')[0] !== undefined) {
                start = $('#goods_main_contents_div').offset().top;
            }

            if(height_size >= start) {
                // fixed 적용하기
                $('#goods_main_other_div').addClass('fixed_goods_other');
                // $('#goods_fixed_price_div').removeClass('display_none');
                $('#goods_fixed_toggle_div').removeClass('display_none')

            } else if(height_size < start) {
                $('#goods_main_other_div').removeClass('fixed_goods_other');
                $('#goods_main_grid_div div').removeClass('select_fixed_goods_info');
                $('#goods_fixed_price_div').addClass('display_none');
                $('#goods_fixed_toggle_div').addClass('display_none');

                goodsAction.toggle_fixed({ 'bool' : false })
            }
            
            if(height_size >= start && height_size < qna_target) {
                $('#goods_main_grid_div div').removeClass('select_fixed_goods_info');
                $('#first_goods_info').addClass('select_fixed_goods_info')

            } else if(height_size >= qna_target && height_size < review_target) {
                $('#goods_main_grid_div div').removeClass('select_fixed_goods_info');
                $('#second_goods_info').addClass('select_fixed_goods_info')

            } else if(height_size >= review_target && height_size < delivery_target) {
                $('#goods_main_grid_div div').removeClass('select_fixed_goods_info');
                $('#third_goods_info').addClass('select_fixed_goods_info')
            
            } else if(height_size >= delivery_target) {
                $('#goods_main_grid_div div').removeClass('select_fixed_goods_info');
                $('#forth_goods_info').addClass('select_fixed_goods_info')
            }
        }
    }

    // 스크롤 이동
    _moveScroll = (target) => {
        const { _moveScrollbar } = this.props;
        const origin_height = $('#' + target).offset().top;

        // const target_arr = ['goods_main_qna_title', 'goods_main_review_title', 'goods_main_delivery_title']
        const height = origin_height + 20;

        return _moveScrollbar('html', 'y', height)
    }

    // 상품 정보 가져오기
    _getGoodsData = async (goods_num) => {
        const { goodsAction } = this.props;

        if(!goods_num) {
            alert('상품 정보를 조회할 수 없습니다.');
            return window.location.replace('/')
        }

        const obj = { 'type' : "SELECT", 'table' : "goods", 'comment' : "상품 정보 가져오기" };
        obj['option'] = {};
        obj['option']['id'] = '=';

        obj['where'] = [];
        obj['where'][0] = { 'table' : 'goods', 'key' : 'id', 'value' : goods_num };

        const get_data = await axios(URL + '/api/query', {
            method : 'POST',
            headers: new Headers(),
            data : obj
        })

        const goods_data = get_data.data[0][0];

        if(goods_data === undefined) {
            // state 가 0 일 경우 비활성화 상품
            alert('상품 정보를 조회할 수 없습니다.');
            return window.location.replace('/')

        } else if(goods_data.state === 0) {
            // if(user_info === false) {
                alert('상품 정보를 조회할 수 없습니다.');
                return window.location.replace('/')
            // }
        }

        goodsAction.save_goods_data({ 'obj' : JSON.stringify(goods_data) })

        // 상품 문의 정보 저장하기
        await this._saveQandAData(goods_num, null, null);

        // 상품 리뷰 정보 저장하기
        await this._saveReviewData(goods_num);

        return get_data.data[0][0];
    }

    // 라이크 정보 가져오기
    _getLikeInfo = async (goods_num) => {
        const { goodsAction } = this.props;
        // 로그인 상태에서만 실행
        const user_info = JSON.parse(this.props.user_info);

        if(user_info) {
            const obj = { 'type' : "SELECT", 'table' : "like", 'comment' : "라이크 정보 가져오기" };

            obj['option'] = {};
            obj['option']['user_id'] = '=';
            obj['option']['goods_id'] = '=';

            obj['where'] = [];
            obj['where'][0] = { 'table' : 'like', 'key' : 'user_id', 'value' : user_info.id };
            obj['where'][1] = { 'table' : 'like', 'key' : 'goods_id', 'value' : goods_num };

            const get_data = await axios(URL + '/api/query', {
                method : 'POST',
                headers: new Headers(),
                data : obj
            })

            if(get_data.data[0].length !== 0) {
                goodsAction.set_like_state({ 'obj' : JSON.stringify(get_data.data[0]) })

            } else {
                goodsAction.set_like_state({ 'obj' : false })
            }
        }

        return true;
    }

    _saveQandAData = async (goods_id, limit, check) => {
        const { goodsAction, location } = this.props;
        const obj = { 'type' : 'SELECT', 'table' : 'q&a', 'comment' : '상품 문의 정보 가져오기 (답변 포함)', 'join' : true };

        const qry = queryString.parse(location.search);
        const user_info = JSON.parse(this.props.user_info);

        // 같은 테이블로 JOIN 하기
        // question_id 와 동일한 값을 포함
        obj['on'] = true;
        obj['on_arr'] = [
                            { 'name' : 'em1', 'value' : '*' },
                            { 'name' : 'em2', 'value' : [ { 'name' : 'contents', 'as' : 'answer', 'last' : true } ] },
                        ]
            // = SELECT em1.*, em2.contents as anwser 

        obj['join_arr'] = [];
        obj['join_arr'][0] = { 'key1' : 'id', 'key2' : 'question_id' }

        obj['option'] = {};
        obj['option']['goods_id'] = '=';
        obj['option']['state'] = '<>';
        obj['option']['question_id'] = 'IS NULL';
        obj['option']['type'] = '=';

        obj['where'] = [];
        obj['where'].push({ 'table' : 'q&a', 'key' : 'goods_id', 'value' : goods_id });
        obj['where'].push({ 'table' : 'q&a', 'key' : 'state', 'value' : 2 });
        obj['where'].push({ 'table' : 'q&a', 'key' : 'question_id', 'value' : null });
        obj['where'].push({ 'table' : 'q&a', 'key' : 'type', 'value' : 0 });

        obj['order'] = []
        obj['order'].push({ 'table' : 'q&a', 'key' : 'id', 'value' : "DESC" });

        if(qry) { 
            const now_page = qry.qna_page ? Number(qry.qna_page) : 1;
            
            const cnt_start = now_page === 1 ? 0 : (10 * (Number(now_page) - 1) );
            const cnt_end = (now_page * 10);
                
            obj['order'][1] = { 'table' : 'q&a', 'key' : 'limit', 'value' : [Number(cnt_start), Number(cnt_end)] };

            if(qry.filter_1) {
                obj['option']['user_id'] = '=';
                obj['where'].push({ 'table' : 'q&a', 'key' : 'user_id', 'value' : user_info.id });
            }

            if(qry.filter_2) {
                obj['special_opt'] = { 'type' : 'on', 'name' : 'INNER' };
                // LEFT JOIN 을 INNER JOIN 으로 검색
            }
        }

        if(limit) {
            obj['order'][1] = { 'table' : 'q&a', 'key' : 'limit', 'value' : "1" };

            if(check) {
                obj['option']['user_id'] = '=';
                obj['where'].push({ 'table' : 'q&a', 'key' : 'user_id', 'value' : user_info.id });
            }
        }

        const get_data = await axios(URL + '/api/query', {
            method : 'POST',
            headers: new Headers(),
            data : obj
        })

        // 총 갯수 구하기
        const cover_obj = obj;
        cover_obj['count'] = true;

        const get_cnt = await axios(URL + '/api/query', {
            method : 'POST',
            headers: new Headers(),
            data : cover_obj
        })
        
        const save_obj = {};
        save_obj['arr'] = JSON.stringify(get_data.data[0]);
        save_obj['qna_length'] = get_cnt.data[0][0]['count(*)'];

        if(!check) {
            goodsAction.save_QandA_data(save_obj);
        }

        return get_data.data[0];
    }

    // 리뷰 정보 가져오기
    _saveReviewData = async (goods_id) => {
        const { goodsAction, location } = this.props;
        const obj = { 'type' : 'SELECT', 'table' : 'review', 'comment' : '리뷰 정보 가져오기' };

        const qry = queryString.parse(location.search);
        const user_info = JSON.parse(this.props.user_info);

        obj['option'] = {};
        obj['option']['goods_id'] = '=';
        obj['option']['state'] = '<>';

        obj['where'] = [];
        obj['where'].push({ 'table' : 'review', 'key' : 'goods_id', 'value' : goods_id });
        obj['where'].push({ 'table' : 'review', 'key' : 'state', 'value' : 1 });

        obj['order'] = []

        if(qry.filter_3) {
            obj['option']['user_id'] = '=';
            obj['where'].push({ 'table' : 'review', 'key' : 'user_id', 'value' : user_info.id });

        } else {
            if(qry.filter_4) {
                obj['order'].push({ 'table' : 'review', 'key' : 'score', 'value' : "DESC" });

            } else if(qry.filter_5) {
                obj['order'].push({ 'table' : 'review', 'key' : 'score', 'value' : "ASC" });
            }
        }

        obj['order'].push({ 'table' : 'review', 'key' : 'id', 'value' : "DESC" });

        const now_page = qry.review_page ? Number(qry.review_page) : 1;
            
        const cnt_start = now_page === 1 ? 0 : (10 * (Number(now_page) - 1) );
        const cnt_end = (now_page * 10);
            
        obj['order'][1] = { 'table' : 'review', 'key' : 'limit', 'value' : [Number(cnt_start), Number(cnt_end)] };


        const get_data = await axios(URL + '/api/query', {
            method : 'POST',
            headers: new Headers(),
            data : obj
        })

        // 총 갯수 구하기
        const cover_obj = obj;
        cover_obj['count'] = true;

        const get_cnt = await axios(URL + '/api/query', {
            method : 'POST',
            headers: new Headers(),
            data : cover_obj
        })
        
        const save_obj = {};
        save_obj['arr'] = JSON.stringify(get_data.data[0]);
        save_obj['length'] = get_cnt.data[0][0]['count(*)'];

        goodsAction.save_review_data(save_obj);
    }

    // 상품 찜하기
    _likeGoods = async () => {
        const { _modalToggle, goodsAction, like_loading, like_state, _checkLogin } = this.props;
        const user_info = JSON.parse(this.props.user_info);
        const login_check = await _checkLogin();

        const goods_data = JSON.parse(this.props.goods_data);
        const cover_like_state = like_state !== false ? JSON.parse(like_state) : false;
        // $('.like_alert').fadeOut(300)

        if(like_loading === false) {
            if(!user_info || !login_check) {
                alert('로그인이 필요합니다.');
                return _modalToggle(true);
            }

            goodsAction.like_loading({ 'bool' : true });

            let change_state = 1;
            if(cover_like_state === false) {

                const obj = {};
                obj['user_id'] = user_info.id;
                obj['goods_id'] = goods_data.id;

                const add_like = await axios(URL + '/add/like', {
                    method : 'POST',
                    headers: new Headers(),
                    data : obj
                })
                
                $('#goods_like_div img').attr({ 'src' : icon.goods.like_on })
                goodsAction.set_like_state({ 'obj' : JSON.stringify([add_like.data]) })

            } else {
                let obj = { 'type' : "UPDATE", 'table' : "like", 'comment' : "라이크 비활성화" };
                obj['where_limit'] = 1;

                obj['columns'] = [];
                obj['columns'][1] = { 'key' : 'modify_date', 'value' : null };

                obj['where'] = [];
                
                obj['where'][0] = { 'key' : 'user_id', 'value' : user_info.id };
                obj['where'][1] = { 'key' : 'goods_id', 'value' : goods_data.id };

                if(cover_like_state[0].state === 0) {
                    // 라이크 ON
                    obj['comment'] = '라이크 활성화';
    
                    // $('#goods_like_div img').attr({ 'src' : icon.goods.like_none })
                    // goodsAction.set_like_state({ 'bool' : false })
                } else {
                    // 라이크 OFF
                    change_state = 0;
                }

                obj['columns'][0] = { 'key' : 'state', 'value' : change_state };

                await axios(URL + '/api/query', {
                    method : 'POST',
                    headers: new Headers(),
                    data : obj
                })

                cover_like_state[0].state = change_state;
                goodsAction.set_like_state({ 'obj' : JSON.stringify(cover_like_state) })
            }

            if(change_state === 1) {
                // 활성화
                $('#goods_like_div').append("<p id='like_on_alert' class='like_alert'> 찜을 설정했습니다. </p>")

            } else {
                $('#goods_like_div').append("<p id='like_off_alert' class='like_alert gray'> 찜을 해제했습니다. </p>")
            }

            fade_alert = window.setTimeout( () => {
                let target = 'like_on_alert';
                if(change_state === 0) {
                    target = 'like_off_alert'
                }

                const start = 1.4;
                const _fadeOut = (start) => {
                    if(start <= 0) {
                        $('#' + target).remove();
                        $('#' + target).css({ 'opacity' : '1.4' });

                        return goodsAction.like_loading({ 'bool' : false });
                    }

                    start = start - 0.2;
                    $('#' + target).css({ 'opacity' : start });

                    return window.setTimeout( () => {
                        return _fadeOut(start);
                    }, 50)
                }

                // $('#' + target).fadeOut(300);
                // return goodsAction.like_loading({ 'bool' : false });

                return _fadeOut(start);
            }, 1000);

            return window.setTimeout(fade_alert, 2000)

        // if(user_info === null && user_session === null) {
        //     sessionStorage.removeItem('login');
            
        //     return 
        // }
        }
    }

    // 라이크 Mouse Toggle
    _likeMouseToggle = (bool) => {
        const like_state = JSON.parse(this.props.like_state)[0] !== undefined
            ? JSON.parse(this.props.like_state)[0]
            : false;

        if(like_state === false || like_state.state === 0) {
            // off => on

            if(bool === true) {
                $('#goods_like_div img').attr({ 'src' : icon.goods.like_mouse_on })
                $('#goods_like_div p').addClass('bold black')

            } else if(bool === false) {
                $('#goods_like_div img').attr({ 'src' : icon.goods.like_none })
                $('#goods_like_div p').removeClass('bold black')
            }

        } else if(like_state.state === 1) {
            // on => off

            if(bool === true) {
                $('#goods_like_div img').attr({ 'src' : icon.goods.like_off })
                $('#goods_like_div p').addClass('bold black')

            } else if(bool === false) {
                $('#goods_like_div img').attr({ 'src' : icon.goods.like_on })
                $('#goods_like_div p').removeClass('bold black')
            }
        }
    }

    _setGoodsNumber = (type, target) => {
        const { goodsAction } = this.props;
        const goods_data = JSON.parse(this.props.goods_data);

        let { goods_num, goods_result_price } = this.props;
        if(type === 'plus') {
            goods_num += 1;

        } else if(type === 'minus') {
            if(goods_num > 0) {
                goods_num -= 1;
            }

        } else if(type === 'change') {
            goods_num = $('input[name=' + target + ']').val();
        }

        const max_length = goods_data.stock > 5 ? 5 : goods_data.stock;
        if(goods_num > max_length) {
            goods_num = max_length;
            
        } else if(goods_num < 0) {
            goods_num = 0;
        }

        goods_result_price = goods_num * goods_data.result_price;

        $('.goods_change_goods_num_input').val(goods_num)
        return goodsAction.set_goods_num({ 'num' : Number(goods_num), 'price' : Number(goods_result_price) })
    }

    // 장바구니 추가
    _addCartGoods = async (stock_check, define_check, stop, update) => {
        const { like_loading, goods_num, goodsAction, _checkLogin, _modalToggle } = this.props;
        const user_info = JSON.parse(this.props.user_info);
        const user_cookie = await _checkLogin();

        const goods_data = JSON.parse(this.props.goods_data);

        if(!user_info.id || !user_cookie.id) {
            alert('로그인이 필요합니다.');
            return _modalToggle(true);

        } else if(goods_data.state === 0) {
            return alert('현재 구매 불가능한 상품입니다.');

        } else if(goods_num === 0) {
            return alert('1개 이상부터 구매 가능합니다.');

        } else if(like_loading) {
            if(!stock_check && !define_check) {
                return;
            }
        }

        let obj = { };
        if(update === true) {
            obj['type'] = "UPDATE";
            obj['table'] = "cart";
            obj['comment'] = "삭제 복구하기";

            obj['where_limit'] = 1;

            obj['columns'] = [];
            obj['columns'][0] = { 'key' : 'modify_date', 'value' : null };
            obj['columns'][1] = { 'key' : 'remove_state', 'value' : 0 };
            obj['columns'][2] = { 'key' : 'num', 'value' : goods_num };
            obj['columns'][3] = { 'key' : 'price', 'value' : goods_data.result_price };
            obj['columns'][4] = { 'key' : 'discount', 'value' : goods_data.discount_price };
    
            obj['where'] = [];
            
            obj['where'][0] = { 'key' : 'user_id', 'value' : user_info.id };
            obj['where'][1] = { 'key' : 'goods_id', 'value' : goods_data.id };

        } else if(!stock_check) {
            obj['type'] = "SELECT";
            obj['table'] = "goods";
            obj['comment'] = "재고 체크하기";

            // 재고 체크하기
            obj['where'] = [];
            obj['where'][0] = { 'table' : 'goods', 'key' : 'id', 'value' : goods_data.id };

            obj['option'] = {};
            obj['option']['id'] = '=';

        } else if(!define_check) {
            obj['type'] = "SELECT";
            obj['table'] = "cart";
            obj['comment'] = "장바구니 중복 체크하기";

            obj['where'] = [];
            obj['where'][0] = { 'table' : 'cart', 'key' : 'goods_id', 'value' : goods_data.id };
            obj['where'][1] = { 'table' : 'cart', 'key' : 'user_id', 'value' : user_info.id };
            obj['where'][2] = { 'table' : 'cart', 'key' : 'state', 'value' : 1 };

            obj['option'] = {};
            obj['option']['goods_id'] = '=';
            obj['option']['user_id'] = '=';
            obj['option']['state'] = '=';

            obj['order'] = []
            obj['order'][0] = { 'table' : 'cart', 'key' : 'id', 'value' : "DESC" };
            obj['order'][1] = { 'table' : 'cart', 'key' : 'limit', 'value' : "1" };


        } else if(stock_check && define_check) {
            // 장바구니에 추가
            // obj['type'] = 'INSERT';
            // obj['table'] = 'cart'
            // obj['comment'] = '장바구니에 추가하기';

            // obj['columns'] = [];

            // obj['columns'][0] = { "key" : "user_id", "value" : user_info.id }
            // obj['columns'][1] = { "key" : "goods_id", "value" : goods_data.id }
            // obj['columns'][2] = { "key" : "price", "value" : goods_data.result_price }
            // obj['columns'][3] = { "key" : "num", "value" : goods_num }
            // obj['columns'][4] = { "key" : "state", "value" : 1 }
            // obj['columns'][5] = { "key" : "create_date", "value" : null }
            // obj['columns'][6] = { "key" : "discount", "value" : goods_data.discount_price }
            // obj['columns'][7] = { "key" : "remove_state", "value" : 0 }

            obj = await this._addCartData(goods_num, 0);
        }

        goodsAction.like_loading({ 'bool' : true });

        const query_result = await axios(URL + '/api/query', {
            method : 'POST',
            headers: new Headers(),
            data : obj
        })

        if(update === true) {
            goodsAction.like_loading({ 'bool' : false });
            return goodsAction.add_complate_cart({ 'bool' : true });

        } else if(!stock_check) {
            const stock = Number(query_result.data[0][0].stock);
            const max_length = stock > 5 ? 5 : stock;

            const disable = query_result.data[0][0].state;

            let stop_result = false;
            if(max_length > 0 && disable === 1) {
                // 재고가 있거나 구매 가능한 상품
                if(stop) {
                    return stop_result
                }

                return this._addCartGoods(true, null);

            } else {
                if(Number(goods_num) > max_length) {
                    alert(max_length + ' 개 까지 구매할 수 있습니다.');
                    stop_result = true;

                } else if(Number(max_length) <= 0) {
                    alert('현재 품절된 상품입니다.');
                    stop_result = true;

                } else if(disable === 0) {
                    alert('현재 구매 불가능한 상품입니다.');
                    return window.location.replace('/')
                }

                goodsAction.like_loading({ 'bool' : false });
                if(stop) {
                    return stop_result
                }

                return this._getGoodsData(goods_data.id);
           }

        } else if(!define_check) {
            if(query_result.data[0][0] === undefined) {
                // 없는 경우
                return this._addCartGoods(true, true);

            } else {
                const data = query_result.data[0][0];
                if(data.state === 0) {
                    return this._addCartGoods(true, true);

                } else if(data.remove_state === 1) {
                    // 삭제한 내역이 있다면
                    return this._addCartGoods(true, true, null, true);
                
                } else if(data.state === 1) {
                    // 중복
                    this._changeOtherDivHeight(200);

                    // this._setScreenWitdhEvent(true);
                    goodsAction.like_loading({ 'bool' : false });
                    return goodsAction.overlap_cart({ 'bool' : true, 'num' : query_result.data[0][0].id })
                }
            }

        } else if(stock_check && define_check) {
            goodsAction.like_loading({ 'bool' : false });
            return goodsAction.add_complate_cart({ 'bool' : true });
        }

        return goodsAction.like_loading({ 'bool' : false });
    }

    _addCartData = async (goods_num, remove_state) => {
        const user_info = JSON.parse(this.props.user_info);
        const goods_data = JSON.parse(this.props.goods_data);
        const obj = {};

        // 장바구니에 추가
        obj['type'] = 'INSERT';
        obj['table'] = 'cart'
        obj['comment'] = '장바구니에 추가하기';

        obj['columns'] = [];

        const remove = remove_state ? remove_state : 0;
        obj['columns'][0] = { "key" : "user_id", "value" : user_info.id }
        obj['columns'][1] = { "key" : "goods_id", "value" : goods_data.id }
        obj['columns'][2] = { "key" : "price", "value" : goods_data.result_price }
        obj['columns'][3] = { "key" : "num", "value" : goods_num }
        obj['columns'][4] = { "key" : "state", "value" : 1 }
        obj['columns'][5] = { "key" : "create_date", "value" : null }
        obj['columns'][6] = { "key" : "discount", "value" : goods_data.discount_price }
        obj['columns'][7] = { "key" : "remove_state", "value" : remove }

        return obj;
    }

    // 카트 중복 처리
    _overlapCartData = async (bool, goods_id) => {
        const { goodsAction, goods_num, save_overlap_id } = this.props;
        const user_info = JSON.parse(this.props.user_info)

        if(bool === false) {
            // 취소 버튼 클릭시
            this._changeOtherDivHeight(90);

            return goodsAction.overlap_cart({ 'bool' : false })
            
        } else {
            const check_goods = await this._addCartGoods(null, null, true);
            goodsAction.overlap_cart({ 'bool' : false })

            this._changeOtherDivHeight(120);


            if(check_goods) {
                return
            }

            const obj = { 'type' : "UPDATE", 'table' : "cart", 'comment' : "장바구니 수정하기" };

            obj['where_limit'] = 2;

            obj['columns'] = [];
            obj['columns'][0] = { 'key' : 'num', 'value' : goods_num };
            obj['columns'][1] = { 'key' : 'modify_date', 'value' : null };
    
            obj['where'] = [];
            
            obj['where'][0] = { 'key' : 'user_id', 'value' : user_info.id };
            obj['where'][1] = { 'key' : 'goods_id', 'value' : goods_id };
            obj['where'][2] = { 'key' : 'id', 'value' : save_overlap_id };
            
            await axios(URL + '/api/query', {
                method : 'POST',
                headers: new Headers(),
                data : obj
            })

            // this._setScreenWitdhEvent(false, true);

            this._changeOtherDivHeight(140);

            goodsAction.like_loading({ 'bool' : false });
            goodsAction.add_complate_cart({ 'bool' : true })
        }
    }

    _toggleFixedInfo = () => {
        const { goodsAction, open_fixed } = this.props;

        if(!open_fixed === true) {
            $('#goods_fixed_price_div').removeClass('display_none')
            $('#goods_fixed_price_div').slideDown(500);

        } else {
            $('#goods_fixed_price_div').addClass('display_none')
        }

        return goodsAction.toggle_fixed({ 'bool' : !open_fixed })
    }

    _clickComplateButton = (type) => {
        if(type === 'move') {
            return window.location.href='/myPage/cart'

        } else if(type === 'close') {
            this._changeOtherDivHeight(90)

            // this._setScreenWitdhEvent(false, false)
            return this.props.goodsAction.add_complate_cart({ 'bool' : false });
        }
    }

    _changeOtherDivHeight = () => {
        const width_size = document.body.offsetWidth;
        
        if(width_size <= 850 && width_size >= 550) {
            // $('#goods_contents_grid_div').css({ 'paddingBottom' :  height + 'px' })
        }
    }

    // 바로 구매
    _directBuyGoods = async () => {
        const { _loginCookieCheck, _getCookie, _stringCrypt } = this.props;
        const { _getGoodsData } = this;

        const goods_num = $('input[name=goods_num]').val();
        const goods_data = JSON.parse(this.props.goods_data);
        const user_info = JSON.parse(this.props.user_info)

        const check = await _loginCookieCheck('login');
        if(check === false) {
            return;
        }

        if(goods_num === 0) {
            return alert('1개 이상 선택해주세요.');
        }

        if(!window.confirm('해당 물품을 바로 구매하시겠습니까?')) {
            return;
        }

        const goods_info = await _getGoodsData(goods_data.id);

        const max_length = goods_data.stock > 5 ? 5 : goods_data.stock;
        if(goods_num > max_length) {
            alert('재고가 부족합니다. \n'+ max_length + ' 개 까지 구매할 수 있습니다.');

            return window.location.reload();
        }

        // const cart_add_obj = await _addCartData(goods_num, 1);
        // await axios(URL + '/api/query', {
        //     method : 'POST',
        //     headers: new Headers(),
        //     data : cart_add_obj
        // })

        const insert_obj = { 'type' : 'INSERT', 'table' : 'order', 'comment' : '주문 추가하기' };

        const save_cookie = {};

        save_cookie['user_id'] = user_info.id;
        save_cookie['select_list'] = goods_info.id;
        save_cookie['goods_num'] = Number(goods_num);
        save_cookie['direct_buy'] = true;

        // 인증 코드 추가
        let code = '';
        for(let i = 0; i < Math.trunc(Math.random() * (10 - 6) + 6); i++) {
            let number = Math.trunc(Math.random() * (10 - 0) + 0);
            code += String(number);
        }
        save_cookie['code'] = code;
        await _getCookie('order', 'add', _stringCrypt(JSON.stringify(save_cookie), "_order_cookie_data", true), true);

        insert_obj['columns'] = [];

        const order_title = goods_info.name;
        const origi_price = Number(goods_info.origin_price * goods_num);
        // const discount_price = Number(goods_info.result_price * goods_num);

        const discount_price = goods_info.discount_price === 0 ? 0 : (goods_info.origin_price - goods_info.result_price) * goods_num;

        let result_price = Number(origi_price - discount_price);
        const delivery_price = result_price > 30000 ? 0 : 2500;

        result_price += delivery_price;

        insert_obj['columns'][0] = { "key" : "user_id", "value" : user_info.id };
        insert_obj['columns'][1] = { "key" : "order_state", "value" : 0 };
        insert_obj['columns'][2] = { "key" : "cart_list", "value" : JSON.stringify(goods_info.id) };
        insert_obj['columns'][3] = { "key" : "code", "value" : code };
        insert_obj['columns'][4] = { "key" : "create_date", "value" : null };
        insert_obj['columns'][5] = { "key" : "order_title", "value" : order_title };
        insert_obj['columns'][6] = { "key" : "result_price", "value" : result_price };
        insert_obj['columns'][7] = { "key" : "discount_price", "value" : discount_price };
        insert_obj['columns'][8] = { "key" : "delivery_price", "value" : delivery_price };
        insert_obj['columns'][9] = { "key" : "origin_price", "value" : origi_price };
        insert_obj['columns'][10] = { "key" : "goods_num", "value" : goods_num };
        insert_obj['columns'][11] = { "key" : "order_type", "value" : 0 };
        insert_obj['columns'][12] = { "key" : "payment_state", "value" : 0 };
        
        await axios(URL + '/api/query', {
            method : 'POST',
            headers: new Headers(),
            data : insert_obj
        })

        return window.location.href='/myPage/order';
    }

    _toggleWrite = async (type, move, goods_id) => {
        const { goodsAction, _moveScrollbar, location, _loginAfter, QandA_write } = this.props;
        
        const save_url = location.pathname + location.search;
        const login_check = await _loginAfter(save_url, true);

        if(login_check === true) {
            const obj = {};

            if(type === 'qna') {
                const qry = queryString.parse(this.props.location.search);
                const goods_num = qry.goods_num;
    
                const overlap_check = await this._checkOverlapWrite('qna', goods_num);
                if(overlap_check === false) {
                    return;
                }

                obj['qna'] = QandA_write === true ? false : true;

                if(obj['qna'] === false) {
                    $('input[name=qna_title]').val("");
                    goodsAction.save_write_data({ 'qna_contents' : "", 'qna_secret' : false })
                }

            } else if(type === 'review') {
                const { configAction } = this.props;

                configAction.toggle_review_modal({ 'bool' : true, 'goods_id' : goods_id, 'callback' : this._getGoodsData })
            }

            let move_height = null;
            if(move) {
                move_height = $('#goods_' + type + '_write_div').offset().top - 200;
                _moveScrollbar('html', 'y', move_height);
            }

            goodsAction.toggle_write(obj);
        }
    }

    // 중복 작성 체크하기
    _checkOverlapWrite = async (type, goods_id) => {
        const { goodsAction } = this.props;

        if(type === 'qna') {
            // Q&A 중복 체크
            const check = await this._saveQandAData(goods_id, 1, true);

            if(check[0]) {
                if(!check[0].answer) {
                    alert('이미 작성한 문의가 있습니다. \n답변을 너무 오래 기다리셨다면 관리자에게 직접 문의해주세요.');
        
                    $('input[name=qna_title]').val("");
                    goodsAction.save_write_data({ 'qna_contents' : "", 'qna_secret' : false });

                    goodsAction.toggle_write({ 'qna' : false });

                    return false;
                }
            }

            return true;


        } else if(type === 'review') {
            // 리뷰 체크
        }
    }

    // Q&A 작성하기
    _writeQnA = async (event) => {
        const { _loginAfter, location, goodsAction } = this.props;
        event.preventDefault();

        const save_url = location.pathname + location.search;
        const login_check = await _loginAfter(save_url, true);

        if(login_check === true) {
            const qry = queryString.parse(this.props.location.search);
            const goods_num = qry.goods_num;

            const overlap_check = await this._checkOverlapWrite('qna', goods_num);
            if(overlap_check === false) {
                return;
            }

            const title = $('input[name=qna_title]').val();
            const contents = this.props.QandA_contents.replace(/(\n|\r\n)/g, '<br>');
            
            if(title.trim().length <= 1) {
                alert('제목은 최소 2 글자 이상으로 입력해주세요.');
                return $('input[name=qna_title]').focus();

            } else if(contents.trim().length <= 9) {
                alert('내용은 최소 10 글자 이상으로 입력해주세요.');
                return $('textarea[name=qna_contents]').focus();
            }

            const user_info = JSON.parse(this.props.user_info);
            const { QandA_secret, _moveScrollbar } = this.props;

            const insert_obj = { 'type' : 'INSERT', 'table' : 'q&a', 'comment' : '질문 등록하기' };

            insert_obj['columns'] = [];
            insert_obj['columns'].push({ "key" : "user_id", "value" : user_info.id });
            insert_obj['columns'].push({ "key" : "goods_id", "value" : goods_num });
            insert_obj['columns'].push({ "key" : "type", "value" : 0 });
            insert_obj['columns'].push({ "key" : "state", "value" : 0 });
            insert_obj['columns'].push({ "key" : "secret_state", "value" : QandA_secret === true ? 1 : 0 });
            insert_obj['columns'].push({ "key" : "title", "value" : title });
            insert_obj['columns'].push({ "key" : "contents", "value" : contents });
            insert_obj['columns'].push({ "key" : "create_date", "value" : null });

            const set_data = await axios(URL + '/api/query', {
                method : 'POST',
                headers: new Headers(),
                data : insert_obj
            })

            if(set_data.data[0]) {
                alert('문의가 성공적으로 등록되었습니다. \n확인 후 빠른 답변드리겠습니다 :)');

                await this._saveQandAData(goods_num);
                goodsAction.toggle_write({ 'qna' : false });

                $('input[name=qna_title]').val("");
                goodsAction.save_write_data({ 'qna_contents' : "", 'qna_secret' : false, 'qna_select' : set_data.data[0] })

                const move_height = $('#goods_qna_other_div').offset().top - 200;
                return _moveScrollbar('html', 'y', move_height);

            } else {
                return alert('에러 발생으로 문의 등록에 실패했습니다. \n잠시후 다시 시도해주시거나 관리자에게 직접 문의 바랍니다.');
            }

        }
    }

    // 글자수 자동 체크하기
    _checkStringLength = (type) => {
        const { goodsAction, QandA_secret} = this.props; 

        let data;
        const obj = {};

        if(type === 'qna_contents') { 
            data = $('textarea[name=qna_contents]').val();

        } else if(type === 'qna_secret') {
            if(QandA_secret === false) {
                // 비밀 ON
                $('input[name=qna_secret]').prop('checked', true);

            } else if(QandA_secret === true) {
                // 비밀 OFF
                $('input[name=qna_secret]').prop('checked', false);
            }

            data = !QandA_secret;
        }

        obj[type] = data;

        return goodsAction.save_write_data(obj);
    }

        // QandA 선택시 상황 처리하기
        _selectQandA = async (info, boo) => {
            const { goodsAction, location, _loginAfter } = this.props;

            const user_info = JSON.parse(this.props.user_info);

            if(info.secret_state === 1) {
                // 해당 문의가 비밀글이라면
                
                // 로그인 체크
                const save_url = location.pathname + location.search;
                const login_check = await _loginAfter(save_url, true);
                
                if(login_check === false) {
                    return;
                }

                if(info.user_id !== user_info.id) {
                    // 관리자이거나 내가 작성한 문의일 때만 열람 가능
                    if(user_info.admin === 'N') {
                        return alert('해당 문의는 비밀글입니다. \n( 작성자 및 관리자만 열람 가능합니다. )');
                    }
                }
            }

            if(boo === true) {
                goodsAction.save_write_data({ 'qna_select' : info.id })

            } else if(boo === false) {
                goodsAction.save_write_data({ 'qna_select' : null })
            }
        }
        
        // 문의글 삭제하기
        _removeQandA = async (info, goods_num) => {
            if(qna_remove === true) {
                return;
            }

            if(!window.confirm('작성한 문의글을 삭제하시겠습니까?')) {
                return;
            }

            const user_info = JSON.parse(this.props.user_info);

            let user_id = user_info.id;
            if(user_info.admin === 'N') {
                if(user_id !== info.user_id) {
                    return alert('자신이 작성한 문의만 삭제할 수 있습니다.');

                } else if(info.goods_id !== Number(goods_num)) {
                    return alert('상품 번호가 일치하지 않습니다.')
                }

            } else {
                // 관리자일 때
                user_id = info.user_id;
            }

            qna_remove = true;

            const obj = { 'type' : 'UPDATE', 'table' : 'q&a', 'comment' : '문의글 삭제하기' }

            obj['columns'] = [];
            obj['columns'].push({ 'key' : 'remove_date', 'value' : null });
            obj['columns'].push({ 'key' : 'state', 'value' : 2 });
    
            obj['where'] = [];
            
            obj['where'].push({ 'key' : 'user_id', 'value' : user_id });
            obj['where'].push({ 'key' : 'goods_id', 'value' : goods_num });
            obj['where'].push({ 'key' : 'id', 'value' : info.id });

            obj['where_limit'] = 2;

            const set_data = await axios(URL + '/api/query', {
                method : 'POST',
                headers: new Headers(),
                data : obj
            })

            if(set_data.data[0]) {
                alert('문의가 삭제되었습니다.');
                qna_remove = false;

                await this._saveQandAData(goods_num);
            }
        }

        // 답변 등록하기
        _addAnswer = async (info, goods_id) => {
            const { _addAlert } = this.props;
            const user_info = JSON.parse(this.props.user_info);
            const goods_info = JSON.parse(this.props.goods_data);

            if(user_info.admin === 'N') {
                return alert('관리자 권한이 없습니다.');
            }

            const contents = $('textarea[name=qna_answer_textbox]').val();
            if(contents.trim().length < 5) {
                alert('5 글자 이상으로 답변을 입력해주세요.');
                return $('textarea[name=qna_answer_textbox]').focus();
            }

            const insert_obj = { 'type' : 'INSERT', 'table' : 'q&a', 'comment' : '답변 등록하기' }

            insert_obj['columns'] = [];
            insert_obj['columns'].push({ "key" : "user_id", "value" : user_info.id });
            insert_obj['columns'].push({ "key" : "goods_id", "value" : goods_id });
            insert_obj['columns'].push({ "key" : "type", "value" : 1 });
            insert_obj['columns'].push({ "key" : "state", "value" : 1 });
            insert_obj['columns'].push({ "key" : "question_id", "value" : info.id });
            insert_obj['columns'].push({ "key" : "secret_state", "value" : 0 });
            insert_obj['columns'].push({ "key" : "title", "value" : "" });
            insert_obj['columns'].push({ "key" : "contents", "value" : contents });
            insert_obj['columns'].push({ "key" : "create_date", "value" : null });

            const set_data = await axios(URL + '/api/query', {
                method : 'POST',
                headers: new Headers(),
                data : insert_obj
            })

            if(set_data.data[0]) {
                alert('답변 등록이 완료되었습니다.');

                const alert_info = {};
                alert_info['user_id'] = info.user_id;
                alert_info['reason'] = '[ ' + goods_info.name + ' ] 의 문의에 답변이 달렸습니다.';
                alert_info['move_url'] = '/goods/?goods_num=' + goods_id;

                // 알림 메세지 보내기
                _addAlert(alert_info);

                return await this._saveQandAData(goods_id);

            } else {
                return alert('답변을 등록하지 못했습니다.');
            }
        }

        // QnA 필터 적용
        _qnaFilter = (type, qry, bool, url, reset) => {
            // reset : 모두 삭제하기
            const { _filterURL } = this.props;
            qry[url + '_page'] = 1;

            if(bool === true) {
                qry['filter_' + type] = 1;
                sessionStorage.setItem('page_move', url);

            } else if(bool === false) {
                delete qry['filter_' + type];
                
                if(reset === true) {
                    delete qry[url + '_page'];

                    if(url === 'qna') {
                        delete qry['filter_1'];
                        delete qry['filter_2'];

                    } else if(url === 'review') {
                        delete qry['filter_3'];
                        delete qry['filter_4'];
                        delete qry['filter_5'];
                    }
                }
            }

            return _filterURL(qry, "");
        }

    _removeReviewFn = async (review_id, goods_id, score, user_id) => {
        const { _removeReview } = this.props;
        const user_info = JSON.parse(this.props.user_info);

        if(review_remove === true) {
            return;
        }

        if(user_info.id !== user_id) {
            if(user_info.admin !== 'Y') {
                alert('자신이 작성한 리뷰만 삭제할 수 있습니다.');
                return window.location.reload();
            }
        }

        review_remove = true;
        const cover_user_id = user_id ? user_id : user_info.id;

        const remove_review = await _removeReview(review_id, goods_id, score, cover_user_id, true);
        if(remove_review === true) {

            // await this._getGoodsData(goods_id);
            await this._saveReviewData(goods_id);

            review_remove = false;
            return alert('리뷰가 삭제되었습니다.');
        }

        review_remove = false;
    }

    _selectReviewFilter = (event, qry) => {
        const { _qnaFilter } = this;

        event.preventDefault();
        const filter = event.target.value;

        if(filter === 'null') {
            // 필터 없애기
            _qnaFilter('4', qry, false, 'review');
            _qnaFilter('5', qry, false, 'review');

        } else {
            const cover_filter = filter === '4' ? '5' : '4';
            _qnaFilter(filter, qry, true, 'review');
            _qnaFilter(cover_filter, qry, false, 'review');
        }
    }

    render() {
        const { 
            goods_loading, _searchCategoryName, _pageMove, price_comma, like_state, goods_result_price, _filterURL,
            goods_num, overlap_cart, add_complate, open_fixed, QandA_write, QandA_secret, QandA_contents, QandA_select, QandA_length,
            review_length, review_select
        } = this.props;

        const goods_data = JSON.parse(this.props.goods_data);
        const user_info = JSON.parse(this.props.user_info);

        const { 
            _likeGoods, _likeMouseToggle, _setGoodsNumber, _moveScroll, _addCartGoods, _overlapCartData, _selectQandA, _addAnswer,
            _toggleFixedInfo, _clickComplateButton, _directBuyGoods, _toggleWrite, _writeQnA, _checkStringLength, _removeQandA, _qnaFilter,
            _removeReviewFn, _selectReviewFilter
        } = this;
        
        const qry = queryString.parse(this.props.location.search);
        const goods_id = qry.goods_num;

        let first_cat = '';
        let last_cat = '';
        if(goods_loading && goods_data) {
            first_cat = _searchCategoryName(goods_data.first_cat, 'first');
            last_cat = _searchCategoryName(goods_data.last_cat, 'last', goods_data.first_cat);
        }

        const like_state_data = like_state !== false ? JSON.parse(like_state) : false;

        let like_icon = icon.goods.like_none;
        if(like_state_data !== false && like_state_data[0].state === 1) {
            like_icon = icon.goods.like_on;
        }

        let img_arr = goods_data.bonus_img;

        if(img_arr !== undefined) {
            img_arr = img_arr.slice(2, img_arr.length - 2);
            img_arr = img_arr.split('","');
        }

        let img_where = goods_data.img_where;

        let contents = goods_data.contents;
        if(contents !== undefined) {
            contents = contents.slice(1, contents.length - 1);
        }

        const QandA_info = JSON.parse(this.props.QandA_info);
        const review_info = JSON.parse(this.props.review_info)

        let qna_filter_img = 'filter_empty';
        if(qry.filter_1 && qry.filter_2) {
            qna_filter_img = 'filter_full'

        } else if(qry.filter_1 || qry.filter_2) {
            qna_filter_img = 'filter';
        }

        const star_arr = [1, 2, 3, 4, 5];

        const review_filter = qry.filter_4 ? '4' 
                                           : qry.filter_5 ? '5' : null 

        const max_length = goods_data.stock > 5 ? 5 : goods_data.stock;
        return(
            <div id='goods_div'>
                {!goods_loading
                    ? <Loading />

                    : <div id='goods_home_div'>
                        <div id='goods_category_info_div' className='border_bottom paybook_bold gray'> 
                            <u title='검색 홈으로 이동' onClick={() => _pageMove('href', '/search')}> 홈 </u>　＞　
                            <u title={'[' + first_cat + '] 탭으로 이동'} onClick={() => _pageMove('href', '/search?first_cat=' + goods_data.first_cat)}> 
                                {first_cat} 
                            </u>　＞　
                            <u title={'[' + last_cat + '] 탭으로 이동'}
                                onClick={() => _pageMove('href', '/search?first_cat=' + goods_data.first_cat + '&last_cat=' + goods_data.last_cat)}> 
                                {last_cat} 
                            </u>
                        </div>

                        <div id='goods_contents_div'>
                            <h4 id='goods_title_div' className='recipe_korea'> {goods_data.name} </h4>

                            <div id='goods_contents_grid_div'>
                                <div />
                                    <div id='goods_thumbnail_div'>
                                        <div style={{ 'backgroundImage' : `url(${goods_data.thumbnail})` }} />
                                    </div>

                                    <div id='goods_detail_contents_div'>
                                        <div id='goods_detail_not_responsive'>
                                            <div id='goods_price_and_like_div'>
                                                <div id='goods_like_div'> 
                                                    <img src={like_icon} className='pointer' alt=''
                                                         onMouseOver={() => _likeMouseToggle(true)}
                                                         onMouseLeave={() => _likeMouseToggle(false)}
                                                         onClick={_likeGoods}
                                                         
                                                    />
                                                    {/* <p className='font_13 gray'> 
                                                        {like_state_data === false || like_state_data[0].state === 0 ? '상품 찜하기' : '상품 찜 해제'}  
                                                    </p> */}
                                                </div>

                                                <div id='goods_price_div'>
                                                    <h3 id='goods_origin_and_discount_div' className='gray'> 
                                                        <del> {price_comma(goods_data.origin_price)} </del> 원
                                                        　( {goods_data.discount_price} % )
                                                    </h3>

                                                    <h2> {price_comma(goods_data.result_price)} 원 </h2>
                                                </div>
                                            </div>

                                            <div id='goods_price_and_num_div'>
                                                <div id='goods_sales_and_stars_div' className='grid_half'>
                                                    <div className='aLeft gray'>
                                                        판매　|　{price_comma(goods_data.sales)} 개
                                                    </div>

                                                    <div className='goods_star_div aRight gray aCenter'>
                                                        <div> 평점　|　</div>

                                                        {star_arr.map( (cu, key) => {
                                                            return(
                                                                <div key={key}
                                                                     style={cu <= goods_data.star ? { 'color' : '#fdb827' } : null }
                                                                >
                                                                    {cu <= goods_data.star ? '★' : '☆'}
                                                                    
                                                                </div>
                                                            )
                                                        })}
                                                        <div>　( {goods_data.star} ) </div>
                                                    </div>
                                                </div>

                                                <div id='goods_price_and_num_grid_div' className='gray'>
                                                    <div id='goods_stock_div'>
                                                        {/* 최대 구매 가능　|　{price_comma(goods_data.stock)} 개  */}
                                                        최대 구매 가능　|　{price_comma(max_length)} 개 
                                                        {max_length === 0 ? <b style={{ 'color' : '#ec5858' }}>　( 품절 ) </b> : null}    
                                                    </div>
                                                </div>

                                                <div id='goods_num_div'>
                                                    <div className='pointer goods_plus_minus_buttons' onClick={max_length > 0 ? () => _setGoodsNumber('minus', 'goods_num') : null}
                                                        style={{ 'backgroundImage' : `url(${icon.icon.minus})` }} />
                                                    <div> 
                                                        <input defaultValue={goods_num} type='number' max={99999} min={0} name='goods_num'
                                                               className='goods_change_goods_num_input'
                                                               onChange={max_length > 0 ? () => _setGoodsNumber('change', 'goods_num') : null}
                                                               readOnly={max_length === 0 ? true : false}
                                                        /> 
                                                    </div>
                                                    <div className='pointer goods_plus_minus_buttons' onClick={max_length > 0 ? () => _setGoodsNumber('plus', 'goods_num') : null}
                                                        style={{ 'backgroundImage' : `url(${icon.icon.plus})` }} />
                                                </div>

                                                <div id='goods_result_price_div' className='aRight'>
                                                    <h2> {price_comma(goods_result_price)}　원 </h2>
                                                </div>
                                            </div>

                                            <div id='goods_other_div' className='aCenter border'>
                                                {max_length !== 0 
                                                ?
                                                add_complate === false ?
                                                    overlap_cart === false 
                                                    ?
                                                    <div id='default_add_cart_grid_div' className='add_cart_complate_grid_divs paybook_bold'>
                                                        <div className='border_right' onClick={_directBuyGoods}> 바로 구매 </div>
                                                        <div className='goods_add_cart_div' onClick={() => _addCartGoods(null, null)}> <img src={icon.my_page.cart_plus} alt='' /> 장바구니 </div>
                                                    </div>

                                                    : 
                                                    <div id='default_overlap_div' className='overlap_question_div'>
                                                        <div id='default_overlap_question_div'> 
                                                            <p className='font_15 bold red'> 이미 장바구니에 있는 상품입니다. </p> 
                                                            <p className='font_12'> 새로운 내용을 적용하시겠습니까?  </p>
                                                        </div>

                                                        <div className='add_cart_complate_grid_divs'>
                                                            <div className='border_right' onClick={() => _overlapCartData(true, goods_data.id)}> 적　용 </div>
                                                            <div onClick={() => _overlapCartData(false)}> 취　소 </div>
                                                        </div>
                                                    </div>

                                                : <div id='default_add_cart_complate_div' className='add_cart_complate_div'>
                                                    <img className='add_cart_complate_icon' src={icon.my_page.cart_complate} alt='' /> <h3 className='select_color'> 장바구니에 추가 되었습니다. </h3>
                                                    <div className='add_cart_complate_grid_divs'>
                                                        <div className='border_right' onClick={() => _clickComplateButton('move')} > 장바구니 이동 </div>
                                                        <div onClick={() => _clickComplateButton('close')}> 계속 쇼핑하기 </div>
                                                    </div>
                                                  </div>

                                                :
                                                    <div className='goods_sold_out_div' style={{ 'color' : '#ec5858' }}>
                                                        <b> 품절된 상품입니다. </b> 
                                                    </div>
                                                }
                                            </div>
                                        </div>

                                        {/* 반응형 div */}
                                        <div id='goods_detail_responsive_div' className='display_none'>
                                            <div id='goods_price_and_like'>
                                                <div id='goods_price_div'>
                                                    <h3 id='goods_origin_and_discount_div' className='gray'> 
                                                        <del> {price_comma(goods_data.origin_price)} </del> 원
                                                        　( {goods_data.discount_price} % )
                                                    </h3>

                                                    <h2> {price_comma(goods_data.result_price)} 원 </h2>
                                                </div>

                                                <div id='goods_like_div'> 
                                                    <img src={like_icon} className='pointer' alt=''
                                                         onMouseOver={() => _likeMouseToggle(true)}
                                                         onMouseLeave={() => _likeMouseToggle(false)}
                                                         onClick={_likeGoods}
                                                    />
                                                </div>
                                            </div>

                                            <div id='goods_price_and_num_div'>
                                                <div id='goods_sales_and_stars_div' className='grid_half'>
                                                    <div className='aLeft gray'>
                                                        판매　|　{price_comma(goods_data.sales)} 개
                                                    </div>

                                                    <div className='goods_star_div gray aRight'>
                                                        <div> 평점　|　</div>

                                                        {star_arr.map( (cu, key) => {
                                                            return(
                                                                <div key={key}
                                                                     style={cu <= goods_data.star ? { 'color' : '#fdb827' } : null }
                                                                >
                                                                    {cu <= goods_data.star ? '★' : '☆'}
                                                                    
                                                                </div>
                                                            )
                                                        })}
                                                        <div>　( {goods_data.star} ) </div>
                                                    </div>
                                                </div>

                                                <p id='goods_stock_div' className='gray'> 
                                                    최대 구매 가능　|　{price_comma(max_length)} 개 
                                                    {max_length === 0 ? <b style={{ 'color' : '#ec5858' }}>　( 품절 ) </b> : null}    
                                                </p>

                                                <div id='goods_num_div'>
                                                    <div className='pointer goods_plus_minus_buttons' onClick={max_length > 0 ? () => _setGoodsNumber('minus', 'goods_num') : null}
                                                        style={{ 'backgroundImage' : `url(${icon.icon.minus})` }} />

                                                    <div> 
                                                        <input value={goods_num} type='number' max={99999} min={0} name='goods_nums'
                                                               className='goods_change_goods_num_input'
                                                               onChange={max_length > 0 ? () => _setGoodsNumber('change', 'goods_nums') : null}
                                                               readOnly={max_length === 0 ? true : false}
                                                        /> 
                                                    </div>
                                                    <div className='pointer goods_plus_minus_buttons' onClick={max_length > 0 ? () => _setGoodsNumber('plus', 'goods_num') : null}
                                                        style={{ 'backgroundImage' : `url(${icon.icon.plus})` }} />
                                                </div>

                                                <div id='goods_result_price_div' className='aRight'>
                                                    <h2> {price_comma(goods_result_price)}　원 </h2>
                                                </div>

                                                <div id='goods_responsive_other_div' className='aCenter border'>
                                                {max_length !== 0 
                                                ?
                                                add_complate === false ?
                                                    overlap_cart === false 
                                                    ?
                                                    <div className='add_cart_complate_grid_divs'>
                                                        <div className='border_right' onClick={_directBuyGoods}> 바로 구매 </div>
                                                        <div className='goods_add_cart_div' onClick={() => _addCartGoods(null, null)}>  <img src={icon.my_page.cart_plus} alt='' /> 장바구니 </div>
                                                    </div>

                                                    : 
                                                    <div className='overlap_question_div'>
                                                        <div> 
                                                            <p className='font_15 bold red'> 이미 장바구니에 있는 상품입니다. </p> 
                                                            <p className='font_12'> 새로운 내용을 적용하시겠습니까?  </p>
                                                        </div>

                                                        <div className='add_cart_complate_grid_divs'>
                                                            <div className='border_right' onClick={() => _overlapCartData(true, goods_data.id)}> 적　용 </div>
                                                            <div onClick={() => _overlapCartData(false)}> 취　소 </div>
                                                        </div>
                                                    </div>

                                                : <div id='add_cart_responsive_complate_div'>
                                                    <img className='add_cart_complate_icon' id='add_cart_responsive_complate_icon' src={icon.my_page.cart_complate} alt='' /> <h3 className='select_color'> 장바구니에 추가 되었습니다. </h3>
                                                    <div className='add_cart_complate_grid_divs'>
                                                        <div className='border_right' onClick={() => window.location.href='/myPage/cart'} > 장바구니 이동 </div>
                                                        <div onClick={() => this.props.goodsAction.add_complate_cart({ 'bool' : false })}> 계속 쇼핑하기 </div>
                                                    </div>
                                                  </div>

                                                :
                                                    <div  className='goods_sold_out_div' style={{ 'color' : '#ec5858' }}>
                                                        <b> 품절된 상품입니다. </b> 
                                                    </div>
                                                }
                                                </div>
                                            </div>

                                        </div>
                                    </div>

                                <div />
                            </div>

                            <div id='goods_main_other_div' className='bold font_14 aCenter'>
                                <div id='goods_main_grid_div'>
                                    <div onClick={() => _moveScroll('goods_main_content_title')}
                                        className='border_right'
                                        id='first_goods_info'
                                    > 
                                        상품 정보
                                    </div>

                                    <div onClick={() => _moveScroll('goods_main_qna_area')}
                                        className='border_right'
                                        id='second_goods_info'
                                    > 
                                        상품 문의 
                                    </div>

                                    <div onClick={() => _moveScroll('goods_main_review_area')}
                                        className='border_right'
                                        id='third_goods_info'
                                    > 
                                        상품 리뷰 
                                    </div>

                                    <div onClick={() => _moveScroll('goods_main_delivery_area')} 
                                        style={{ 'borderRight' : 'none' }}
                                        id='forth_goods_info'
                                    > 
                                        상세 정보 
                                    </div>
                                </div>
                            </div>
                            
                            <div id='goods_fixed_price_div' className='display_none fixed_goods_other'>
                                <div id='goods_fixed_grid_div'>
                                    <div id='goods_fixed_name_and_price_grid_div'>
                                        <div id='goods_fixed_thumbnail' style={{ 'backgroundImage' : `url(${goods_data.thumbnail})` }} />
                                        <div id='goods_fixed_name_and_price'>
                                            <div id='goods_fixed_name' className='paybook_bold'> <h3> {goods_data.name} </h3> </div>
                                            <div id='goods_fixed_price' className='marginTop_10'> <b> {price_comma(goods_data.result_price)} </b> 원 </div>
                                        </div>
                                    </div>

                                    <div id='goods_fixed_num_grid_div'>
                                        <div id='goods_fixed_num_divs'>
                                            <div id='goods_fixed_num_div'>
                                                <div className='goods_fixed_div pointer bold' id='fixed_minus_div' onClick={max_length > 0 ? () => _setGoodsNumber('minus', 'goods_fixed_num') : null}> － </div>
                                                <div id='goods_fixed_num_input_div'> 
                                                    <input defaultValue={goods_num} type='number' max={99999} min={0} name='goods_fixed_num'
                                                        className='goods_change_goods_num_input aCenter'
                                                        onChange={max_length > 0 ? () => _setGoodsNumber('change', 'goods_fixed_num') : null}
                                                        readOnly={max_length === 0 ? true : false}
                                                    /> 
                                                </div>
                                                <div className='goods_fixed_div pointer bold' onClick={max_length > 0 ? () => _setGoodsNumber('plus', 'goods_fixed_num') : null}> ＋ </div>
                                            </div>

                                            <div id='goods_fixed_result_price_div' className='aRight'> 
                                                <p> 
                                                    최대 구매 가능　|　{price_comma(max_length)} 개 
                                                    {max_length === 0 ? <b style={{ 'color' : '#ec5858' }}>　( 품절 ) </b> : null}     
                                                </p> 
                                                <h3> {price_comma(goods_result_price)}　원 </h3> 
                                            </div>
                                        </div>
                                        
                                    </div>
                                </div>

                                <div id='goods_fixed_other_div' className='paybook_bold'>
                                            {max_length > 0 
                                                ? add_complate === false 
                                                    ? overlap_cart === false

                                                    ?
                                                    <div id='goods_fixed_allow_buy_div' className='goods_other_divs border_top_black border_width_2 bold grid_half marginTop_20' >
                                                        <div className='border_right_black border_width_2 pointer' onClick={_directBuyGoods}> 바로 구매 </div>
                                                        <div className='pointer' onClick={() => _addCartGoods(null, null)}> 장바구니 </div>
                                                    </div>

                                                    : <div id='goods_fixed_overlap_cart_div' className='aCenter marginTop_10 border_top'> 
                                                        <p className='font_15 bold red'> 이미 장바구니에 있는 상품입니다. </p> 
                                                        <p className='font_12'> 새로운 내용을 적용하시겠습니까?  </p>

                                                        <div id='goods_fixed_overlap_select_div' className='grid_half marginTop_20 bold font_14'> 
                                                            <div className='border_right_black border_width_2 pointer' onClick={() => _overlapCartData(true, goods_data.id)}> 적　용 </div>
                                                            <div className='pointer' onClick={() => _overlapCartData(false)}> 취　소 </div>
                                                        </div>
                                                      </div>
                                                
                                                : <div id='goods_fixed_complate_add_cart' className='border_top'> 
                                                    <h4 className='select_color'> 장바구니에 추가 되었습니다. </h4>
                                                    <div id='goods_fixed_complate_grid_div' className='add_cart_complate_grid_divs'>
                                                        <div className='border_right_black border_width_2 pointer' onClick={() => window.location.href='/myPage/cart'} > 장바구니 이동 </div>
                                                        <div className='pointer' onClick={() => this.props.goodsAction.add_complate_cart({ 'bool' : false })}> 계속 쇼핑하기 </div>
                                                    </div>
                                                  </div>


                                            : <div id='goods_fixed_disable_but_div' className='goods_other_divs bold aCenter marginTop_20 goods_sold_out_div'
                                                   style={{ 'color' : '#ec5858' }}>
                                                    품절된 상품입니다.
                                              </div>
                                                    
                                            }
                                    </div>
                            </div>

                            <div id='goods_fixed_toggle_div' className='display_none pointer font_13 kotra_bold_font'
                                 onClick={() => _toggleFixedInfo()}
                            >
                                {open_fixed === false ? "▼ 상품 구매창 열기" : "▲ 상품 구매창 닫기"}
                            </div>

                            <div id='goods_main_div'>
                                <div id='goods_main_contents_div' className='border_top'>
                                    <h3 className='goods_info_title' id='goods_main_content_title'> 상품 정보 </h3> 
                                    {img_where === 'top'
                                    
                                    ? <div style={{ 'padding' : '0px 40px 0px 40px' }}>
                                        <div className='goods_bonus_img_div'>
                                            {img_arr.map( (el, key) => {

                                                if(el !== "") {
                                                    return(
                                                        <div key={key}>
                                                            <img src={el} alt='' />
                                                        </div>
                                                    )

                                                } else {
                                                    return(
                                                        null
                                                    )
                                                }
                                            })}
                                        </div>
                                        <div className='goods_contents_div aCenter'
                                            dangerouslySetInnerHTML={ {__html: contents} } />
                                    </div>
                                
                                    : <div>
                                        <div className='goods_contents_div aCenter'
                                            dangerouslySetInnerHTML={ {__html: contents} } />

                                        <div className='goods_bonus_img_div'>
                                            {img_arr.map( (el, key) => {

                                                return(
                                                    el !== ""
                                                    ?  <div key={key}>
                                                        <img src={el} alt='' />
                                                      </div>

                                                    : null
                                                )
                                            })}
                                        </div>
                                    </div>
                                }
                                </div>

                                <div id='goods_main_qna_area' className='goods_main_area'/> 
                                <div id='goods_main_qna_div' className='goods_info_divs goods_qna_review_main_div'>
                                    <h3 className='goods_info_title' id='goods_main_qna_title'> 상품 문의 </h3> 

                                    <div id='goods_qna_contents_div'>
                                        <div id='goods_qna_other_div' className='aRight'>
                                            <input type='button' value='상품 문의하기' id='goods_qna_write_button' className='goods_write_button button_style_1 paybook_bold'
                                                   onClick={() => QandA_write === false ? _toggleWrite('qna', true) : _toggleWrite('qna', false)}
                                            />
                                        </div>

                                        {(QandA_info.length > 0 && QandA_length > 0) || (qry.filter_1 || qry.filter_2)
                                        ?
                                        <div id='goods_qna_filter_div'>
                                            <div> 
                                                <u title='답변이 완료된 문의글만 검색합니다.' className='pointer'
                                                    onClick={() => qry['filter_2'] !== '1' ? _qnaFilter('2', qry, true, 'qna') : _qnaFilter('2', qry, false, 'qna')}
                                                    className={qry['filter_2'] !== '1' ? 'pointer' : 'pointer  bold custom_color_1' }
                                                > 
                                                    답변 완료된 글만 
                                                </u> 
                                            </div>

                                            {user_info ?
                                                <div> 
                                                    <u title='내가 작성한 문의글만 검색합니다.'
                                                        onClick={() => qry['filter_1'] !== '1' ? _qnaFilter('1', qry, true, 'qna') : _qnaFilter('1', qry, false, 'qna')}
                                                        className={qry['filter_1'] !== '1' ? 'pointer' : 'pointer  bold custom_color_1' }
                                                    > 
                                                        내가 작성한 글만 
                                                    </u> 
                                                </div>
                                            : null}

                                            <div> 
                                                <img alt='' id='goods_qna_filter_icon' src={icon.icon[qna_filter_img]} title='검색 필터' /> 
                                            </div>
                                        </div>
                                        : null}

                                        {qry.filter_1 || qry.filter_2
                                        ?
                                        <div className='goods_qna_and_review_filter_info_div'>
                                            <p className='font_14 recipe_korea'> ▼　적용중인 필터 옵션 
                                                <img src={icon.icon.reload} className='pointer goods_qna_filter_reload_icon' title='적용중인 모든 필터를 삭제합니다.' alt=''
                                                     onClick={() => window.confirm('모든 필터 옵션을 삭제하시겠습니까?') ? _qnaFilter('1', qry, false, 'qna', true) : null}
                                                />  
                                            </p>

                                            <ul className='font_13'>
                                                {qry.filter_1 ? <li> 내가 작성한 글만 보기 <img alt='' src={icon.icon.close_black} className='pointer goods_qna_filter_remove_icon' title='필터 제거' onClick={() => _qnaFilter('1', qry, false, 'qna')} /> </li> : null}
                                                {qry.filter_2 ? <li> 답변 완료된 글만 보기 <img alt='' src={icon.icon.close_black} className='pointer goods_qna_filter_remove_icon' title='필터 제거' onClick={() => _qnaFilter('2', qry, false, 'qna')} /> </li> : null}
                                            </ul>
                                        </div>

                                        : null }

                                        <div className='goods_qna_paing_div'>
                                            <Paging 
                                                // show_cnt={1}
                                                paging_cnt={QandA_length}
                                                paging_show={10}
                                                page_name='qna_page'
                                                _filterURL={_filterURL}
                                                qry={qry}
                                            />
                                        </div>

                                        {QandA_info.length > 0 && QandA_length > 0
                                            ? <div className='bold font_14 paybook_bold' id='goods_qna_length_div'> 총 <b className='custom_color_1'> {QandA_length} </b> 개의 Q & A 가 있습니다. </div>
                                            : null
                                        }

                                        <div id='goods_qna_info_list_div'>
                                        {QandA_info.length > 0
                                            ? <div id='goods_qna_list' className='goods_qna_review_list'> 
                                                {QandA_info.map( (el, key) => {
                                                    let state = '대기중';
                                                    let anwser = '답변을 기다리고 있습니다.';

                                                    if(el.answer) {
                                                        state = '답변 완료';
                                                        anwser = el.answer
                                                    }

                                                    let class_col = 'qna_review_data_list_grid_div pointer ';
                                                    if(user_info.id === el.user_id) {
                                                        class_col += 'my_qna_style ';
                                                    }

                                                    const now_select = QandA_select === el.id;
                                                    if(now_select) {
                                                        class_col += 'select_qna_list'
                                                    }

                                                    return(
                                                        <div key={key} className={QandA_select !== null && now_select === false ? 'qna_data_list_div gray' : 'qna_data_list_div'} 
                                                            style={QandA_info.length !== (key + 1) 
                                                                ? now_select ? { 'borderBottom' : 'solid 5px black' } 
                                                                             : { 'borderBottom' : 'dotted 1px black' } 
                                                                : null}
                                                        >
                                                            <div className={class_col}
                                                                 onClick={() => now_select === false ? _selectQandA(el, true)
                                                                                                     : _selectQandA(el, false)
                                                                }
                                                            >
                                                                <div className='qna_data_list_grid_title_div'> 
                                                                    {el.secret_state === 1 
                                                                        ? <img src={icon.icon.lock} className='qna_data_list_secret_icon' title='비밀글입니다. (작성자와 관리자만 볼 수 있습니다.)' alt=''/> 
                                                                        : null}
                                                                    {el.title}
                                                                </div>
                                                                
                                                                <div className='qna_data_list_other_div gray font_14'>
                                                                    <div className='aRight qna_date_list_div'> {el.create_date.slice(0, 10)} </div>
                                                                    <div className='aRight qna_data_list_state_div'
                                                                        style={el.answer ? { 'fontWeight' : 'bold', 'color' : '#35c5f0' } : null }
                                                                    > 
                                                                        {state} 
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            
                                                            {now_select 
                                                            ? <div className='qna_data_list_detail_div' id={'qna_data_list_detail_' + el.id}>
                                                                <div className='qna_data_list_detail_question_div'>
                                                                    <div className='qna_data_list_detail_title_div bold paybook_bold'
                                                                         style={{ 'backgroundColor' : '#bee5d3' }}
                                                                    > 
                                                                        <p> Q. </p> 
                                                                    </div>
                                                                    <div className='qna_data_list_detail_contents_div' dangerouslySetInnerHTML={{ __html : el.contents }} />
                                                                </div>
                                                                
                                                                <div className='qna_data_list_detail_question_div' style={{ 'borderTop' : 'dotted 1px #ababab' }}>
                                                                    <div className='qna_data_list_detail_title_div bold paybook_bold'
                                                                         style={{ 'backgroundColor' : '#6f9eaf' }}
                                                                         onClick={() => !el.answer && user_info.admin === 'Y' ? () => _addAnswer(el, goods_id) : null}
                                                                    > 
                                                                        <p> A. </p> 
                                                                    </div>

                                                                    {user_info && !el.answer
                                                                        ?
                                                                        user_info.admin === 'N' ?
                                                                        
                                                                            <div className='qna_data_list_detail_contents_div' 
                                                                                dangerouslySetInnerHTML={{ __html : anwser }} 
                                                                                style={!el.answer ? { 'color' : '#ababab' } : null }
                                                                            />

                                                                                                :   
                                                                                                <textarea name='qna_answer_textbox' maxLength='300' id='qna_answer_textbox'/> 
                                                                                                    // <div className='qna_anwser_grid_div'>
                                                                                                    //     <div> </div>
                                                                                                    //     <div> <input type='button' value='등록' id='qna_answer_button' /> </div>
                                                                                                    // </div>
                                                                        
                                                                        : <div className='qna_data_list_detail_contents_div' 
                                                                                dangerouslySetInnerHTML={{ __html : anwser }} 
                                                                                style={!el.answer ? { 'color' : '#ababab' } : null }
                                                                            />
                                                                    }
                                                                    
                                                                </div>

                                                                {user_info.id === el.user_id || user_info.admin === 'Y'
                                                                    ?
                                                                    <div className='qna_data_list_remove_div'
                                                                        style={!el.answer && user_info.admin === 'Y' 
                                                                                ? { 'gridTemplateColumns' : '50% 50%' } 
                                                                                : { 'display' : 'block' }
                                                                        }
                                                                    >
                                                                        {!el.answer && user_info.admin === 'Y' ?
                                                                            <div> <b className='pointer' onClick={() => _addAnswer(el, goods_id)}> 답변 등록 </b> </div>
                                                                        : null}

                                                                        <div className='aRight'> <b className='pointer' onClick={() => _removeQandA(el, goods_id)}> 문의글 삭제 </b> </div>
                                                                    </div>
                                                                    
                                                                    : null
                                                                }

                                                                {/* <div className='qna_data_detail_close_div white aCenter pointer'
                                                                     onClick={() => _selectQandA(el, false)}
                                                                >
                                                                    ▲ 닫기 
                                                                </div> */}

                                                              </div>

                                                            : null}
                                                        </div>
                                                    )
                                                })}
                                              </div>
                                            
                                            : <div id='goods_qna_empty_div' className='aCenter'> 
                                                <h2 className='recipe_korea'> 문의된 정보가 없습니다. </h2>
                                                <p className='font_14 paybook_bold'> 
                                                    <u className='pointer' onClick={() => QandA_write === false ? _toggleWrite('qna', true) : _toggleWrite('qna', false)}> 
                                                        처음으로 문의해보세요! 
                                                    </u> 
                                                </p>
                                              </div>
                                        }
                                        </div>

                                        <div id='goods_qna_write_div'>
                                            {QandA_write === true 
                                            ? <div id='goods_qna_write_content_div'>
                                                <h3 id='goods_qna_write_title' className='custom_color_1 recipe_korea'> 문의 작성 </h3>

                                                <form name='goods_qna_write' onSubmit={_writeQnA}>
                                                    <div id='goods_qna_wirte_title_div'>
                                                        <div className='paybook_bold'> 제목　|　 </div>
                                                        <div> 
                                                            <input type='text' placeholder='제목을 입력해주세요.' maxLength='30' name='qna_title' /> 
                                                        </div>
                                                    </div>

                                                    <div id='goods_qna_write_contents_div'>
                                                        <div id='goods_qna_write_contents_title' className='paybook_bold'> 내용　|　</div>
                                                        <div> 
                                                            <textarea id='goods_qna_contents_box' name='qna_contents' maxLength='300' defaultValue={QandA_contents} 
                                                                      onChange={() => _checkStringLength('qna_contents')}
                                                            />
                                                            <div id='goods_qna_contents_check_str_length_div' className='aRight'> {QandA_contents.length} / 300 </div>
                                                        </div>
                                                    </div>

                                                    <div id='goods_qna_secret_div' className='black bold'> 
                                                        <input type='checkbox' id='goods_qna_secret_button' name='qna_secret' className='check_custom_1'
                                                               title='관리자만 문의글을 읽을 수 있습니다.' onClick={() => _checkStringLength('qna_secret')}
                                                            // onClick={() => _sameDeliveryInfo(!order_same_info_bool)} defaultChecked={order_same_info_bool}
                                                        />
                                                        <span className='check_toggle_1' onClick={() => _checkStringLength('qna_secret')}> </span>
                                                        <label htmlFor='goods_qna_secret_button' className='pointer font_13 kotra_bold_font' id='goods_qna_secret_label'
                                                               style={QandA_secret === true ? { 'color' : '#35c5f0' } : { 'color' : 'black' } }
                                                        > 
                                                            　비밀글 (관리자만 보기)
                                                        </label>
                                                    </div>
                                                    <input type='submit' value='작성' id='goods_qna_write_submit' className='pointer recipe_korea'/>
                                                </form>
                                              </div>

                                            : null}
                                        </div>
                                    </div>

                                        {QandA_info.length > 6 ? 
                                            <div className='goods_qna_paing_div'>
                                                <Paging 
                                                    // show_cnt={1}
                                                    paging_cnt={QandA_length}
                                                    paging_show={10}
                                                    page_name='qna_page'
                                                    _filterURL={_filterURL}
                                                    qry={qry}
                                                />
                                            </div>
                                        : null}
                                </div>
                                <div id='goods_other_qna' />

                                <div id='goods_main_review_area' className='goods_main_area'/> 
                                <div id='goods_main_review_div' className='goods_info_divs goods_qna_review_main_div'>
                                    <h3 className='goods_info_title' id='goods_main_review_title'> 상품 리뷰 </h3> 

                                    <div id='goods_review_div'>
                                        <div className='aRight'>
                                            <input type='button' value='리뷰 작성' id='goods_review_write_button' className='goods_write_button button_style_1 paybook_bold' 
                                                   onClick={() => _toggleWrite('review', null, goods_id)}
                                            />
                                        </div>

                                        <div id='goods_review_filter_div'>
                                            {user_info
                                            ? 
                                                <div> 
                                                    <u 
                                                        title='내가 쓴 리뷰만 조회합니다.'
                                                        onClick={() => qry['filter_3'] !== '1' ? _qnaFilter('3', qry, true, 'review') : _qnaFilter('3', qry, false, 'review')}
                                                        className={qry['filter_3'] !== '1' ? 'pointer paybook_bold' : 'pointer  bold custom_color_1 paybook_bold' }
                                                    > 
                                                        내가 쓴 리뷰 보기 
                                                    </u> 
                                                </div>
                                            : null}

                                            <div>
                                                <select className='pointer font_13 paybook_bold' id='goods_review_filter_selector'
                                                        onChange={(event) => _selectReviewFilter(event, qry)} name='review_filter_select'
                                                        defaultValue={review_filter}
                                                >
                                                    <option value='null'> - 별점 옵션 - </option>
                                                    <option value='4'> 높은 별점 순으로 </option>
                                                    <option value='5'> 낮은 별점 순으로 </option>
                                                </select>
                                            </div>
                                        </div>

                                        {qry.filter_3 || (qry.filter_4 || qry.filter_5)
                                            ?
                                            <div className='goods_qna_and_review_filter_info_div font_14'>
                                                <p className='font_14 recipe_korea'> ▼　적용중인 필터 옵션 
                                                    <img src={icon.icon.reload} className='goods_qna_filter_reload_icon pointer' title='적용중인 모든 필터를 삭제합니다.' alt=''
                                                        onClick={() => window.confirm('모든 필터 옵션을 삭제하시겠습니까?') ? _qnaFilter('3', qry, false, 'review', true) : null}
                                                    />  
                                                </p>

                                                <ul className='font_13'>
                                                    {qry.filter_3 ? <li> 내가 쓴 리뷰 보기 <img alt='' src={icon.icon.close_black} className='pointer goods_qna_filter_remove_icon' title='필터 제거' onClick={() => _qnaFilter('3', qry, false, 'review')} /> </li> : null}
                                                    {qry.filter_4 ? <li> 높은 별점 순으로 <img alt='' src={icon.icon.close_black} className='pointer goods_qna_filter_remove_icon' title='필터 제거' onClick={() => _qnaFilter('4', qry, false, 'review')} /> </li> : null}
                                                    {qry.filter_5 ? <li> 낮은 별점 순으로 <img alt='' src={icon.icon.close_black} className='pointer goods_qna_filter_remove_icon' title='필터 제거' onClick={() => _qnaFilter('5', qry, false, 'review')} /> </li> : null}
                                                </ul>
                                            </div>

                                            : null
                                        }

                                        {review_length !== 0 && review_info.length > 0
                                            ? <div id='goods_review_list_div'>

                                                <div className='goods_qna_paing_div'>
                                                    <Paging 
                                                        // show_cnt={1}
                                                        paging_cnt={review_length}
                                                        paging_show={10}
                                                        page_name='review_page'
                                                        _filterURL={_filterURL}
                                                        qry={qry}
                                                    />
                                                </div>

                                                <p className='bold font_14' id='goods_review_length_title'> 총 {review_length} 개의 리뷰가 있습니다. </p>

                                                <div id='goods_review_list' className='goods_qna_review_list'>
                                                {review_info.map( (el, key) => {
                                                    const star_arr = [1, 2, 3, 4, 5];

                                                    let class_col = 'qna_review_data_list_grid_div pointer ';
                                                    if(user_info.id === el.user_id) {
                                                        class_col += 'my_qna_style ';
                                                    }

                                                    const select_review = review_select === el.id;

                                                    if(review_select !== null) {
                                                        if(select_review === false) {
                                                            class_col += 'gray ';

                                                        } else {
                                                            class_col += 'select_qna_list ';
                                                        }
                                                    }

                                                    return(
                                                        <div key={key}
                                                            style={review_info.length > (key + 1) 
                                                                ? { 'borderBottom' : 'dotted 1px black' }
                                                                : null
                                                            }
                                                        >
                                                            <div className={class_col}
                                                                onClick={() => select_review ? this.props.goodsAction.save_review_data({ 'select' : null })
                                                                                             : this.props.goodsAction.save_review_data({ 'select' : el.id })
                                                                }
                                                            >
                                                                <div className='qna_data_list_grid_title_div'
                                                                    dangerouslySetInnerHTML={{ __html : el.title }} 
                                                                /> 
                                                                
                                                                <div className='qna_data_list_other_div gray font_14'>
                                                                    <div className='aRight goods_review_star_div'> 
                                                                        {star_arr.map( (cu) => {
                                                                            const star = Number(el.score) >= Number(cu) ? '★' : '☆';
                                                                            
                                                                            return(
                                                                                <div className='review_star_div' key={cu}
                                                                                    style={ Number(el.score) >= Number(cu) ? { 'color' : 'rgb(253, 184, 39)' } : null }
                                                                                    dangerouslySetInnerHTML={{ __html : star }}
                                                                                />
                                                                            )
                                                                        })}
                                                                    </div>

                                                                    <div className='aRight goods_review_date_div' 
                                                                        dangerouslySetInnerHTML={{ __html : el.create_date.slice(0, 10) }}
                                                                    />
                                                                </div>
                                                            </div>
                                                            
                                                            {select_review === true
                                                            ?   <div className='goods_review_contents_div font_14'>
                                                                    <div dangerouslySetInnerHTML={{ __html : el.contents }} />

                                                                    {user_info.id === el.user_id || user_info.admin === 'Y'
                                                                    ? <div className='goods_review_remove_div'>
                                                                        <input type='button' value='리뷰 삭제' className='pointer' 
                                                                               onClick={() => _removeReviewFn(el.id, el.goods_id, el.score, el.user_id)}
                                                                        />
                                                                      </div>

                                                                    : null}
                                                                </div>

                                                            : null}
                                                        </div>
                                                    )
                                                })}
                                                </div>

                                              </div>

                                            : <div id='goods_review_empty_div' className='aCenter'>
                                                <h2 className='recipe_korea'> 작성된 리뷰가 없습니다. </h2>
                                                <p className='font_14 paybook_bold'> 
                                                    <u className='pointer' onClick={() => _toggleWrite('review', null, goods_id)}> 
                                                        처음으로 리뷰를 작성해보세요! 
                                                    </u> 
                                                </p>
                                            </div>
                                        }
                                    </div>
                                </div>
                                <div id='goods_other_review' />


                                <div id='goods_main_delivery_area' className='goods_main_area'/> 
                                <div id='goods_main_delivery_div' className='goods_info_divs'>
                                    <h3 className='goods_info_title' id='goods_main_delivery_title'> 상세 정보 </h3> 

                                    <div id='goods_main_delivery_info_div'>
                                        <div className='goods_main_paybook_info_div'>
                                            <h3 className='kotra_bold_font'> 결제 및 상품 정보</h3>

                                            <ul className='goods_main_info_div'>
                                                <li> 세준몰에서 결제를 통한 모든 과정에서는 실제로 결제되지 않습니다.  </li>
                                                <li> 상품의 재고에 따라서 매진이 될 수 있습니다. </li>
                                                <li> 구매한 상품의 주문건을 확정하면 상품에 대한 리뷰를 작성할 수 있습니다. </li>
                                                <li> 대량 구매 방지를 위해 상품 별로 구매 1회 당 최대 구매 갯수가 <b className='orange'> 5 개로 제한</b>됩니다. </li>
                                            </ul>
                                        </div>

                                        <div className='goods_main_paybook_info_div'>
                                            <h3 className='kotra_bold_font'> 배송 정보</h3>

                                            <ul className='goods_main_info_div'>
                                                <li> 세준몰에서 구매한 모든 상품은 실제로 배송이 되지 않습니다.  </li>
                                                <li> 배송중인 상품에 대해서는 <u> 상품 취소가 불가능 </u>합니다. </li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                      </div>
                }
            </div>
        )
    }
}

Goods.defaultProps = {
  }
  
  export default connect(
    (state) => ({
        user_info : state.config.user_info,
        first_move : state.config.first_move,
        goods_loading : state.goods.goods_loading,
        goods_data : state.goods.goods_data,
        like_state : state.goods.like_state,
        like_loading : state.goods.like_loading,
        goods_result_price : state.goods.goods_result_price,
        goods_num : state.goods.goods_num,
        overlap_cart : state.goods.overlap_cart,
        save_overlap_id : state.goods.save_overlap_id,
        add_complate : state.goods.add_complate,
        open_fixed : state.goods.open_fixed,
        QandA_info : state.goods.QandA_info,
        QandA_write : state.goods.QandA_write,
        QandA_contents : state.goods.QandA_contents,
        QandA_secret : state.goods.QandA_secret,
        QandA_select : state.goods.QandA_select,
        QandA_length : state.goods.QandA_length,
        review_info : state.goods.review_info,
        review_length : state.goods.review_length,
        review_select : state.goods.review_select,
    }), 
  
    (dispatch) => ({
      goodsAction : bindActionCreators(goodsAction, dispatch),
      configAction : bindActionCreators(configAction, dispatch),
      signupAction : bindActionCreators(signupAction, dispatch)
    })
  )(Goods);