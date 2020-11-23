import React, { Component } from 'react';
import axios from 'axios';
import queryString from 'query-string';

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import * as adminAction from '../../../Store/modules/admin';
import '../../../css/responsive/admin.css';

import $ from 'jquery';
import URL from '../../../config/url';
import img from '../../../source/img/icon.json';

import category_list from '../../../source/admin_page.json';

class AdminGoods extends Component {

    componentDidMount () {
        // goods 정보 가져오기

        this._getGoodsData();
    }

    _getGoodsData = async (filter) => {
        const { adminAction, location } = this.props;
        let result = {};
        let obj = { 'search' : '', 'min' : 0, 'max' : 10000000000000, 'first' : "", 'last' : "" };
        obj['filter_target'] = 'id';
        obj['filter_value'] = 'ASC'

        const qry = queryString.parse(location.search);
        if(qry.search) {
            obj['search'] = qry.search;
        }

        const min_price = Number(qry.min_price);
        const max_price = Number(qry.max_price);

        if(min_price > 0) {
            obj['min'] = min_price;
        }

        if(max_price > 0) {
            obj['max'] = max_price;
        }

        if(min_price > 0 && max_price > 0) {
            if(min_price > max_price) {
                alert('최소값이 최대값보다 클 수 없습니다.');

                return window.location.replace('/admin/goods/')
            }
        }

        // 카테고리 옵션 추가하기
        const first_cat = qry.first_cat;
        const last_cat = qry.last_cat;

        if(first_cat) {
            obj['first'] = first_cat;
        }

        if(last_cat) {
            obj['last'] = last_cat;
        }

        // 필터 확인
        if(filter) {
            if(filter === 'high_price') {
                obj['filter_target'] = 'result_price';
                obj['filter_value'] = 'DESC'

            } else if(filter === 'low_price') {
                obj['filter_target'] = 'result_price';
                obj['filter_value'] = 'ASC'
            }
        }

        // goods 정보 / 갯수 가져오기
        const get_goods_data = await axios(URL + '/get/goods_data', {
            method : 'POST',
            headers: new Headers(),
            data : obj
        })

        result['data'] = get_goods_data.data.data;
        result['cnt'] = get_goods_data.data.cnt;

        return adminAction.set_goods_data({ 'data' : JSON.stringify(result) });
    }

    _search = (event) => {
        const { _pageMove } = this.props;
        const search_str = $('input[name=search]').val().trim();

        let add_url_str = '?';
        let total_url = '/admin/goods/';
        if(search_str.length !== 0) {
            total_url = '/admin/goods/?search=' + search_str;
            add_url_str = '&';
        }

        // 가격 옵션 가져오기
        const min_price = Number($('input[name=min_price]').val());
        const max_price = Number($('input[name=max_price]').val());

        if(min_price > 0 || max_price > 0) {
            if(min_price > 0) {
                total_url += add_url_str + 'min_price=' + min_price;
                add_url_str = '&';
            }

            if(max_price > 0) {
                total_url += add_url_str + 'max_price=' + max_price;
                add_url_str = '&';
            }

        } else if(min_price > 0 && max_price > 0) {
            if(min_price > max_price) {
                alert('최소값이 최대값보다 클 수 없습니다.');

                return $('input[name=min_price]').focus();
            }
        }

        const first_cat = $('select[name=search_first_cat]').val();
        const last_cat = $('select[name=search_last_cat]').val();

        // 카테고리 옵션 추가하기
        if(first_cat !== '') {
            total_url += add_url_str + 'first_cat=' + first_cat;
            add_url_str = '&';
        }

        if(last_cat !== '') {
            total_url += add_url_str + 'last_cat=' + last_cat;
            add_url_str = '&';
        }

        event.preventDefault();

        return _pageMove('href', total_url);
    }

