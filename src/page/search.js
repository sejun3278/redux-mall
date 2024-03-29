import React, { Component } from 'react';
import axios from 'axios';
import queryString from 'query-string';

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import * as signupAction from '../Store/modules/signup';
import * as searchAction from '../Store/modules/search';
import * as configAction from '../Store/modules/config';
import '../css/responsive/signup.css';

import { Loading } from './index';
import Paging from './config/paging';

import URL from '../config/url';
import icon from '../source/img/icon.json';
import img from '../source/img/img.json';
import cat_list from '../source/admin_page.json';
import $ from 'jquery';

let like_loadng = false
let scrolling = false;
class Search extends Component {

    async componentDidMount() {
        const { searchAction, location, configAction, _checkLogin, screen, _getCookie, _stringCrypt, review_scroll } = this.props;

        let scroll = review_scroll;
        const get_scroll_cookie = await _getCookie('search_now_scroll', 'get', null, true);
        if(get_scroll_cookie !== null) {
            scroll = Number(JSON.parse(_stringCrypt(get_scroll_cookie, '_search_now_scroll', false)));
            configAction.toggle_review_modal({ 'scroll' : scroll });
        }

        // 검색 정보 가져오기
        this._getData(scroll);

        // 현재 search 정보 저장하기
        const qry_obj = queryString.parse(location.search);
        qry_obj['search'] = qry_obj['search'] === undefined ? "" : qry_obj['search'];

        const login_check = await _checkLogin();
        
        if(qry_obj['view_filter']) {
            if(qry_obj['view_filter'] === 'my_like') {
                if(!login_check) {
                    alert('잘못된 접근입니다.');

                    return window.location.replace('/search')
                }
            }
        }

        searchAction.save_qry(qry_obj);

        let allow = true;
        if(Number(qry_obj['min_price']) > Number(qry_obj['max_price'])) {
            if(Number(qry_obj['min_price']) > 0 && Number(qry_obj['max_price']) > 0) {
                alert('최소 가격을 최대 가격보다 낮게 설정하거나 \n최대 가격을 최소 가격보다 더 높게 설정해주세요.');
                allow = false;
            }
        } else if(Number(qry_obj['min_price']) <= 0 && Number(qry_obj['max_price']) <= 0) {
            alert('가격 설정을 최소 1 원 이상 설정해주세요.');
            allow = false;
        }

        if(allow === false) {
            return window.location.replace('/search');
        }

        let first_cat = qry_obj['first_cat'] ? qry_obj['first_cat'] : null;
        let last_cat = qry_obj['last_cat'] ? qry_obj['last_cat'] : null;

        configAction.select_cat_data({ 'type' : first_cat, 'last_cat' : last_cat });

        window.setTimeout(() => {
            // return this._lastCatScrollMove(qry_obj)
        }, 500)

        const screen_width = (window.innerWidth > 0) ? window.innerWidth : screen.width;
        const type = screen_width <= 600 ? 'board'
                                         : qry_obj.view_type ? 
                                                                qry_obj.view_type 
                                                             : 
                                                                'album';
        searchAction.toggle_view_type({ 'bool' : type })

        if(type === 'album') {
            // 앨범일 때만 스크롤링
            window.addEventListener("scroll", this._setScrollSize);

        } else if(type === 'board') {
            // 게시판일 때는 페이징
        }
    }

    async componentDidUpdate() {
        const { loading, _getCookie, _stringCrypt } = this.props;

        if(loading === true) {
            const qry_obj = queryString.parse(this.props.location.search);
            this._lastCatScrollMove(qry_obj)

            const check_last_goods = await _getCookie('last_goods_id', 'get', null, true);
            if(check_last_goods !== null) {
                const goods_id = Number(JSON.parse(_stringCrypt(check_last_goods, '_last_goods_id', false)));
                const $target = $('#search_each_div_' + goods_id)

                if($target !== null) {
                    if($target.offset() !== undefined) {
                        const offTop = $target.offset().top - 200;
                        $('html').prop({ 'scrollTop' : offTop })

                        await _getCookie('last_goods_id', 'remove', null, true);
                    }
                }
            }
        }
    }

