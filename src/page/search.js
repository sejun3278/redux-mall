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

import URL from '../config/url';
import icon from '../source/img/icon.json';
import img from '../source/img/img.json';
import cat_list from '../source/admin_page.json';
import $ from 'jquery';

class Search extends Component {

    componentDidMount() {
        const { searchAction, location, configAction } = this.props;

        // 검색 정보 가져오기
        this._getData();

        // 현재 search 정보 저장하기
        const qry_obj = queryString.parse(location.search);
        qry_obj['search'] = qry_obj['search'] === undefined ? "" :qry_obj['search'];

        searchAction.save_qry(qry_obj);

        let allow = true;
        if(Number(qry_obj['min_price']) > Number(qry_obj['max_price'])) {
            if(Number(qry_obj['min_price']) > 0 && Number(qry_obj['max_price']) > 0) {
                alert('최소 가격을 최대 가격보다 낮게 설정하거나 \n최대 가격을 최소 가격보다 더 높게 설정해주세요.');
                allow = false;
            }
        }

        if(allow === false) {
            return window.location.replace('/');
        }

        let first_cat = qry_obj['first_cat'] ? qry_obj['first_cat'] : null;
        let last_cat = qry_obj['last_cat'] ? qry_obj['last_cat'] : null;

        configAction.select_cat_data({ 'type' : first_cat, 'last_cat' : last_cat });

        window.setTimeout(() => {
            return this._lastCatScrollMove(qry_obj)
        }, 100)
    }

    _lastCatScrollMove = (qry_obj) => {
        if(qry_obj['last_cat']) {

            const last_cat_list = cat_list.last_category[qry_obj['first_cat']];
            let width = 0;
            let cat_index = 0;

            for(let key in last_cat_list) {
                if(last_cat_list[key].value === qry_obj['last_cat']) {
                    if(key === 0) {
                        width = $('#last_cat_scroll_0').offset().left;

                    } else if(key > 0) {
                        width = $('#last_cat_scroll_' + cat_index).offset().left;
                    }
                }
                cat_index += 1;
            }
                
            this.props._moveScrollbar('#search_show_last_list', 'x', width)
        }
    }

    _getData = async () => {
        const { location, searchAction, user_info } = this.props;

        const qry = queryString.parse(location.search);
        const obj = { 'type' : "SELECT", 'table' : "goods", 'comment' : "검색 정보 가져오기" };

        if(user_info) {
            // obj['join'] = true;
            // obj['join_table'] = 'like'
        }
 
        // obj['columns'] = [];
        // 컬럼 조건 담기
        // obj['columns'].push('name');
        // obj['columns'].push('id');

        // WHERE 옵션 적용
        obj['option'] = {};
        obj['option']['name'] = 'LIKE';
        obj['option']['first_cat'] = 'LIKE';
        obj['option']['last_cat'] = 'LIKE';
        obj['option']['state'] = "=";
        obj['option']['price'] = "";

        if(obj.join) {
            // join 이 있는 경우
            obj['join_arr'] = [];
            obj['join_arr'][0] = { 'key1' : 'goods_id', 'key2' : 'id' }

            obj['join_where'] = [];
            obj['join_where'][0] = { 'columns' : 'state', 'as' : 'like_state' }
        }

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

        obj['where'][0] = { 'table' : 'goods', 'key' : 'name', 'value' : "%" + search + "%" };
        obj['where'][1] = { 'table' : 'goods', 'key' : 'first_cat', 'value' : "%" + first_cat + "%" };
        obj['where'][2] = { 'table' : 'goods', 'key' : 'last_cat', 'value' : "%" + last_cat + "%" };
        obj['where'][3] = { 'table' : 'goods', 'key' : 'state', 'value' : "1" };
        obj['where'][4] = { 'table' : 'goods', 'key' : 'result_price', 'value' : [Number(min_price), Number(max_price)] };

        const view_filter = qry.view_filter;

        obj['order'] = [];
        obj['order'][0] = { 'table' : 'goods', 'key' : 'id', 'value' : "" }

        if(view_filter === 'high_price') {
            obj['order'][0] = { 'table' : 'goods', 'key' : 'result_price', 'value' : "DESC" }

        } else if(view_filter === 'low_price') {
            obj['order'][0] = { 'table' : 'goods', 'key' : 'result_price', 'value' : "ASC" }

        } else if(view_filter === 'popular') {
            obj['order'][0] = { 'table' : 'goods', 'key' : 'sales', 'value' : "DESC" };

        } else if(view_filter === 'star') {
            obj['order'][0] = { 'table' : 'goods', 'key' : 'star', 'value' : "DESC" };
        }

        const get_data = await axios(URL + '/api/query', {
            method : 'POST',
            headers: new Headers(),
            data : obj
        })

        searchAction.set_search_data({ 'arr' : JSON.stringify(get_data.data[0]) })
    }

