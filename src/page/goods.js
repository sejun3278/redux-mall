import React, { Component } from 'react';
import axios from 'axios';
import queryString from 'query-string';

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import * as goodsAction from '../Store/modules/goods';
import * as configAction from '../Store/modules/config';

import '../css/goods.css';

import { Loading } from './index';
import $ from 'jquery';
import icon from '../source/img/icon.json';
import URL from '../config/url';

let fade_alert;
class Goods extends Component {

    async componentDidMount () {
        const qry = queryString.parse(this.props.location.search);
        const goods_num = qry.goods_num;
        const { goodsAction } = this.props;

        // $('html').css({ 'height' : '3000px' })
        // this._setScrollSize();
        window.addEventListener("scroll", this._setScrollSize);
        window.addEventListener("resize", this._setScreenWitdhEvent); // 화면 가로 크기

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
        window.removeEventListener("resize", this._setScreenWitdhEvent);

    }

    // 가로형
    _setScreenWitdhEvent = (overlap, complate) => {
        // const width_size = document.body.offsetWidth;
        
        // if(width_size <= 850 && width_size > 550) {
        //     if(overlap === true) {
        //         $('#goods_contents_grid_div').css({ 'paddingBottom' : '200px' })

        //     } else if(complate === true) {
        //         $('#goods_contents_grid_div').css({ 'paddingBottom' : '150px' })

        //     } else {
        //         $('#goods_contents_grid_div').css({ 'paddingBottom' : '90px' })
        //     }
        // }
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

        let bonus = 0;
        const target_arr = ['goods_main_qna_title', 'goods_main_review_title', 'goods_main_delivery_title']
        if(target_arr.includes(target)) {
            // bonus = -120;
        }
        const height = origin_height + bonus;

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

            // console.log(get_data.data[0])
            if(get_data.data[0].length !== 0) {
                goodsAction.set_like_state({ 'obj' : JSON.stringify(get_data.data[0]) })

            } else {
                goodsAction.set_like_state({ 'obj' : false })
            }
        }