    // 상품 삭제
    _goodsDelete = async (id, name) => {
        if(window.confirm('`' + name + '`\n상품을 정말 삭제하시겠습니까?')) {

            const delete_goods = await axios(URL + '/delete/goods', {
                method : 'POST',
                headers: new Headers(),
                data : { 'id' : id }
            })

            if(delete_goods.data === true) {
                this._getGoodsData();

                return alert('삭제가 완료되었습니다.');
            }
        }
        return;
    }

    // 상품 공개 & 비공개 Toggle
    _goodsStateToggle = async (id, name, bool) => {
        const data = { 'id' : id, 'bool' : bool }
        let ment = '공개중';

        if(bool === false) {
            // 공개중 -> 비공개
            ment = '비공개';
        } 

        if(!window.confirm('`' + name + '`\n상품을 '+ ment + '로 전환하시겠습니까?')) {
            return;
        }

        await axios(URL + '/update/goods_state', {
            method : 'POST',
            headers: new Headers(),
            data : data
        })

        this._getGoodsData();
        return alert(ment + '전환이 완료되었습니다.');
    }

    // 카테고리 옵션 변화
    _changeCatData = (type) => {
        const { adminAction } = this.props;
        const first_cat = $('select[name=search_first_cat]').val();

        let last_cat = '';
        if(type === 'last') {
            last_cat = $('select[name=search_last_cat]').val();
        }

        return adminAction.set_write_cat({ 'first' : first_cat, 'last' : last_cat  });
    }

    // 필터 선택
    _selectFilter = (type) => {
        $('#admin_goods_filter_select_div u').css({ 'color' : '#ababab', 'fontWeight' : '400' })

        if($('#admin_goods_filter_' + type).hasClass('select_filter')) {
            $('#admin_goods_filter_' + type).removeClass('select_filter');

            return this._getGoodsData('default')

        } else {
            $('#admin_goods_filter_select_div u').removeClass('select_filter');
            $('#admin_goods_filter_' + type).addClass('select_filter');
        }

        return this._getGoodsData(type)
    }