    // 스크롤링
    _setScrollSize = async () => {
        const { review_scroll, configAction, search_length, _getCookie, _stringCrypt } = this.props;
        
        const event = 'html'
        // const check = _checkScrolling('#body_div');
  
        const scroll_top = $(event).scrollTop();
        // 현재 스크롤바의 위치
    
        const inner_height = $('#search_album_div').prop('scrollHeight');
        // 해당 div 의 총 높이
    
        // const scroll_height = $('#body_div_center').prop('scrollHeight');

        if(Math.round(scroll_top) > inner_height) {
            if(scrolling === false) {
                const add_scroll = review_scroll + 1;
                const limit_check = (add_scroll * 18) - search_length;

                if(limit_check < 0) {
                    await _getCookie('search_now_scroll', 'add', _stringCrypt(add_scroll, '_search_now_scroll', true), true);

                    scrolling = true;

                    $('body').css({ 'cursor' : 'wait' })
                    configAction.toggle_review_modal({ 'scroll' : add_scroll });

                    return await this._getData();
                }
            }
        }
    }

    _lastCatScrollMove = (qry_obj) => {
        if(qry_obj['last_cat']) {

            const last_cat_list = cat_list.last_category[qry_obj['first_cat']];
            let width = 0;

            last_cat_list.forEach( (el, key) => {
                if(el.value === qry_obj['last_cat']) {
                    let target = $('#last_cat_scroll_' + String(key));

                    if(target.length > 0) {
                        width = target.offset().left;

                        if(key === 0) {
                            width = 0;
                        }

                        return this.props._moveScrollbar('#search_show_last_list', 'x', width);
                    }
                }
            })
        }
    }

    _getData = async (scrolls) => {
        const { location, searchAction, user_info, review_scroll, _checkDevice } = this.props;

        const qry = queryString.parse(location.search);
        const obj = { 'type' : "SELECT", 'table' : "goods", 'comment' : "검색 정보 가져오기" };

        let type = qry.view_type ? qry.view_type : 'album';
        const mobile_check = _checkDevice();

        if(mobile_check === true) {
            type = 'board';
        }

        if(type === 'album') {
            obj['union'] = true;
            obj['union_table'] = 'goods';

            obj['union_where'] = [{ 'key' : 'state', 'option' : '=', 'value' : '1' }];
        }

        // WHERE 옵션 적용
        obj['option'] = {};
        obj['option']['name'] = 'LIKE';
        obj['option']['state'] = "=";
        obj['option']['price'] = "";
        obj['option']['stock'] = ">";

        obj['where'] = [];
        // 검색 조건 담기
        const search = qry.search === undefined ? "" : qry.search;
        const first_cat = qry.first_cat === undefined ? "" : qry.first_cat;
        const last_cat = qry.last_cat === undefined ? "" : qry.last_cat;
        const min_price = qry.min_price === undefined ? 0 : qry.min_price;
        let max_price = qry.max_price === undefined ? 1000000000 : Number(qry.max_price);

        if(max_price === 0) {
            max_price = 1000000000;
        }

        obj['where'].push({ 'table' : 'goods', 'key' : 'name', 'value' : "%" + search + "%" });

        if(type === 'album') {
            obj['union_where'].push({ 'key' : 'name', 'option' : 'LIKE', 'value' : "%" + search + "%" });
        }

        if(qry.first_cat) {
            obj['option']['first_cat'] = '=';
            obj['where'].push({ 'table' : 'goods', 'key' : 'first_cat', 'value' : first_cat });

            if(type === 'album') {
                obj['union_where'].push({ 'key' : 'first_cat', 'option' : '=', 'value' : first_cat });
            }
        }

        if(qry.last_cat) {
            obj['option']['last_cat'] = '=';
            obj['where'].push({ 'table' : 'goods', 'key' : 'last_cat', 'value' : last_cat });

            if(type === 'album') {
                obj['union_where'].push({ 'key' : 'last_cat', 'option' : '=', 'value' : last_cat });
            }
        }
        
        obj['where'].push({ 'table' : 'goods', 'key' : 'state', 'value' : "1" });
        obj['where'].push({ 'table' : 'goods', 'key' : 'result_price', 'value' : [Number(min_price), Number(max_price)] });

        if(type === 'album') {
            obj['where'].push({ 'table' : 'goods', 'key' : 'stock', 'value' : "0" });

            obj['union_where'].push({ 'key' : 'result_price', 'option' : '=', 'value' : [Number(min_price), Number(max_price)] });
        }
        // obj['union'] = true;
        // obj['union_info'] = { 'table' : 'goods',  }

        const view_filter = qry.view_filter;

        obj['order'] = [];
        obj['order'][0] = { 'table' : 'goods', 'key' : 'id', 'value' : "DESC" }

        if(view_filter === 'high_price') {
            obj['order'][0] = { 'table' : 'goods', 'key' : 'result_price', 'value' : "DESC" }

        } else if(view_filter === 'low_price') {
            obj['order'][0] = { 'table' : 'goods', 'key' : 'result_price', 'value' : "ASC" }

        } else if(view_filter === 'popular') {
            obj['order'][0] = { 'table' : 'goods', 'key' : 'sales', 'value' : "DESC" };

        } else if(view_filter === 'star') {
            obj['order'][0] = { 'table' : 'goods', 'key' : 'star', 'value' : "DESC" };
        }

        if(qry.filter === 'my_like') {
            obj['join'] = true;
            obj['join_table'] = 'like'

            obj['join_arr'] = [];
            obj['join_arr'][0] = { 'key1' : 'goods_id', 'key2' : 'id' }

            obj['join_where'] = [];
            obj['join_where'][0] = { 'columns' : 'state', 'as' : 'like_state' }

            obj['option']['user_id'] = "=";
            obj['where'].push({ 'table' : 'like', 'key' : 'user_id', 'value' : user_info.id });

            obj['option']['state'] = "=";
            obj['where'].push({ 'table' : 'like', 'key' : 'state', 'value' : 1 });
        }

        let start = 0;
        let end = 0;

        if(type === 'album') {
            const scroll = scrolls ? scrolls : review_scroll
            end = scroll === 0 ? 18 : (scroll * 18) + 18;

        } else if(type === 'board') {
            obj['board'] = true; //

            const now_page = qry.search_page ? qry.search_page : this.props.now_page;

            start = now_page === 1 ? 0 : (20 * Number(now_page)) - 20;
            end = now_page * 20;
        }

        obj['order'][1] = { 'table' : 'goods', 'key' : 'limit', 'value' : [start, end] }

        const get_data = await axios(URL + '/api/query', {
            method : 'POST',
            headers: new Headers(),
            data : obj
        })

        let data_info = get_data.data[0];

        // 갯수 가져오기
        const cover_obj = obj;
        cover_obj['count'] = true;

        cover_obj['count_remove_where'] = ['stock'];

        const get_cnt = await axios(URL + '/api/query', {
            method : 'POST',
            headers: new Headers(),
            data : cover_obj
        })

        const save_obj = {};
        save_obj['arr'] = JSON.stringify(data_info);
        save_obj['length'] = get_cnt.data[0][0]['count(*)'];

        scrolling = false;

        $('body').css({ 'cursor' : 'default' })

        searchAction.set_search_data( save_obj )

        window.setTimeout( () => {
            searchAction.set_search_data({ 'bool' : true }) 
        }, 200)
    }