        return true;
    }

    // 상품 찜하기
    _likeGoods = async () => {
        const { _modalToggle, goodsAction, like_loading, like_state } = this.props;
        const user_info = JSON.parse(this.props.user_info);
        const goods_data = JSON.parse(this.props.goods_data);

        const cover_like_state = like_state !== false ? JSON.parse(like_state) : false;
        // $('.like_alert').fadeOut(300)

        if(like_loading === false) {
            // const login_check = await _getCookie('login', 'get');
            if(!user_info) {
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

        if(goods_num > goods_data.stock) {
            goods_num = goods_data.stock;
            
        } else if(goods_num < 0) {
            goods_num = 0;
        }

        goods_result_price = goods_num * goods_data.result_price;

        $('.goods_change_goods_num_input').val(goods_num)
        return goodsAction.set_goods_num({ 'num' : Number(goods_num), 'price' : Number(goods_result_price) })
    }

    // 장바구니 추가
    _addCartGoods = async (stock_check, define_check, stop, update) => {
        const { like_loading, goods_num, goodsAction, _getCookie, _modalToggle } = this.props;
        const user_info = JSON.parse(this.props.user_info);
        const user_cookie = _getCookie('login', 'get');

        const goods_data = JSON.parse(this.props.goods_data);

        if(!user_info || !user_cookie) {
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
            console.log(obj)
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
            const disable = query_result.data[0][0].state;

            let stop_result = false;
            if(stock > 0 && disable === 1) {
                // 재고가 있거나 구매 가능한 상품
                if(stop) {
                    return stop_result
                }

                return this._addCartGoods(true, null);

            } else {
                if(Number(goods_num) > stock) {
                    alert(stock + ' 개 까지 구매할 수 있습니다.');
                    stop_result = true;

                } else if(Number(stock) <= 0) {
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

                    this._setScreenWitdhEvent(true);
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

            this._setScreenWitdhEvent(false, true);

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

            this._setScreenWitdhEvent(false, false)
            return this.props.goodsAction.add_complate_cart({ 'bool' : false });
        }
    }

    _changeOtherDivHeight = (height) => {
        const width_size = document.body.offsetWidth;
        
        if(width_size <= 850 && width_size >= 550) {
            $('#goods_contents_grid_div').css({ 'paddingBottom' :  height + 'px' })
        }
    }

    // 바로 구매
    _directBuyGoods = async () => {
        const { _loginCookieCheck, _getCookie, } = this.props;
        const { _getGoodsData, _addCartData } = this;

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

        if(goods_num > goods_info.stock) {
            alert('재고가 부족합니다. \n'+ goods_info.stock + ' 개 까지 구매할 수 있습니다.');

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

        await _getCookie('order', 'add', JSON.stringify(save_cookie), { 'time' : 60 } );

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

    render() {
        const { goods_loading, _searchCategoryName, _pageMove, price_comma, like_state, goods_result_price, goods_num, overlap_cart, add_complate, open_fixed } = this.props;
        const goods_data = JSON.parse(this.props.goods_data);
        const { _likeGoods, _likeMouseToggle, _setGoodsNumber, _moveScroll, _addCartGoods, _overlapCartData, _toggleFixedInfo, _clickComplateButton, _directBuyGoods } = this;
        
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

        return(
            <div id='goods_div'>
                {!goods_loading
                    ? <Loading />

                    : <div id='goods_home_div'>
                        <div id='goods_category_info_div' className='border_bottom'> 
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
                            <h4 id='goods_title_div'> {goods_data.name} </h4>

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
                                                <p id='goods_stock_div' className='gray'> 
                                                    최대 구매 가능　|　{price_comma(goods_data.stock)} 개 
                                                    {goods_data.stock === 0 ? <b style={{ 'color' : '#ec5858' }}>　( 품절 ) </b> : null}    
                                                </p>

                                                <div id='goods_num_div'>
                                                    <div className='pointer bold' onClick={goods_data.stock > 0 ? () => _setGoodsNumber('minus', 'goods_num') : null}> － </div>
                                                    <div> 
                                                        <input defaultValue={goods_num} type='number' max={99999} min={0} name='goods_num'
                                                               className='goods_change_goods_num_input'
                                                               onChange={goods_data.stock > 0 ? () => _setGoodsNumber('change', 'goods_num') : null}
                                                               readOnly={goods_data.stock === 0 ? true : false}
                                                        /> 
                                                    </div>
                                                    <div className='pointer bold' onClick={goods_data.stock > 0 ? () => _setGoodsNumber('plus', 'goods_num') : null}> ＋ </div>
                                                </div>

                                                <div id='goods_result_price_div' className='aRight'>
                                                    <h2> {price_comma(goods_result_price)}　원 </h2>
                                                </div>
                                            </div>

                                            <div id='goods_other_div' className='aCenter border'>
                                                {goods_data.stock !== 0 
                                                ?
                                                add_complate === false ?
                                                    overlap_cart === false 
                                                    ?
                                                    <div id='default_add_cart_grid_div' className='add_cart_complate_grid_divs'>
                                                        <div className='border_right' onClick={_directBuyGoods}> 바로 구매 </div>
                                                        <div className='goods_add_cart_div' onClick={() => _addCartGoods(null, null)}> <img src={icon.my_page.cart_plus} /> 장바구니 </div>
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
                                                    <img className='add_cart_complate_icon' src={icon.my_page.cart_complate} /> <h3 className='select_color'> 장바구니에 추가 되었습니다. </h3>
                                                    <div className='add_cart_complate_grid_divs'>
                                                        <div className='border_right' onClick={() => _clickComplateButton('move')} > 장바구니 이동 </div>
                                                        <div onClick={() => _clickComplateButton('close')}> 계속 쇼핑하기 </div>
                                                    </div>
                                                  </div>

                                                :
                                                    <div style={{ 'color' : '#ec5858' }}>
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
                                                <p id='goods_stock_div' className='gray'> 
                                                    최대 구매 가능　|　{price_comma(goods_data.stock)} 개 
                                                    {goods_data.stock === 0 ? <b style={{ 'color' : '#ec5858' }}>　( 품절 ) </b> : null}    
                                                </p>

                                                <div id='goods_num_div'>
                                                    <div className='pointer bold' onClick={goods_data.stock > 0 ? () => _setGoodsNumber('minus', 'goods_nums') : null}> － </div>
                                                    <div> 
                                                        <input value={goods_num} type='number' max={99999} min={0} name='goods_nums'
                                                               className='goods_change_goods_num_input'
                                                               onChange={goods_data.stock > 0 ? () => _setGoodsNumber('change', 'goods_nums') : null}
                                                               readOnly={goods_data.stock === 0 ? true : false}
                                                        /> 
                                                    </div>
                                                    <div className='pointer bold' onClick={goods_data.stock > 0 ? () => _setGoodsNumber('plus', 'goods_nums') : null}> ＋ </div>
                                                </div>

                                                <div id='goods_result_price_div' className='aRight'>
                                                    <h2> {price_comma(goods_result_price)}　원 </h2>
                                                </div>

                                                <div id='goods_responsive_other_div' className='aCenter border'>
                                                {goods_data.stock !== 0 
                                                ?
                                                add_complate === false ?
                                                    overlap_cart === false 
                                                    ?
                                                    <div className='add_cart_complate_grid_divs'>
                                                        <div className='border_right' onClick={_directBuyGoods}> 바로 구매 </div>
                                                        <div className='goods_add_cart_div' onClick={() => _addCartGoods(null, null)}>  <img src={icon.my_page.cart_plus} /> 장바구니 </div>
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
                                                    <img className='add_cart_complate_icon' id='add_cart_responsive_complate_icon' src={icon.my_page.cart_complate} /> <h3 className='select_color'> 장바구니에 추가 되었습니다. </h3>
                                                    <div className='add_cart_complate_grid_divs'>
                                                        <div className='border_right' onClick={() => window.location.href='/myPage/cart'} > 장바구니 이동 </div>
                                                        <div onClick={() => this.props.goodsAction.add_complate_cart({ 'bool' : false })}> 계속 쇼핑하기 </div>
                                                    </div>
                                                  </div>

                                                :
                                                    <div style={{ 'color' : '#ec5858' }}>
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
                                        배송 정보 
                                    </div>
                                </div>
                            </div>
                            
                            <div id='goods_fixed_price_div' className='display_none fixed_goods_other'>
                                <div id='goods_fixed_grid_div'>
                                    <div id='goods_fixed_name_and_price_grid_div'>
                                        <div id='goods_fixed_thumbnail' style={{ 'backgroundImage' : `url(${goods_data.thumbnail})` }} />
                                        <div id='goods_fixed_name_and_price'>
                                            <div id='goods_fixed_name'> <h3> {goods_data.name} </h3> </div>
                                            <div id='goods_fixed_price' className='marginTop_10'> <b> {price_comma(goods_data.result_price)} </b> 원 </div>
                                        </div>
                                    </div>

                                    <div id='goods_fixed_num_grid_div'>
                                        <div id='goods_fixed_num_divs'>
                                            <div id='goods_fixed_num_div'>
                                                <div className='goods_fixed_div pointer bold' id='fixed_minus_div' onClick={goods_data.stock > 0 ? () => _setGoodsNumber('minus', 'goods_fixed_num') : null}> － </div>
                                                <div id='goods_fixed_num_input_div'> 
                                                    <input defaultValue={goods_num} type='number' max={99999} min={0} name='goods_fixed_num'
                                                        className='goods_change_goods_num_input aCenter'
                                                        onChange={goods_data.stock > 0 ? () => _setGoodsNumber('change', 'goods_fixed_num') : null}
                                                        readOnly={goods_data.stock === 0 ? true : false}
                                                    /> 
                                                </div>
                                                <div className='goods_fixed_div pointer bold' onClick={goods_data.stock > 0 ? () => _setGoodsNumber('plus', 'goods_fixed_num') : null}> ＋ </div>
                                            </div>

                                            <div id='goods_fixed_result_price_div' className='aRight'> 
                                                <p> 
                                                    최대 구매 가능　|　{price_comma(goods_data.stock)} 개 
                                                    {goods_data.stock === 0 ? <b style={{ 'color' : '#ec5858' }}>　( 품절 ) </b> : null}     
                                                </p> 
                                                <h3> {price_comma(goods_result_price)}　원 </h3> 
                                            </div>
                                        </div>
                                        
                                    </div>
                                </div>

                                <div id='goods_fixed_other_div'>
                                            {goods_data.stock > 0 
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


                                            : <div id='goods_fixed_disable_but_div' className='goods_other_divs bold aCenter marginTop_20' 
                                                   style={{ 'color' : '#ec5858' }}>
                                                    품절된 상품입니다.
                                              </div>
                                                    
                                            }
                                    </div>
                            </div>

                            <div id='goods_fixed_toggle_div' className='display_none pointer font_13'
                                 onClick={() => _toggleFixedInfo()}
                            >
                                {open_fixed === false ? "▼ 상품 구매창 열기" : "▲ 상품 구매창 닫기"}
                            </div>

                            <div id='goods_main_div'>
                                <div id='goods_main_contents_div' className='border_top'>
                                    <h3 className='goods_info_title' id='goods_main_content_title'> 상품 정보 </h3> 
                                    {img_where === 'top'
                                    
                                    ? <div>
                                        <div className='goods_bonus_img_div'>
                                            {img_arr.map( (el, key) => {

                                                if(el !== "") {
                                                    return(
                                                        <div key={key}>
                                                            <img src={el} />
                                                        </div>
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

                                                if(el !== "") {
                                                    return(
                                                        <div key={key}>
                                                            <img src={el} />
                                                        </div>
                                                    )
                                                }
                                            })}
                                        </div>
                                    </div>
                                }
                                </div>

                                <div id='goods_main_qna_area' className='goods_main_area'/> 
                                <div id='goods_main_qna_div' className='goods_info_divs'>
                                    <h3 className='goods_info_title' id='goods_main_qna_title'> 상품 문의 </h3> 
                                </div>

                                <div id='goods_main_review_area' className='goods_main_area'/> 
                                <div id='goods_main_review_div' className='goods_info_divs'>
                                    <h3 className='goods_info_title' id='goods_main_review_title'> 상품 리뷰 </h3> 
                                </div>

                                <div id='goods_main_delivery_area' className='goods_main_area'/> 
                                <div id='goods_main_delivery_div' className='goods_info_divs'>
                                    <h3 className='goods_info_title' id='goods_main_delivery_title'> 배송 정보 </h3> 
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
        goods_loading : state.goods.goods_loading,
        goods_data : state.goods.goods_data,
        like_state : state.goods.like_state,
        like_loading : state.goods.like_loading,
        goods_result_price : state.goods.goods_result_price,
        goods_num : state.goods.goods_num,
        overlap_cart : state.goods.overlap_cart,
        save_overlap_id : state.goods.save_overlap_id,
        add_complate : state.goods.add_complate,
        open_fixed : state.goods.open_fixed
    }), 
  
    (dispatch) => ({
      goodsAction : bindActionCreators(goodsAction, dispatch),
      configAction : bindActionCreators(configAction, dispatch)
    })
  )(Goods);