    // 검색
    _search = (event) => {
        const { _filter } = this;

        event.preventDefault();
        const form_data = event.target;
        const search_str = form_data.search.value.trim();

        return _filter('search', search_str);
    }

    // 필터
    _filter = (filter_type, type) => {
        const { location, _filterURL } = this.props;
        const qry = queryString.parse(location.search);

        if(qry[filter_type] === type) {
            delete qry[filter_type];

        } else {
            qry[filter_type] = type;
        }

        if(Object.keys(qry).length === 0) {
            return window.location.href ='/search'
        }

        return _filterURL(qry, 'search');
    }

    // 가격 필터
    _priceFilter = (event) => {
        event.preventDefault();
        const form_data = event.target;
        const qry = queryString.parse(this.props.location.search);

        const min_price = Number(form_data.min_price.value);
        const max_price = Number(form_data.max_price.value);

        if(min_price > max_price) {
            if(min_price > 0 && max_price > 0) {
                alert('최소 가격을 최대 가격보다 낮게 설정하거나 \n최대 가격을 최소 가격보다 더 높게 설정해주세요.');
                return $('input[name=min_price]').focus();
            }
        }

        qry['min_price'] = min_price;
        qry['max_price'] = max_price;

        return this.props._filterURL(qry, 'search');
    }
    
    // 검색 옵션 삭제
    _removeSearchOption = (opt_name, opt_value) => {
        const qry = queryString.parse(this.props.location.search);

        if(window.confirm(opt_name + ' 옵션을 삭제하시겠습니까?')) {
            delete qry[opt_value];

            if(opt_value === 'first_cat') {
                delete qry['last_cat'];

            } else if(opt_value === 'min_price') {
                delete qry['max_price'];

            } else if(opt_value === 'max_price') {
                delete qry['min_price'];
            }

            return this.props._filterURL(qry, 'search');
        }
    }

    // 라이크 on / off
    _likeToggle = (goods_id, type) => {
        const { user_info, _modalToggle } = this.props;

        if(!user_info) {
            alert('로그인이 필요합니다.');
            return _modalToggle(true);
        }
    }