    // 검색
    _search = async (event) => {
        const { _filter, _getCookie } = this;

        event.preventDefault();
        const form_data = event.target;
        const search_str = form_data.search.value.trim();

        await _getCookie('search_now_scroll', 'remove', null, true);

        return _filter('search', search_str);
    }

    // 필터
    _filter = async (filter_type, type) => {
        const { location, _filterURL, _checkLogin, _modalToggle, _getCookie } = this.props;
        const qry = queryString.parse(location.search);

        const login_check = await _checkLogin();

        if(qry[filter_type] === type) {
            delete qry[filter_type];

        } else {
            if(type === 'my_like') {
                if(!login_check) {
                    alert('로그인이 필요합니다.');
                    return _modalToggle(true);
                }
            }

            if(filter_type === 'search') {
                if(type.length === 0) {
                    delete qry['search'];
                }
            }

            qry[filter_type] = type;
        }

        if(qry['search_page']) {
            delete qry['search_page'];
        }

        if(Object.keys(qry).length === 0) {
            return window.location.href ='/search'
        }

        await _getCookie('search_now_scroll', 'remove', null, true);

        return _filterURL(qry, 'search');
    }

    // 가격 필터
    _priceFilter = async (event) => {
        event.preventDefault();
        const form_data = event.target;
        const qry = queryString.parse(this.props.location.search);

        const { _getCookie } = this.props;

        const min_price = Number(form_data.min_price.value);
        const max_price = Number(form_data.max_price.value);

        if(min_price > max_price) {
            if(min_price > 0 && max_price > 0) {
                alert('최소 가격을 최대 가격보다 낮게 설정하거나 \n최대 가격을 최소 가격보다 더 높게 설정해주세요.');
                return $('input[name=min_price]').focus();
            }

        } else if(min_price === 0 && max_price === 0) {
            alert('최소 1 원 이상 설정해주세요.');
            return $('input[name=min_price]').focus();
        }

        qry['min_price'] = min_price;
        qry['max_price'] = max_price;

        if(qry['search_page']) {
            delete qry['search_page'];
        }

        await _getCookie('search_now_scroll', 'remove', null, true);

        return this.props._filterURL(qry, 'search');
    }
    
