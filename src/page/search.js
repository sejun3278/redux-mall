import React, { Component } from 'react';
import axios from 'axios';
import queryString from 'query-string';

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import * as signupAction from '../Store/modules/signup';
import * as searchAction from '../Store/modules/search';
import * as configAction from '../Store/modules/config';
import '../css/responsive/signup.css';

import URL, { repeat } from '../config/url';
import icon from '../source/img/icon.json';
import img from '../source/img/img.json';
import cat_list from '../source/admin_page.json';
import $ from 'jquery';

class Search extends Component {

    componentDidMount() {
        const { searchAction, location, configAction, _moveScrollbar } = this.props;

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

        //  last_cat 스크롤 이동
        if(qry_obj['last_cat']) {
            const last_cat_list = cat_list.last_category[qry_obj['first_cat']];
            let cat_index = 0;
            let width = 0;

            for(let key in last_cat_list) {
                if(last_cat_list[key].value === qry_obj['last_cat']) {
                    if(key === 0) {
                        width = $('#last_cat_scroll_0').offset().left;

                    } else if(key > 0) {
                        width = $('#last_cat_scroll_' + (key - 1)).offset().left;
                    }
                }
                cat_index += 1;
            }
            
            _moveScrollbar('#search_show_last_list', 'x', width)
        }
    }

    _getData = async () => {
        const { location, searchAction } = this.props;

        const qry = queryString.parse(location.search);

        const obj = { 'type' : "SELECT", 'table' : "goods", 'comment' : "검색 정보 가져오기" };

        // obj['columns'] = [];
        // 컬럼 조건 담기
        // obj['columns'].push('name');
        // obj['columns'].push('id');

        // WHERE 옵션 적용
        obj['option'] = {};
        obj['option']['name'] = 'LIKE';
        obj['option']['first_cat'] = 'LIKE';
        obj['option']['last_cat'] = 'LIKE';
        obj['option']['price'] = "";

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

        obj['where'][0] = { 'name' : "%" + search + "%" };
        obj['where'][1] = { 'first_cat' : "%" + first_cat + "%" };
        obj['where'][2] = { 'last_cat' : "%" + last_cat + "%" };
        obj['where'][3] = { 'result_price' : [Number(min_price), Number(max_price)] };

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

        qry[filter_type] = type;
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
            }

            return this.props._filterURL(qry, 'search');
        }
    }

    render() {
        const { search, _searchCategoryName, search_view_type, price_comma, _clickCategory } = this.props;
        const { _filter, _search, _removeSearchOption, _priceFilter } = this;
        const search_data = JSON.parse(this.props.search_data);
        
        const qry = queryString.parse(this.props.location.search);

        const min_price = qry.min_price === undefined ? 0 : qry.min_price;
        const max_price = qry.max_price === undefined ? 0 : qry.max_price;

        const first_cat = qry.first_cat === undefined ? null : qry.first_cat;
        const last_cat = qry.last_cat === undefined ? null : qry.last_cat

        const filter_option_check = search || first_cat || last_cat || (min_price > 0 || max_price > 0);
        const opt_name_obj = {
            "search" : "검색어",
            "first_cat" : "상위 카테고리",
            "last_cat" : "하위 카테고리",
            "max_price" : "가격 설정",
        }
        
        let last_cat_list = [];
        let grid_repeat = null;
        if(first_cat) {
            last_cat_list = cat_list.last_category[qry['first_cat']];
            // grid_repeat = `repeat(${last_cat_list.length}, ${Math.round(100 / last_cat_list.length)}%)`;
            grid_repeat = `repeat(${last_cat_list.length}, 200px)`;
        }

        return(
            <div id='search_body_div'>
                {first_cat && last_cat_list ? 
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
                                    ? <img src={icon.angel.angel_right_orange} id='search_select_angel' />
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

                                    <input id='search_price_filter_submit' title='검색' className='pointer' type='image' src={icon.icon.search_black} value='검색' />
                                </b>
                            </div>
                        </form>
                    </div>

                    <div id='search_view_filter_div'>
                        <div className='pointer'
                            onClick={search_view_type !== 'album' ? () => _filter('view_type','album') : null}
                        >
                            <img src={search_view_type === 'album' 
                                ? icon.search_icon.search_album_select
                                : icon.search_icon.search_album_default}/> 
                            <p id={search_view_type === 'album' ? 'search_view_select' : null}> 앨범 형 </p>
                        </div>

                        <div className='pointer'
                            onClick={search_view_type !== 'board' ? () => _filter('view_type', 'board') : null}
                        > 
                            <img src={search_view_type === 'board' 
                                ? icon.search_icon.search_board_select
                                : icon.search_icon.search_board_default}/> 
                            <p id={search_view_type === 'board' ? 'search_view_select' : null}> 게시판 형 </p>
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
                                                        <img src={icon.icon.close_circle}
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

                                    goods_name = `${slice_str} ` + `<b class='bold search_line'> ${search} </b>` + last_str;
                                }

                                return(
                                    <div className='search_contents_each_list pointer' key={key}
                                        title={el.name}
                                    >
                                        <p className='font_13'> No. {el.id} </p>
                                        <div className='search_contents_thumb_list border' key={key} 
                                            style={{ 'backgroundImage' : `url(${el.thumbnail})` }}
                                        />

                                        <div className='search_goods_category aCenter font_12 gray marginTop_10'>
                                            [　<u className='remove_underLine' onClick={() => _clickCategory(qry, el.first_cat)}> { first_cat_name } </u>　
                                            /　
                                            <u className='remove_underLine' onClick={() => _clickCategory(qry, el.first_cat, el.last_cat)}> { last_cat_name } </u>　]
                                        </div>

                                        <div className='search_goods_name aCenter marginTop_10 cut_multi_line'
                                            dangerouslySetInnerHTML={{__html : goods_name}}
                                        >
                                        </div>

                                        <div className='search_price_div font_14 aCenter'>
                                            {price_comma(el.result_price)}　원
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

                                    goods_name = `${slice_str} ` + `<b class='bold search_line'> ${search} </b>` + last_str;
                                }

                                return(
                                    <div key={key} className='serach_each_div marginBottom_60'>                                        
                                        <div className='search_album_each_div'>
                                            <div />
                                            <div className='pointer'>
                                                <p className='search_album_goods_number font_13'> No. { el.id } </p>
                                                <div className='search_album_grid_div border'>
                                                    <div className='border_right'>
                                                        <div className='search_album_thumbnail' style={{ 'backgroundImage' : `url(${el.thumbnail})` }} />
                                                    </div>

                                                    <div>
                                                        <div className='search_album_category_div font_12 border_bottom'>
                                                            카테고리　|　
                                                            <u className='remove_underLine' onClick={() => _clickCategory(qry, el.first_cat)}> { first_cat_name } </u>　
                                                            〉　
                                                            <u className='remove_underLine' onClick={() => _clickCategory(qry, el.first_cat, el.last_cat)}> { last_cat_name } </u>
                                                        </div>

                                                        <div className='search_album_name_and_price_grid'>
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
    }), 
  
    (dispatch) => ({
      signupAction : bindActionCreators(signupAction, dispatch),
      searchAction : bindActionCreators(searchAction, dispatch),
      configAction : bindActionCreators(configAction, dispatch)
    })
  )(Search);