    render() {
        const { search, _searchCategoryName, search_view_type, price_comma, _clickCategory, search_ready, user_info } = this.props;
        const { _filter, _search, _removeSearchOption, _priceFilter, _likeToggle } = this;

        const search_data = JSON.parse(this.props.search_data);
        const qry = queryString.parse(this.props.location.search);

        const min_price = qry.min_price === undefined ? 0 : qry.min_price;
        const max_price = qry.max_price === undefined ? 0 : qry.max_price;

        const first_cat = qry.first_cat === undefined ? null : qry.first_cat;
        const last_cat = qry.last_cat === undefined ? null : qry.last_cat;
        const _view_filter = qry.view_filter === undefined ? null : qry.view_filter;

        const filter_option_check = search || first_cat || last_cat || (min_price > 0 || max_price > 0) || _view_filter;
        const opt_name_obj = {
            "search" : "검색어",
            "first_cat" : "상위 카테고리",
            "last_cat" : "하위 카테고리",
            "max_price" : "가격 설정",
            "view_filter" : "검색 필터"
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
                        <b> Search ... </b>
                        <input id='search_input' type='text' maxLength='20' name='search' defaultValue={search} />
                        <input id='search_img' type='image' alt='' src={icon.icon.search_black} />
                    </form>
                </div>

                <div id='search_filter_div' className='border_bottom font_13'>
                    <div id='search_price_filter_div' className='aRight'>
                        <form onSubmit={_priceFilter}>
                            <div id='search_price_filter_grid_div'>
                                <b id='search_price_title_div' className='gray'> 가격 설정　| </b>　
                                <b id='search_price_input_div'>
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

                        <div id='search_view_value_filter_div' className='aRight'>
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
                            <div onClick={() => _filter('view_filter', 'my_like')}> 내가 찜한 상품 </div>
                        </div>
                    </div>
                </div>

                <div id='search_data_result_div' className='border_bottom'>
                    <div id='search_result_div'>
                        <img alt='' src={icon.search_icon.search_result} />
                        <b> {search === "" ? "전체 검색" : "검색 결과"} </b>

                        <div id='search_result_cnt_div' className='font_14 marginTop_30'>
                            총 { search_data.length } 개의 상품이 조회되었습니다.
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
                        <h4> 조회된 데이터가 없습니다. </h4>
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

                                const like_state = user_info === false 
                                    ? icon.goods.like_none
                                    
                                    : icon.goods.like_none
                                            // ? icon.goods.like_none

                                            // : icon.goods.like_on

                                let goods_star = '<div class="aCenter"> </div>';
                                star_arr.map( (cu) => {
                                    if(el.star >= cu) {
                                        goods_star += '<div class="inline_block star_color"> ★ </div>';

                                    } else {
                                        goods_star += '<div class="inline_block"> ☆ </div>';
                                    }
                                })
                                goods_star += ' <div class="inline_block gray"> ( ' + el.star + ' ) </div>'

                                return(
                                    <div className='search_contents_each_list pointer' key={key}
                                        title={el.name}
                                    >
                                        <p className='font_13'> No. {el.id} </p>
                                        <div className='search_contents_thumb_list border' key={key} 
                                            style={{ 'backgroundImage' : `url(${el.thumbnail})` }}
                                            onClick={() => window.location.href='/goods/?goods_num=' + el.id}
                                        />

                                        <div id='search_album_like_div'
                                             title={el.like_state === 0 ? "찜 추가" : "찜 해제"}
                                             onClick={() => el.like_state === 0
                                                ? _likeToggle(el.id, true) // like 적용
                                                : _likeToggle(el.id, false) // like 해제
                                            }
                                        >
                                            <img src={like_state} />
                                        </div>

                                        <div className='search_goods_category aCenter font_12 gray marginTop_10'>
                                            [　<u className='remove_underLine' onClick={() => _clickCategory(qry, el.first_cat)}> { first_cat_name } </u>　
                                            /　
                                            <u className='remove_underLine' onClick={() => _clickCategory(qry, el.first_cat, el.last_cat)}> { last_cat_name } </u>　]
                                        </div>
                                        
                                        <div className='search_goods_star_div' dangerouslySetInnerHTML={{ __html : goods_star }} />
                                        {qry.view_filter === 'popular'
                                            ? <div className='search_sales_div bold font_12 aCenter custom_color_1'> 판매　|　{price_comma(el.sales)} 개 </div>

                                            : null
                                        } 

                                        <div className='search_goods_name aCenter marginTop_10 cut_multi_line'
                                            dangerouslySetInnerHTML={{__html : goods_name}}
                                            onClick={() => window.location.href='/goods/?goods_num=' + el.id}
                                        >
                                        </div>

                                        <div className='search_price_div font_14 aCenter'>
                                            <b> {price_comma(el.result_price)} 원 </b>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>

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

                                return(
                                    <div key={key} className='serach_each_div marginBottom_60'>                                        
                                        <div className='search_album_each_div'>
                                            <div />
                                            <div className='pointer'>
                                                <p className='search_album_goods_number font_13'> No. { el.id } </p>
                                                <div className='search_album_grid_div border'>
                                                    <div className='border_right'>
                                                        <div className='search_album_thumbnail' style={{ 'backgroundImage' : `url(${el.thumbnail})` }} 
                                                             onClick={() => window.location.href='/goods/?goods_num=' + el.id}
                                                        />
                                                    </div>

                                                    <div>
                                                        <div className='search_album_category_div font_12 border_bottom'>
                                                            카테고리　|　
                                                            <u className='remove_underLine' onClick={() => _clickCategory(qry, el.first_cat)}> { first_cat_name } </u>　
                                                            〉　
                                                            <u className='remove_underLine' onClick={() => _clickCategory(qry, el.first_cat, el.last_cat)}> { last_cat_name } </u>
                                                        </div>

                                                        <div className='search_album_name_and_price_grid'
                                                             onClick={() => window.location.href='/goods/?goods_num=' + el.id}
                                                        >
                                                            <div className='search_album_name_and_price'>
                                                                <div dangerouslySetInnerHTML={{__html : goods_name}}
                                                                    className='cut_multi_line search_album_name_div'
                                                                /> 

                                                                <p> <b> {price_comma(el.result_price)} </b> 원 </p>
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
        search_ready : state.search.search_ready
    }), 
  
    (dispatch) => ({
      signupAction : bindActionCreators(signupAction, dispatch),
      searchAction : bindActionCreators(searchAction, dispatch),
      configAction : bindActionCreators(configAction, dispatch)
    })
  )(Search);