    // 검색 옵션 삭제
    _removeSearchOption = async (opt_name, opt_value) => {
        const { location, _getCookie, _filterURL } = this.props;
        const qry = queryString.parse(location.search);

        if(window.confirm(opt_name + ' 옵션을 삭제하시겠습니까?')) {
            delete qry[opt_value];

            if(opt_value === 'first_cat') {
                delete qry['last_cat'];

            } else if(opt_value === 'min_price') {
                delete qry['max_price'];

            } else if(opt_value === 'max_price') {
                delete qry['min_price'];
            }

            if(qry['search_page']) {
                delete qry['search_page'];
            }

            if(Object.keys(qry).length === 0) {
                return window.location.href = '/search';
            }

            await _getCookie('search_now_scroll', 'remove', null, true);

            return _filterURL(qry, 'search');
        }
    }

    // 라이크 on / off
    _likeToggle = async (goods_id, type) => {
        const { _checkLogin, _modalToggle } = this.props;

        const user_info = await _checkLogin();
        if(!user_info) {
            alert('로그인이 필요합니다.');
            return _modalToggle(true);

        } else if(like_loadng === true) {
            alert('처리중입니다.');
            return;
        }

        like_loadng = true;

        const update_obj = { 'type' : 'UPDATE', 'table' : 'like', 'comment' : '상품 찜 설정 및 해제하기' }
        update_obj['where_limit'] = 1;

        update_obj['columns'] = [];
        update_obj['columns'].push({ 'key' : 'modify_date', 'value' : null });

        update_obj['where'] = [];
        
        update_obj['where'].push({ 'key' : 'user_id', 'value' : user_info.id });
        update_obj['where'].push({ 'key' : 'goods_id', 'value' : goods_id });

        let complate_alert = '찜을 추가했습니다.'
        if(type === true) {
          // 찜 설정
          update_obj['columns'].push({ 'key' : 'state', 'value' : 1 });

        } else {
          // 찜 해제
          update_obj['columns'].push({ 'key' : 'state', 'value' : 0 });
          complate_alert = '찜을 해제했습니다.'

        }

        await axios(URL + '/api/query', {
            method : 'POST',
            headers: new Headers(),
            data : update_obj
        })

        await this._getData();
        alert(complate_alert);

        like_loadng = false;
        return
    }

    _setLastGoods = async (id) => {
        const { _getCookie, _stringCrypt } = this.props;
        const str_name = _stringCrypt(String(id), "_last_goods_id", true);
        await _getCookie("last_goods_id", "add" , str_name, true)

        return window.location.href='/goods/?goods_num=' + id
    }