    render() {
        const { _pageMove, goods_data, goods_loading, location, _searchCategoryName, write_first_cat, write_last_cat, price_comma } = this.props;
        const { _search, _goodsDelete, _goodsStateToggle, _changeCatData, _selectFilter } = this;

        const cover_gooda_data = JSON.parse(goods_data);

        const qry = queryString.parse(location.search);
        const search_name = qry.search;

        let min_price, max_price;

        if(qry.min_price || qry.max_price) {
            min_price = qry.min_price;
            max_price = qry.max_price;
        }

        let last_cat_list = null;
        if(write_first_cat || qry.first_cat) {
            const cover_target = write_first_cat || qry.first_cat;
            last_cat_list = category_list.last_category[cover_target];
        }

        let selected_first = write_first_cat;
        let selected_last = write_last_cat;

        if(qry.first_cat) {
            selected_first = qry.first_cat;
        }

        if(qry.last_cat) {
            selected_last = qry.last_cat;
        }
        
        return(
            <div id='admin_goods_div'>
                <div id='admin_goods_other_div' className='aRight'>
                    <div className='aLeft marginLeft_20' id='admin_goods_search_div'> 
                        <form name='admin_goods_search_form' id='admin_goods_search_form' onSubmit={_search}>
                            <u> 검색 </u>
                            <input className='marginLeft_10 padding_5' name='search' 
                                   placeholder='상품명을 입력하세요.' defaultValue={search_name}
                            />
                            <img src={img.icon.search_black} alt='' id='admin_goods_search_icon'
                                className='border padding_3 pointer' onClick={_search}
                            />
                        </form>
                    </div>

                    <div className='grid_half' id='admin_goods_other_button_div'>
                        <div> <u> 선택 삭제 </u> </div>
                        <div className='page_move'> 
                            <u onClick={() => _pageMove('href', '/admin/goods/goods_write')}> 
                                상품 등록 
                            </u> 
                        </div>
                    </div>
                </div>

                <div id='admin_goods_list_div' className='border_top marginTop_20'>
                    
                    <div id='admin_goods_search_option_top_div' className='border_bottom'>
                        <div id='admin_goods_search_option'>
                            <img src={img.icon.search_option} id='admin_goods_search_option_icon' title='검색 옵션'/>
                        </div>

                        <div id='admin_goods_search_option_detail_div' className='grid_half font_13'>
                            <div id='admin_goods_search_option_detail_price' >
                                <b> 가격 </b>　
                                <input type='number' min={0} name='min_price' defaultValue={min_price} /> 원
                                　~　
                                <input type='number' max={1000000000} name='max_price' defaultValue={max_price} /> 원
                            </div>

                            <div id='admin_goods_search_option_cat_div'>
                               <b> 카테고리 </b>

                               <select name='search_first_cat' onChange={() => _changeCatData()} defaultValue={selected_first}>
                                    <option value=''>
                                        -- 선택 -- 
                                    </option>
                                    {category_list.first_category.category.map( (el, key) => {
                                        return(
                                            <option key={key} value={el.value}>
                                                {el.name}
                                            </option>
                                        )
                                    })}

                                </select>

                                <select name='search_last_cat' defaultValue={selected_last} onChange={() => _changeCatData('last')}>
                                    <option value=''>
                                        -- 선택 -- 
                                    </option>
                                    {last_cat_list !== null 
                                    ? last_cat_list.map( (el, key) => {
                                        return(
                                            <option key={key} value={el.value}>
                                                {el.name}
                                            </option>
                                        )
                                    })
                                    
                                    : null}
                                </select>
                            </div>
                        </div>
                    </div>
                    {search_name ? <div className='aCenter marginTop_20 gray font_13'
                                        id='admin_goods_name_search_result_div'
                                    > 
                                        <u className='bold'>{search_name}</u> (으)로 검색한 결과 ...
                                    </div>

                                 : null
                    }

                    <div id='admin_goods_list_content_div'>
                    {
                        !goods_loading
                        ? null

                        : cover_gooda_data.cnt === 0 
                                                        ? <h4 className='aCenter marginTop_40' style={{ 'color' : '#c56183' }}> 
                                                            데이터를 찾을 수 없습니다. 
                                                          </h4>

                                                        : 
                                                        <div>
                                                        
                                                        <div className='aCenter font_14 border'
                                                             id='admin_goods_search_result_div'    
                                                        > 
                                                            { goods_loading 
                                                                ? 
                                                                <div>
                                                                    <h3> 총 <b> {cover_gooda_data.cnt} </b> 개의 데이터가 조회되었습니다. </h3>

                                                                    {qry.min_price || qry.max_price || qry.first_cat || qry.last_cat
                                                                        ?
                                                                    <div id='admin_goods_search_option_list' className='marginTop_30'>
                                                                        <p> 검색 옵션 </p>

                                                                        <div id='admin_goods_search_option_contents' className='font_13 aCenter'> 
                                                                                <ul className='list_none'>
                                                                                    {qry.min_price ? <li> - 최소 가격 : {price_comma(qry.min_price)} 원 </li> : null}
                                                                                    {qry.max_price ? <li> - 최대 가격 : {price_comma(qry.max_price)} 원 </li> : null}
                                                                                    {qry.first_cat ? <li> - 상위 카테고리 : {_searchCategoryName(qry.first_cat, 'first')} </li> : null}
                                                                                    {qry.last_cat ? <li> - 하위 카테고리 : {_searchCategoryName(qry.last_cat, 'last', qry.first_cat)} </li> : null}

                                                                                </ul>
                                                                            </div>
                                                                    </div> 

                                                                        : null
                                                                    }

                                                                </div>
                                                                
                                                                : null}
                                                        </div>

                                                        <div id='admin_goods_filter_div'>
                                                            <div id='admin_goods_filter_grid_div'>
                                                                <div id='admin_goods_filter_all_select'>
                                                                    <input type='checkbox' id='goods_all_select_button' className='pointer'/>
                                                                    <label htmlFor='goods_all_select_button' className='pointer'> 전체 선택 </label> 
                                                                </div>

                                                                <div id='admin_goods_filter_select_div'>
                                                                    <u id='admin_goods_filter_high_price' onClick={() => _selectFilter('high_price')}> 가격 높은 순 </u>
                                                                    <u id='admin_goods_filter_low_price' onClick={() => _selectFilter('low_price')}> 가격 낮은 순 </u>
                                                                    <u id='admin_goods_filter_score' onClick={() => _selectFilter('score')}> 평점순 </u>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div id='admin_goods_list_reponsive_div' className='marginTop_20 border_top display_none'>
                                                            {cover_gooda_data.data.map( (el, key) => {
                                                                const first_cat = _searchCategoryName(el.first_cat, 'first');
                                                                const last_cat = _searchCategoryName(el.last_cat, 'last', el.first_cat);

                                                                // return(
                                                                    // <div className='admin_goods_list_responsive_list border_bottom' key={key}>
                                                                    //     <p className='font_13'>
                                                                    //         <input type='checkbox' /> 　상품 번호 : { el.id }
                                                                    //     </p>

                                                                    //     <div className='admin_goods_responsive_grid_div'>
                                                                    //         <div className='admin_goods_responsive_goods_name_info'>  
                                                                    //             <div className='admin_goods_responsive_goods_thumbnail border padding_3' 
                                                                    //                  style={{ 'backgroundImage' : `url(${el.thumbnail})` }}
                                                                    //             />
                                                                    //             <p className='admin_goods_responsive_category font_12 aCenter'> [ {first_cat} /  {last_cat} ]</p>
                                                                    //             <p className='aCenter font_14 admin_goods_name_div' title={el.name}> {el.name} </p>
                                                                    //         </div>

                                                                    //         <div> 2 </div>
                                                                    //     </div>

                                                                    //     <div> 
                                                                            
                                                                    //     </div>
                                                                    // </div>
                                                                // )
                                                            })}
                                                        </div>

                                                        <div id='admin_goods_list_contentsd_not_empty' className='border marginTop_20'>
                                                            <div id='admin_goods_other_grid_div' className='admin_goods_other_grid_tools bold border_bottom'>
                                                                {/* <div className='aCenter' /> */}
                                                                <div className='aCenter'> 번호 </div>
                                                                <div className='aCenter'> 상품명 </div>
                                                                {/* <div className='aCenter'> 상품 원가 </div>
                                                                <div className='aCenter'> 할인율 </div>
                                                                <div className='aCenter'> 할인가 </div>
                                                                <div> 재고 </div> */}
                                                                <div className='aCenter'> 가격 및 재고 </div>
                                                                <div className='aCenter'> 비고 </div>
                                                            </div>

                                                            {cover_gooda_data.data.map( (el, key) => {
                                                                let goods_state = { 'color' : 'black', 'state' : '공개중' };
                                                                let state_color = 'white';

                                                                const first_cat = _searchCategoryName(el.first_cat, 'first');
                                                                const last_cat = _searchCategoryName(el.last_cat, 'last', el.first_cat);

                                                                // 재고 상태 확인
                                                                const stock = el.stock;
                                                                let stock_state = true;

                                                                if(stock === 0) {
                                                                    stock_state = false;
                                                                    goods_state['color'] = '#ea2c62'
                                                                    goods_state['state'] = '재고 없음'

                                                                    state_color = '#ffa5a5';
                                                                }

                                                                if(!el.state) {
                                                                    goods_state['color'] = 'gray'
                                                                    goods_state['state'] = '비공개'

                                                                    state_color = '#cdc9c3';
                                                                }

                                                                // 할인 금액 구하기
                                                                const dis_cnt = el.discount_price;
                                                                const discount_price = el.origin_price * (dis_cnt / 100);

                                                                return(
                                                                    <div key={key} style={{ 'backgroundColor' : state_color }} className='border_bottom'>

                                                                        <div className='admin_goods_list_responsive_list border_bottom display_none' key={key}>
                                                                            <p className='admin_goods_list_number_div font_13'>
                                                                                <input type='checkbox' /> 　상품 번호 : { el.id }
                                                                            </p>

                                                                            <div className='admin_goods_responsive_grid_div'>
                                                                                <div className='admin_goods_responsive_goods_name_info'>  
                                                                                    <div className='admin_goods_responsive_goods_thumbnail border padding_3' 
                                                                                        style={{ 'backgroundImage' : `url(${el.thumbnail})` }}
                                                                                    />
                                                                                    <p className='admin_goods_responsive_category font_12 aCenter'> [ {first_cat} /  {last_cat} ]</p>
                                                                                    <p className='aCenter font_14 admin_goods_name_div' title={el.name}> {el.name} </p>
                                                                                </div>

                                                                                <div className='admin_goods_responsive_price_info'> 
                                                                                    <ul className='admin_goods_responsive_price_ul list_none'>
                                                                                        <li> 원가 : {price_comma(el.origin_price)} 원 </li>
                                                                                        <li className='gray'> 
                                                                                            할인 : {price_comma(discount_price)} 원 ( {el.discount_price} % ) 
                                                                                        </li>

                                                                                        <li> 
                                                                                            <hr style={{ 'marginRight' : '15%' }} />
                                                                                            <b> 적용가 : {price_comma(el.result_price)} 원 </b>
                                                                                        </li>

                                                                                        <li className='admin_goods_responsive_stock_li'>
                                                                                            {stock_state 
                                                                                                ? '재고 : ' + price_comma(stock) + ' 개'
                                                                                                : <div style={{ 'lineHeight' : '10px' }}> 
                                                                                                    재고　:　<b className='font_14' style={{ 'color' : '#ea2c62' }}> 매진 </b>
                                                                                                </div>
                                                                                            }
                                                                                        </li>
                                                                                    </ul>
                                                                                </div>
                                                                            </div>

                                                                            <div className='admin_goods_responsive_other_div'> 
                                                                                <p className='font_13'>
                                                                                    <b> 상품 상태　:　</b>
                                                                                    <u className='remove_underLine' style={{ 'color' : goods_state.color}}> {goods_state.state} </u>
                                                                                </p>
                                                                                    
                                                                                <div className='admin_goods_responsive_other_fn_grid_div aCenter'>
                                                                                    <div>
                                                                                        {el.state 
                                                                                            ? <input type='button' value='비공개' 
                                                                                                     onClick={() => _goodsStateToggle(el.id, el.name, false)} />

                                                                                            : <input type='button' value='공개' 
                                                                                                     onClick={() => _goodsStateToggle(el.id, el.name, true)} />
                                                                                        }
                                                                                    </div>
                                                                                    <div> 
                                                                                        <input type='button' value='수정' 
                                                                                               onClick={() => window.location.href='/admin/goods/goods_write/?modify_id=' + el.id}
                                                                                        /> 
                                                                                    </div>
                                                                                    <div> 
                                                                                        <input type='button' value='*삭제' 
                                                                                                onClick={() => _goodsDelete(el.id, el.name)} /> 
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                        </div>

                                                                        <div className='admin_goods_other_grid_tools pointer'>
                                                                            {/* 선택 Checkbox */}
                                                                            <div className='aCenter admin_goods_table' id='admin_goods_other_goods_select'> 
                                                                                <div className='admin_goods_table_cell'>
                                                                                    <input type='checkbox' className='pointer'/> 
                                                                                </div>
                                                                            </div>
                                                                            
                                                                            <div className='admin_goods_table' id='admin_goods_other_goods_num'> 
                                                                                <div className='admin_goods_table_cell'>
                                                                                    {el.id}
                                                                                </div> 
                                                                            </div>

                                                                            <div className='aCenter admin_goods_list_names admin_goods_table admin_goods_name_contents'> 
                                                                                <div className='admin_goods_table_cell'>
                                                                                    {/* 상품명 */}
                                                                                    <div className='admin_goods_thumbnail_img' 
                                                                                        style={{ 'backgroundImage' : `url(${el.thumbnail})` }}
                                                                                    />

                                                                                    <p className='admin_goods_category_div'> [ {first_cat} / {last_cat} ] </p>
                                                                                    <p className='font_14 admin_goods_name_div' 
                                                                                        title={el.name}
                                                                                        style={{ 'textAlign' : 'center' }}    
                                                                                    > 
                                                                                            {el.name} 
                                                                                    </p>
                                                                                </div> 
                                                                            </div>

                                                                            <div className='admin_goods_table border_right border_left'>
                                                                                <div className='admin_goods_table_cell'>
                                                                                    <ul className='admin_goods_price_ul list_none'>
                                                                                        <li> 
                                                                                            원가 : {price_comma(el.origin_price)} 원
                                                                                        </li>

                                                                                        <li className='gray'> 
                                                                                            할인 : {price_comma(discount_price)} 원 ( {el.discount_price} % ) 
                                                                                        </li>

                                                                                        <li> 
                                                                                            <hr style={{ 'marginRight' : '15%' }} />
                                                                                            <b> 적용가 : {price_comma(el.result_price)} 원 </b>
                                                                                        </li>

                                                                                        <li className='marginTop_30'>
                                                                                            {stock_state 
                                                                                                ? '재고 : ' + price_comma(stock) + ' 개'
                                                                                                : <div style={{ 'lineHeight' : '10px' }}> 
                                                                                                    재고　:　<b className='font_14' style={{ 'color' : '#ea2c62' }}> 매진 </b>
                                                                                                </div>
                                                                                            }
                                                                                        </li>
                                                                                    </ul>
                                                                                </div>
                                                                            </div>

                                                                            <div className='admin_goods_table'>
                                                                                <div className='admin_goods_table_cell'>
                                                                                    <ul className='admin_goods_other_ul list_none'>
                                                                                        <li className='admin_goods_state_li'>
                                                                                            <b> 상품 상태 </b>
                                                                                            <p style={{ 'color' : goods_state.color}}> - {goods_state.state} </p>
                                                                                        </li>

                                                                                        <li>
                                                                                            {el.state

                                                                                                ?                      
                                                                                                <input type='button' value='비공개' 
                                                                                                        onClick={() => _goodsStateToggle(el.id, el.name, false)}
                                                                                                />

                                                                                                :
                                                                                                <input type='button' value='공개' 
                                                                                                        onClick={() => _goodsStateToggle(el.id, el.name, true)}
                                                                                                />
                                                                                            }

                                                                                        </li>

                                                                                        <li>
                                                                                        <input type='button' value='수정' 
                                                                                               onClick={() => window.location.href='/admin/goods/goods_write/?modify_id=' + el.id}
                                                                                        /> 
                                                                                        </li>

                                                                                        <li>
                                                                                            <input type='button' value='*삭제' 
                                                                                                    onClick={() => _goodsDelete(el.id, el.name)}
                                                                                            />
                                                                                        </li>
                                                                                    </ul>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                )
                                                            })}

                                                            <div className='marginTop_20'>
                                                                12312313
                                                            </div>
                                                        </div>
                                                    </div>
                    }
                    </div>
                </div>
            </div>
        )
    }
}

AdminGoods.defaultProps = {
  }
  
  export default connect(
    (state) => ({
        admin_code : state.admin.admin_code,
        goods_data : state.admin.goods_data,
        goods_loading : state.admin.goods_loading,
        write_first_cat : state.admin.write_first_cat,
        write_last_cat : state.admin.write_last_cat
    }), 
  
    (dispatch) => ({
        adminAction : bindActionCreators(adminAction, dispatch)
    })
  )(AdminGoods);