    render() {
        const { 
            search, _searchCategoryName, search_view_type, price_comma, _clickCategory, search_ready, 
            user_info, search_length, _filterURL
        } = this.props;
        const { _filter, _search, _removeSearchOption, _priceFilter, _setLastGoods } = this;

        const search_data = JSON.parse(this.props.search_data);
        const qry = queryString.parse(this.props.location.search);

        const min_price = qry.min_price === undefined ? 0 : qry.min_price;
        const max_price = qry.max_price === undefined ? 0 : qry.max_price;

        const first_cat = qry.first_cat === undefined ? null : qry.first_cat;
        const last_cat = qry.last_cat === undefined ? null : qry.last_cat;
        const _view_filter = qry.view_filter === undefined ? null : qry.view_filter;
        const _filter_ = qry.filter === undefined ? null : qry.filter;

        const filter_option_check = search || first_cat || last_cat || (min_price > 0 || max_price > 0) || _view_filter || _filter_;
        const opt_name_obj = {
            "search" : "검색어",
            "first_cat" : "상위 카테고리",
            "last_cat" : "하위 카테고리",
            "max_price" : "가격 설정",
            "view_filter" : "검색 필터",
            "filter" : "검색 옵션"
        }
        
        let last_cat_list = [];
        let grid_repeat = null;
        if(first_cat) {
            last_cat_list = cat_list.last_category[qry['first_cat']];
            // grid_repeat = `repeat(${last_cat_list.length}, ${Math.round(100 / last_cat_list.length)}%)`;
            grid_repeat = `repeat(${last_cat_list.length}, 200px)`;
        }

        const view_filter = qry.view_filter;
        const star_arr = [1, 2, 3, 4, 5];

        const now_page = qry.search_page ? qry.search_page : this.props.now_page

        return(
            <div id='search_body_div'>
                {search_ready ? 
                <div>
                {first_cat && last_cat_list? 
                    <div id='search_show_category_list_div' className='border_bottom'>
                        <div id='search_show_last_cat_title' className='border_right'> <b> 하위 카테고리 </b> </div>
                        
                        <div id='search_show_last_list'
                             style={{ 'gridTemplateColumns' : grid_repeat }}
                        >
                        {last_cat_list.map( (el, key) => {
                            return(
                                <div key={key} className='search_show_cat_list_div float_left aCenter pointer'
                                    id={'last_cat_scroll_' + key}
                                    style={qry['last_cat'] === el.value ? { 'color' : 'orange', 'fontWeight' : 'bold' } : null}
                                    onClick={() => _clickCategory(qry, qry.first_cat, el.value)}
                                >
                                {qry['last_cat'] === el.value
                                    ? <img src={icon.angel.angel_right_orange} id='search_select_angel' alt='' />
                                    : null}
                                    {el.name}
                                </div>
                            )
                        })}
                        </div>
                    </div>
                : null}
                
                <div id='search_bar_div' className='aCenter'>
                    <form onSubmit={_search}>
                        <b className='paybook_bold'> Search ... </b>
                        <input id='search_input' type='text' maxLength='20' name='search' defaultValue={search} />
                        <input id='search_img' type='image' alt='' src={icon.icon.search_black} />
                    </form>
                </div>

                <div id='search_filter_div' className='border_bottom font_13 paybook_bold'>
                    <div id='search_price_filter_div' className='aRight'>
                        <form onSubmit={_priceFilter}>
                            <div id='search_price_filter_grid_div'>
                                <b id='search_price_title_div' className='gray paybook_bold'> 가격 설정　| </b>　
                                <b id='search_price_input_div paybook_bold'>
                                    최소　<input type='number' min={0} max={1000000000} name='min_price' defaultValue={min_price}/>
                                    <b id='search_price_input_max_div'>　~
                                    　최대　<input type='number' min={0} max={1000000000} name='max_price' defaultValue={max_price}/> </b>

                                    <input id='search_price_filter_submit' title='검색' alt='' className='pointer' type='image' src={icon.icon.search_black} value='검색' />
                                </b>
                            </div>
                        </form>
                    </div>

                    <div id='search_view_filter_grid_div'>
                        <div id='search_view_filter_div'>
                            <div className='pointer'
                                onClick={search_view_type !== 'album' ? () => _filter('view_type','album') : null}
                            >
                                <img alt='' src={search_view_type === 'album'
                                    ? icon.search_icon.search_album_select
                                    : icon.search_icon.search_album_default}/> 
                                <p id={search_view_type === 'album' ? 'search_view_select' : null}> 앨범 형 </p>
                            </div>

                            <div className='pointer'
                                onClick={search_view_type !== 'board' ? () => _filter('view_type', 'board') : null}
                            > 
                                <img alt='' src={search_view_type === 'board' 
                                    ? icon.search_icon.search_board_select
                                    : icon.search_icon.search_board_default}/> 
                                <p id={search_view_type === 'board' ? 'search_view_select' : null}> 게시판 형 </p>
                            </div>
                        </div>

                        <div id='search_view_value_filter_div' className='aRight font_12 gray'>
                            <div onClick={() => _filter('view_filter', 'high_price')}
                                 id={view_filter === 'high_price' ? 'select_view_filter' : null}
                            > 
                                가격 높은 순 
                            </div>

                            <div onClick={() => _filter('view_filter', 'low_price')}
                                 id={view_filter === 'low_price' ? 'select_view_filter' : null}
                            > 
                                가격 낮은 순 
                            </div>

                            <div onClick={() => _filter('view_filter', 'popular')}
                                id={view_filter === 'popular' ? 'select_view_filter' : null}
                            > 
                                인기도 순 
                            </div>
                            
                            <div onClick={() => _filter('view_filter', 'star')}
                                id={view_filter === 'star' ? 'select_view_filter' : null}
                            > 
                                평점 순
                            </div>

                            {/* <div onClick={() => _filter('filter', 'my_like')}
                                id={qry.filter === 'my_like' ? 'select_view_filter' : null}
                                className={!user_info.id ? 'gray' : null}
                                title={!user_info.id ? '로그인이 필요합니다.' : '내가 찜한 상품만 보기'}
                            > 
                                내가 찜한 상품 
                            </div> */}
                        </div>
                    </div>
                </div>

                <div id='search_data_result_div' className='border_bottom'>
                    <div id='search_result_div'>
                        <img alt='' src={icon.search_icon.search_result} />
                        <b className='paybook_bold'> {search === "" ? "전체 검색" : "검색 결과"} </b>

                        <div id='search_result_cnt_div' className='font_14 marginTop_30'>
                            총 { search_length } 개의 상품이 조회되었습니다.
                        </div>

                        <div id='search_result_str_div' className='font_14 bold'>
                            {search === ""
                                ? null
                                : '"' + search + '" 로 검색된 결과입니다.'
                            }
                        </div>
                    </div>

                    {filter_option_check
                        ? <div id='search_option_div' className='font_13 default'>
                            <div id='search_option_title_div'>
                                - 검색 조건 적용중
                                <img alt='' src={icon.icon.reload} id='search_reset_option_icon' 
                                    onClick={() => window.location.href='/search'}
                                    title='모든 검색 조건 초기화' className='pointer'
                                />
                            </div>

                            <div id='search_option_list_div'>
                                {Object.entries(opt_name_obj).map( (el, key) => {
                                    const check = qry[el[0]] !== undefined;

                                    let opt_name = el[1];
                                    let opt_value = qry[el[0]];
                                
                                    if(opt_name === '상위 카테고리' && qry['first_cat']) {
                                        opt_value = _searchCategoryName(qry['first_cat'], 'first');

                                    } else if(opt_name === '하위 카테고리' && qry['last_cat']) {
                                        opt_value = _searchCategoryName(qry['last_cat'], 'last', qry['first_cat']);

                                    } else if(opt_name === '가격 설정') {
                                        // 최소 가격만 설정된 경우
                                        if(Number(qry['min_price']) > 0 && Number(qry['max_price']) === 0) {
                                            opt_value = price_comma(qry['min_price']) + ' 원　~';

                                        } else if(Number(qry['max_price']) > 0 && Number(qry['min_price']) === 0) {
                                            opt_value = '~　' + price_comma(qry['max_price']) + ' 원';

                                        } else if(Number(qry['max_price']) > 0 && Number(qry['min_price']) > 0) {
                                            opt_value = price_comma(qry['min_price']) + ' 원　~　' + price_comma(qry['max_price']) + ' 원';
                                        }

                                    } else if(opt_name === '검색 필터') {
                                        if(opt_value === 'high_price') {
                                            opt_value = '높은 가격순'

                                        } else if(opt_value === 'low_price') {
                                            opt_value = '낮은 가격순'
                                        
                                        } else if(opt_value === 'popular') {
                                            opt_value = '인기도 순'

                                        } else if(opt_value === 'star') {
                                            opt_value = '평점 순'
                                        }

                                    } else if(opt_value === 'my_like') {
                                        opt_value = '내가 찜한 상품'
                                    }

                                    return(
                                        <div key={key}>
                                            {check ? 
                                            <div className='search_option_grid_div'>
                                                    <div className='aRight'>
                                                        {opt_name}　|
                                                    </div>

                                                    <div className='search_option_value_div bold'>
                                                    {opt_value}
                                                        <img alt='' src={icon.icon.close_circle}
                                                            title='삭제'
                                                            onClick={() => _removeSearchOption(el[1], el[0])}
                                                        />
                                                    </div>
                                            </div>
                                            : null}
                                        </div>
                                    )
                                })}
                            </div>

                          </div>

                        : null}
                </div>

                <div id='search_contents_div'>
                    {!search_data.length
                    
                    ? <div id='search_result_null_div' className='aCenter red'> 
                        <h4 className='recipe_korea'> 조회된 데이터가 없습니다. </h4>
                        <div style={{ 'backgroundImage' : `url(${img.img.result_null})` }}> </div>
                        {/* <img src={img.img.result_null} /> */}
                      </div>
                
                    :
                    <div>
                        <div id='search_album_div' className={search_view_type !== 'album' ? 'display_none' : null}> 
                            {search_data.map( (el, key) => {
                                const first_cat_name = _searchCategoryName(el.first_cat, 'first');
                                const last_cat_name = _searchCategoryName(el.last_cat, 'last', el.first_cat);

                                let goods_name = el.name;
                                if(search) {
                                    const first_idx = goods_name.indexOf(search);
                                    const slice_str = goods_name.slice(0, first_idx);
                                    const last_str = goods_name.slice((first_idx + search.length), goods_name.length);

                                    goods_name = slice_str + "<b class='bold search_line'>" + search + "</b>" + last_str;
                                }

                                let like_title = '';
                                let like_state = icon.goods.like_none;
                                if(!user_info.id) {
                                    like_title = '로그인이 필요합니다.';

                                } else {
                                    if(el.like_state === 0) {
                                        like_title = '찜 설정';

                                    } else if(el.like_state === 1) {
                                        like_title = '찜 해제';
                                        like_state = icon.goods.like_on
                                    }
                                }

                                let goods_star = '<div class="aCenter"> </div>';
                                star_arr.map( (cu) => {
                                    if(el.star >= cu) {
                                        goods_star += '<div class="inline_block star_color"> ★ </div>';

                                    } else {
                                        goods_star += '<div class="inline_block"> ☆ </div>';
                                    }
                                })
                                goods_star += ' <div class="inline_block gray"> ( ' + el.star + ' ) </div>'

                                let origin_price = '<div class="search_origin_price_div font_12"> ';
                                if(el.discount_price > 0) {
                                    origin_price += '<del class="gray"> ' + price_comma(el.origin_price) + ' 원 </del> ';

                                } else {
                                    origin_price += '<u class="remove_underLine gray">' + price_comma(el.origin_price) + '원 </u>'
                                }
                                origin_price += '<u class="remove_underLine search_discount_percent"> ( ' + el.discount_price + '% ) </u>'
                                origin_price += '</div>'

                                return(
                                    <div className='search_contents_each_list pointer' key={key}
                                        title={el.name}
                                    >
                                        <p className='font_13'> No. {el.id} </p>
                                        <div className='search_contents_thumb_list border' key={key} 
                                            id={'search_each_div_' + el.id}
                                            style={{ 'backgroundImage' : `url(${el.thumbnail})` }}
                                            onClick={() => _setLastGoods(el.id)}
                                            // onClick={() => window.location.href='/goods/?goods_num=' + el.id}
                                        >
                                        {el.stock === 0
                                            ? <div className='search_goods_sold_out_alert_div aCenter white'
                                                    title='매진된 상품입니다.'
                                            >
                                                <h4 className='recipe_korea'> Sold Out </h4>
                                              </div>
                                            
                                            : null
                                        }
                                        </div>

                                        {/* <div id='search_album_like_div'
                                             title={like_title}
                                             onClick={() => el.like_state === 0
                                                ? _likeToggle(el.id, true) // like 적용
                                                : _likeToggle(el.id, false) // like 해제
                                            }
                                        >
                                            <img src={like_state} />
                                        </div> */}

                                        <div className='search_goods_category aCenter font_12 gray marginTop_10'>
                                            [ <u className='remove_underLine' onClick={() => _clickCategory(qry, el.first_cat)}> { first_cat_name } </u> | 
                                            <u className='remove_underLine' onClick={() => _clickCategory(qry, el.first_cat, el.last_cat)}> { last_cat_name } </u> ]
                                        </div>
                                        
                                        <div className='search_goods_star_div' dangerouslySetInnerHTML={{ __html : goods_star }} />
                                        {qry.view_filter === 'popular'
                                            ? <div className='search_sales_div bold font_12 aCenter custom_color_1'> 판매　|　{price_comma(el.sales)} 개 </div>

                                            : null
                                        } 

                                        <div className='search_goods_name recipe_korea aCenter marginTop_10 cut_multi_line'
                                            dangerouslySetInnerHTML={{__html : goods_name}}
                                            onClick={() => window.location.href='/goods/?goods_num=' + el.id}
                                        >
                                        </div>

                                        <div className='search_price_div font_14 aCenter'>
                                            <div dangerouslySetInnerHTML={{ __html : origin_price }}/>
                                            <div className='paybook_bold'> <b> {price_comma(el.result_price)} 원 </b> </div>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                        
                        {search_view_type === 'board'
                        ?
                            <div className='search_paging_div' style={{ 'paddingBottom' : '40px' }}>
                                <Paging
                                    paging_cnt={search_length}
                                    paging_show={20}
                                    now_page={now_page}
                                    page_name='search_page' 
                                    _filterURL={_filterURL}
                                    qry={qry}
                                />
                            </div>

                        : null }

                        <div id='search_board_div' className={search_view_type !== 'board' ? 'display_none' : null}>
                            {search_data.map( (el, key) => {
                                const first_cat_name = _searchCategoryName(el.first_cat, 'first');
                                const last_cat_name = _searchCategoryName(el.last_cat, 'last', el.first_cat);

                                let goods_name = el.name;
                                if(search) {
                                    const first_idx = goods_name.indexOf(search);
                                    const slice_str = goods_name.slice(0, first_idx);
                                    const last_str = goods_name.slice((first_idx + search.length), goods_name.length);

                                    goods_name = slice_str + `<b class='bold search_line'> ${search} </b>` + last_str;
                                }

                                let goods_star = '<div class="aCenter"> </div>';
                                star_arr.map( (cu) => {
                                    if(el.star >= cu) {
                                        goods_star += '<div class="inline_block star_color"> ★ </div>';

                                    } else {
                                        goods_star += '<div class="inline_block"> ☆ </div>';
                                    }
                                })
                                goods_star += ' <div class="inline_block gray"> ( ' + el.star + ' ) </div>'

                                let origin_price = '<div class="search_origin_price_div font_12"> ';
                                if(el.discount_price > 0) {
                                    origin_price += '<del class="gray"> ' + price_comma(el.origin_price) + ' 원 </del> ';

                                } else {
                                    origin_price += '<u class="remove_underLine gray">' + price_comma(el.origin_price) + '원 </u>'
                                }
                                origin_price += '<u class="remove_underLine search_discount_percent"> ( ' + el.discount_price + '% ) </u>'
                                origin_price += '</div>'

                                return(
                                    <div key={key} className='serach_each_div marginBottom_60'
                                        id={"search_each_div_" + el.id}
                                    >                                        
                                        <div className='search_album_each_div'>
                                            <div />
                                            <div className='pointer'>
                                                <p className='search_album_goods_number font_13'> No. { el.id } </p>
                                                <div className='search_album_grid_div border'>
                                                    <div className='border_right'>
                                                        <div className='search_album_thumbnail' style={{ 'backgroundImage' : `url(${el.thumbnail})` }} 
                                                            onClick={() => _setLastGoods(el.id)}
                                                            //  onClick={() => window.location.href='/goods/?goods_num=' + el.id}
                                                        />

                                                        {el.stock === 0
                                                            ? <div className='search_goods_sold_out_alert_div board_sold_out aCenter white'
                                                                    title='매진된 상품입니다.'
                                                              >
                                                                    <h4> Sold Out </h4>
                                                              </div>
                                                                    
                                                              : null
                                                        }
                                                    </div>

                                                    <div>
                                                        <div className='search_album_category_div font_12 border_bottom'>
                                                            <u className='remove_underLine' onClick={() => _clickCategory(qry, el.first_cat)}> { first_cat_name } </u>
                                                            <u className='remove_underLine' style={{ 'padding' : '0px 10px 0px 10px' }}> 〉</u>
                                                            <u className='remove_underLine' onClick={() => _clickCategory(qry, el.first_cat, el.last_cat)}> { last_cat_name } </u>
                                                        </div>

                                                        <div
                                                            onClick={() => _setLastGoods(el.id)}
                                                            //  onClick={() => window.location.href='/goods/?goods_num=' + el.id}
                                                        >
                                                            <div className='search_album_name_and_price'
                                                                style={{ 'marginTop' : '10px' }}
                                                            >
                                                                <div dangerouslySetInnerHTML={{__html : goods_name}}
                                                                    className='cut_multi_line recipe_korea search_album_name_div' /> 

                                                                <div className='search_board_star_div font_12 aRight' dangerouslySetInnerHTML={{ __html : goods_star }} />
                                                                <div className='search_board_price_div font_13'>
                                                                    <div dangerouslySetInnerHTML={{ __html : origin_price }} />
                                                                    <div> <b> {price_comma(el.result_price)} 원 </b> </div>
                                                                </div>
                                                            </div>

                                                            <div className='search_album_other_div'>

                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div />
                                        </div>
                                    </div>
                                )
                            })}

                        {search_view_type === 'board' && search_data.length > 8
                        ?
                            <div className='search_paging_div' style={{ 'paddingTop' : '20px' }}>
                                <Paging
                                    paging_cnt={search_length}
                                    paging_show={20}
                                    now_page={now_page}
                                    page_name='search_page' 
                                    _filterURL={_filterURL}
                                    qry={qry}
                                />
                            </div>

                        : null }
                        </div>

                    </div>
                    }
                </div>

                </div> : <Loading /> }
            </div>
        )
    }
}

Search.defaultProps = {
  }
  
  export default connect(
    (state) => ({
        search_data : state.search.search_data,
        search : state.search.search,
        search_view_type : state.search.search_view_type,
        search_ready : state.search.search_ready,
        search_length : state.search.search_length,
        now_page : state.config.now_page,
        review_scroll : state.config.review_scroll,
        review_scrolling : state.config.review_scrolling,
        loading : state.config.loading
    }), 
  
    (dispatch) => ({
      signupAction : bindActionCreators(signupAction, dispatch),
      searchAction : bindActionCreators(searchAction, dispatch),
      configAction : bindActionCreators(configAction, dispatch)
    })
  )(Search);