import React, { Component } from 'react';
import axios from 'axios';
import queryString from 'query-string';

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import * as adminAction from '../../../Store/modules/admin';
import '../../../css/admin/admin_goods.css';

import $ from 'jquery';
import URL from '../../../config/url';
import icon from '../../../source/img/icon.json';

import category_list from '../../../source/admin_page.json';

let select_able = false;
class AdminGoods extends Component {

    componentDidMount () {
        // goods 정보 가져오기

        this._getGoodsData();

        // qry 체크하기
        this._checkQry();
    }

    _checkQry = () => {
        const { location, adminAction } = this.props;
        const qry = queryString.parse(location.search);

        const save_obj = {};
        save_obj['first_cat'] = qry.first_cat ? qry.first_cat : 'none';
        save_obj['last_cat'] = qry.last_cat ? qry.last_cat : 'none';
        save_obj['min_price'] = qry.min_price ? qry.min_price : null;
        save_obj['max_price'] = qry.max_price ? qry.max_price : null;
        save_obj['state'] = qry.state ? qry.state : 'none';
        save_obj['goods_id'] = qry.goods_id ? qry.goods_id : 0;
        save_obj['goods_name'] = qry.goods_name ? qry.goods_name : "";

        save_obj['view'] = qry.view_filter ? qry.view_filter : null;

        return adminAction.change_filter(save_obj);
    }

    _getGoodsData = async (filter) => {
        const { adminAction, location } = this.props;
        const qry = queryString.parse(location.search);

        const obj = { 'type' : 'SELECT', 'table' : 'goods', 'comment' : '상품 데이터 가져오기' };

        obj['option'] = {};
        obj['where'] = [];

        obj['order'] = [];

        if(qry.first_cat) {
            obj['option']['first_cat'] = '=';
            obj['where'].push({ 'table' : 'goods', 'key' : 'first_cat', 'value' : qry.first_cat })
        }

        if(qry.last_cat) {
            obj['option']['last_cat'] = '=';
            obj['where'].push({ 'table' : 'goods', 'key' : 'last_cat', 'value' : qry.last_cat })
        }

        if(qry.min_price || qry.max_price) {
            obj['option']['result_price'] = '>=';

            const min_price = qry.min_price ? Number(qry.min_price) : 0;
            const max_price = qry.max_price ? Number(qry.max_price) : 100000000000000;
            
            obj['where'].push({ 'table' : 'goods', 'key' : 'result_price', 'value' : [Number(min_price), Number(max_price)] });
        }

        if(qry.state) {
            if(Number(qry.state) === 0 || Number(qry.state) === 1) {
                obj['option']['state'] = '=';
                obj['where'].push({ 'table' : 'goods', 'key' : 'state', 'value' : qry.state });

                obj['option']['stock'] = '<>';
                obj['where'].push({ 'table' : 'goods', 'key' : 'stock', 'value' : 0 });

            } else {
                obj['option']['stock'] = '=';
                obj['where'].push({ 'table' : 'goods', 'key' : 'stock', 'value' : 0 });
            }
        }

        if(qry.goods_id) {
            obj['option']['id'] = '=';
            obj['where'].push({ 'table' : 'goods', 'key' : 'id', 'value' : qry.goods_id });
        }

        if(qry.goods_name) {
            obj['option']['name'] = 'LIKE';
            obj['where'].push({ 'table' : 'goods', 'key' : 'name', 'value' : "%" + qry.goods_name + "%" });
        }

        obj['order'][0] = { 'table' : 'goods', 'key' : 'id', 'value' : 'DESC' };

        if(qry.view_filter) {
            if(qry.view_filter === 'high_price') {
                obj['order'][0] = { 'table' : 'goods', 'key' : 'result_price', 'value' : 'DESC' };
            
            } else if(qry.view_filter === 'low_price') {
                obj['order'][0] = { 'table' : 'goods', 'key' : 'result_price', 'value' : 'ASC' };
            
            } else if(qry.view_filter === 'sales') {
                obj['order'][0] = { 'table' : 'goods', 'key' : 'sales', 'value' : 'DESC' };

            } else if(qry.view_filter === 'star') {
                obj['order'][0] = { 'table' : 'goods', 'key' : 'star', 'value' : 'DESC' };

            } else if(qry.view_filter === 'date') {
                obj['order'][0] = { 'table' : 'goods', 'key' : 'date', 'value' : 'DESC' };   
            }
        }


        const get_goods_data = await axios(URL + '/api/query', {
            method : 'POST',
            headers: new Headers(),
            data : obj
        });
        const goods_result = get_goods_data.data[0];


        // 갯수 구하기
        const cover_obj = obj;
        cover_obj['count'] = true;

        const get_goods_cnt = await axios(URL + '/api/query', {
            method : 'POST',
            headers: new Headers(),
            data : cover_obj
        });
        const goods_cnt = get_goods_cnt.data[0][0]['count(*)'];

        return adminAction.set_goods_data({ 'data' : JSON.stringify(goods_result), 'length' : goods_cnt });
    }

    _search = (event) => {
        const { 
            location, write_first_cat, write_last_cat, goods_min_price, goods_max_price, goods_state, _filterURL,
            goods_search_id, goods_search_name
        } = this.props;

        event.preventDefault();

        // const form_data = event.target;
        const qry = queryString.parse(location.search);

        // 카테고리
        write_first_cat !== 'none' ? qry['first_cat'] = write_first_cat : delete qry['first_cat'];
        write_last_cat !== 'none' ? qry['last_cat'] = write_last_cat : delete qry['last_cat'];

        if(goods_min_price > 0) {
            if(goods_max_price > 0) {
                if(Number(goods_min_price) > Number(goods_max_price)) {
                    alert('최소 금액이 최대 금액보다 큽니다. \n최소 가격을 낮추거나 최대 금액을 올려주세요.');
                    $('input[name=min_price]').focus();

                    return;
                }
            }

            qry['min_price'] = goods_min_price;

        } else {
            delete qry['min_price']
        }

        if(goods_max_price > 0) {
            qry['max_price'] = goods_max_price;

        } else {
            delete qry['max_price'];
        }

        goods_state !== 'none' ? qry['state'] = goods_state : delete qry['state'];

        goods_search_id > 0 ? qry['goods_id'] = goods_search_id : delete qry['goods_id'];
        goods_search_name.length > 0 ? qry['goods_name'] = goods_search_name : delete qry['goods_name'];

        _filterURL(qry, "");
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

        await this._getGoodsData();
        return alert(ment + '으로 전환이 완료되었습니다.');
    }

    // 카테고리 옵션 변화
    _changeCatData = (event, type) => {
        const { adminAction } = this.props;
        const values = event.target.value;

        const save_obj = {};
        if(values === 'none') {
            save_obj[type] = 'none';

        } else {
            save_obj[type] = values;
        }

        if(type === 'first') {
            save_obj['last'] = 'none';

            const selector = document.getElementById('last_cat_none_value')
            selector.selected = true;
        }

        return adminAction.set_write_cat(save_obj);
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

    _selectGoods = (id, all) => {
        const { adminAction, goods_length } = this.props;
        let goods_select = JSON.parse(this.props.goods_select);
        const goods_data = JSON.parse(this.props.goods_data);

        if(!all) {
            if(!goods_select[id]) {
                // 없다면 추가
                goods_select[id] = { 'id' : id };

            } else {
                // 있다면 제거
                delete goods_select[id];
            }

        } else {
            if(goods_length !== Object.keys(goods_select).length) {
                // 올체크 ON
                goods_data.forEach( (el) => {
                    if(!goods_select[el.id]) {
                        goods_select[el.id] = { 'id' : el.id }
                    }
                })

            } else {
                // 올체크 OFF
                goods_select = {};
            }
        }

        return adminAction.set_goods_data({ 'select' : JSON.stringify(goods_select) });
    }

    // 필터 옵션 제거
    _removeFilter = (type) => {
        const { location, _filterURL } = this.props;
        const qry = queryString.parse(location.search);

        if(type === 'price') {
            delete qry['min_price'];
            delete qry['max_price'];

        } else {
            delete qry[type];
        }

        if(Object.keys(qry).length === 0) {
            return window.location.href = '/admin/goods';
        }

        return _filterURL(qry, "");
    }

    _selectViewFilter = async (type) => {
        const { location, _filterURL } = this.props;
        const qry = queryString.parse(location.search);

        if(qry['view_filter'] === type) {
            delete qry['view_filter'];

        } else {
            qry['view_filter'] = type;
        }

        if(Object.keys(qry).length === 0) {
            return window.location.href = '/admin/goods';
        }

        return _filterURL(qry, "");
    }

    _selectFuntion = async () => {
        const select_value = $('select[name=admin_goods_selector]').val();
        const goods_select = JSON.parse(this.props.goods_select);

        if(select_able === true) {
            alert('처리중입니다.')
            return;
        }

        if(select_value === 'none') {
            alert('변경할 옵션을 선택해주세요.');
            $('select[name=admin_goods_selector]').focus();

            return;

        } else {
            if(Object.keys(goods_select).length === 0) {
                alert('하나 이상의 상품을 선택해주세요.')
                return;

            } else {
                let ment = '선택된 ' + Object.keys(goods_select).length + ' 개의 상품들을 모두 ' ;
                let complate_ment = '선택된 모든 상품들';

                if(select_value === 'off') {
                    ment += '비활성화 하시겠습니까?';
                    complate_ment += '을 비활성화 했습니다.';

                } else if(select_value === 'on') {
                    ment += '활성화 하시겠습니까?';
                    complate_ment += '을 활성화 했습니다.';
                }

                if(select_value !== 'add_sales') {
                    if(!window.confirm(ment)) {
                        return;
                    }

                } else {
                    complate_ment += '의 재고를 추가했습니다.';
                }

                select_able = true;
                const change_select = async (limit) => {
                    const goods_id = Object.values(goods_select)[limit].id;

                    const update_obj = { 'type' : 'UPDATE', 'table' : 'goods', 'comment' : '선택 상품들 부가 옵션' }

                    update_obj['where_limit'] = 0;

                    update_obj['columns'] = [];
                    if(select_value === 'off') {
                        update_obj['columns'][0] = { 'key' : 'state', 'value' : 0 };

                    } else if(select_value === 'on') {
                        update_obj['columns'][0] = { 'key' : 'state', 'value' : 1 };

                    } else if(select_value === 'add_sales') {
                        update_obj['columns'][0] = { 'key' : 'stock', 'option' : '+', 'value' : 100};
                    }

                    update_obj['where'] = [];
                    update_obj['where'][0] = { 'key' : 'id', 'value' : goods_id };

                    await axios(URL + '/api/query', {
                        method : 'POST',
                        headers: new Headers(),
                        data : update_obj
                    })

                    limit += 1;
                    if(limit >= Object.keys(goods_select).length) {
                        return true;
                    }

                    return change_select(limit);
                }

                const all_change = await change_select(0);
                
                if(all_change) {
                    select_able = false;

                    await this._getGoodsData();

                    return alert(complate_ment)
                }

            }
        }
    }

    render() {
        const { 
            goods_loading, goods_length, location, _searchCategoryName, goods_state, goods_search_id, goods_search_name,
            write_first_cat, write_last_cat, price_comma, adminAction, goods_min_price, goods_max_price, _searchStringColor, goods_view_filter
        } = this.props;

        const { _search, _selectFuntion, _goodsStateToggle, _changeCatData, _selectViewFilter, _selectGoods, _removeFilter } = this;

        const goods_data = JSON.parse(this.props.goods_data);
        const goods_select = JSON.parse(this.props.goods_select);

        const qry = queryString.parse(location.search);
        const search_name = qry.search;

        let min_price, max_price;

        if(qry.min_price || qry.max_price) {
            min_price = qry.min_price;
            max_price = qry.max_price;
        }

        const first_category_list = category_list.first_category.category;

        let last_cat_list = null;
        if(write_first_cat !== 'none' || qry.first_cat) {
            const cover_target = write_first_cat !== 'none' ? write_first_cat : qry.first_cat;
            last_cat_list = category_list.last_category[cover_target];
        }

        // console.log(write_first_cat, last_cat_list)

        // let selected_first = write_first_cat;
        // let selected_last = write_last_cat;

        // if(qry.first_cat) {
        //     selected_first = qry.first_cat;
        // }

        // if(qry.last_cat) {
        //     selected_last = qry.last_cat;
        // }

        let first_cat_name = '';
        let last_cat_name = '';
        if(qry.first_cat) { first_cat_name = _searchCategoryName(qry.first_cat, 'first'); }
        if(qry.last_cat) { last_cat_name = _searchCategoryName(qry.last_cat, 'last', qry.first_cat) }

        const star_arr = [1, 2, 3, 4, 5];

        let border_style = { 'borderTop' : 'solid 2px #ababab', 'borderBottom' : 'solid 2px #ababab' };
        if(goods_length === 0) {
            border_style = { 'borderTop' : 'dotted 1px #ababab', 'borderBottom' : 'dotted 1px #ababab' };
        }

        const select_length = Object.keys(goods_select).length;

        let filter_price = '';
        if(qry.min_price && qry.max_price) {
            filter_price =  price_comma(qry.min_price) + ' 원　~　' + price_comma(qry.max_price) + ' 원';

        } else {
            if(qry.min_price) {
                filter_price = price_comma(qry.min_price) + ' 원　~　';

            } else if(qry.max_price) {
                filter_price = '~　' + price_comma(qry.max_price) + ' 원';
            }
        }

        let filter_state = '';
        if(qry.state) {
            const cover_state = Number(qry.state);

            if(cover_state === 1) {
                filter_state = '판매중';

            } else if(cover_state === 0) {
                filter_state = '판매 중지';

            } else if(cover_state === 2) {
                filter_state = '매진';
            }
        }

        let view_filter_name = '';
        if(qry.view_filter) {
            const view_filter = qry.view_filter;

            if(view_filter === 'high_price') {
                view_filter_name = '높은 가격 순';

            } else if(view_filter === 'low_price') {
                view_filter_name = '낮은 가격 순';
            
            } else if(view_filter === 'sales') {
                view_filter_name = '판매 순';

            } else if(view_filter === 'star') {
                view_filter_name = '평점 순';

            } else if(view_filter === 'date') {
                view_filter_name = '생성 일자 순';
            }
        }

        return(
            <div id='admin_goods_div'>
                {goods_loading === true
                    ? <div id='admin_goods_info_div'>

                        <form name='admin_goods_filter' onSubmit={_search}>
                        <div id='admin_goods_filter_div'>
                            <h4 className='custom_color_1'> ● 상품 필터 </h4>

                            <div id='admin_view_filter_contents_div' className='font_12'>
                                <div id='admin_view_filter_div'>
                                    <div> 
                                        <div> 상위 카테고리　|　 
                                            <select className='admin_view_filter_selector pointer'
                                                    name='first_category'
                                                onChange={(event) => _changeCatData(event, 'first')}
                                                value={write_first_cat}
                                                style={write_first_cat !== 'none' ? { 'backgroundColor' : '#d3e0ea' } : null}
                                            >
                                                <option value='none'> - </option>
                                                {first_category_list.map( (el, key) => {
                                                    return(
                                                        <option key={key} value={el.value}> 
                                                            {el.name}
                                                        </option>
                                                    )
                                                })}
                                            </select>
                                        </div>

                                        <div> 하위 카테고리　|　 
                                            <select className='admin_view_filter_selector pointer'
                                                    name='last_category'
                                                onChange={(event) => _changeCatData(event, 'last')}
                                                value={write_last_cat}
                                                style={write_last_cat !== 'none' ? { 'backgroundColor' : '#d3e0ea' } : null}
                                            >
                                                <option value='none' id='last_cat_none_value'>  - </option>
                                                {last_cat_list !== null
                                                    ? last_cat_list.map( (el, key) => {
                                                        return(
                                                            <option key={key} value={el.value}> 
                                                                {el.name}
                                                            </option>
                                                        )
                                                    })
                                                    
                                                    : null
                                                }
                                            </select>    
                                        </div>
                                    </div>
                                        
                                    <div className='aCenter'> 
                                        <div>
                                            가격　|　
                                            <input type='number' name='min_price' className='admin_goods_price_input' min={0}
                                                style={ goods_min_price > 0 ? { 'backgroundColor' : '#d3e0ea' } : null }
                                                defaultValue={goods_min_price}
                                                onChange={(event) => adminAction.change_filter({ 'min_price' : event.target.value })}
                                            /> 원
                                            　~　
                                            <input type='number' name='max_price' className='admin_goods_price_input' min={0} 
                                                style={ goods_max_price > 0 ? { 'backgroundColor' : '#d3e0ea' } : null }
                                                defaultValue={goods_max_price}
                                                onChange={(event) => adminAction.change_filter({ 'max_price' : event.target.value })}
                                            /> 원
                                        </div>

                                        <div> 
                                            상품 상태　|　
                                            <select name='goods_state' className='admin_view_filter_selector pointer' value={goods_state}
                                                onChange={(event) => adminAction.change_filter({ 'state' : event.target.value })}
                                                style={ goods_state !== 'none' ? { 'backgroundColor' : '#d3e0ea' } : null }
                                            >
                                                <option value='none'> - </option>
                                                <option value={1}> 판매중 </option>
                                                <option value={0}> 판매 중지 </option>
                                                <option value={2}> 매진 </option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className='aRight'>
                                        <div>
                                            <div> 상품 번호　|　
                                                <input type='number' name='goods_id' className='admin_view_filter_input' 
                                                    onChange={(event) => adminAction.change_filter({ 'goods_id' : event.target.value })}
                                                    style={ goods_search_id > 0 ? { 'backgroundColor' : '#d3e0ea' } : null }
                                                    defaultValue={goods_search_id}
                                                /> 
                                            </div>

                                            <div> 상품 이름　|　
                                                <input type='text' maxLength='10' name='goods_name' className='admin_view_filter_input' 
                                                    onChange={(event) => adminAction.change_filter({ 'goods_name' : event.target.value.trim() })}
                                                    style={ goods_search_name.length > 0 ? { 'backgroundColor' : '#d3e0ea' } : null }
                                                    defaultValue={goods_search_name}
                                                /> 
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {Object.keys(qry).length > 0
                            ?   <div id='admin_goods_filter_option_div'>
                                    <h4> 적용중인 필터 <img src={icon.icon.reload} alt='' className='pointer' onClick={() => window.location.href='/admin/goods'} /> </h4>
                                
                                    <div id='admin_goods_filter_option_grid_div' className='font_12 gray'>
                                        <div id='admin_goods_filter_option_title_div'>
                                            <ul>
                                                {qry.first_cat ? <li> 상위 카테고리 </li> : null}
                                                {qry.last_cat ? <li> 하위 카테고리 </li> : null}
                                                {qry.min_price || qry.max_price ? <li> 가격 </li> : null}
                                                {qry.state ? <li> 상품 상태 </li> : null}
                                                {qry.goods_id ? <li> 상품 번호 </li> : null}
                                                {qry.goods_name ? <li> 상품 이름 </li> : null}

                                                {qry.view_filter ? <li className='view_filter_div'> 조회 옵션 </li> : null}
                                            </ul>
                                        </div>

                                        <div id='admin_goods_filter_option_contents_div'>
                                            {qry.first_cat ? <div> {first_cat_name} <img onClick={() => _removeFilter('first_cat')} className='admin_goods_filter_remove_icon' alt='' src={icon.icon.close_circle_gray} /> </div> : null }
                                            {qry.last_cat ? <div> {last_cat_name} <img onClick={() => _removeFilter('last_cat')} className='admin_goods_filter_remove_icon' alt='' src={icon.icon.close_circle_gray} /> </div> : null }
                                            {filter_price !== "" ? <div> {filter_price} <img onClick={() => _removeFilter('price')} className='admin_goods_filter_remove_icon' alt='' src={icon.icon.close_circle_gray} /> </div>  : null }
                                            {filter_state !== "" ? <div> {filter_state} <img onClick={() => _removeFilter('state')} className='admin_goods_filter_remove_icon' alt='' src={icon.icon.close_circle_gray} /> </div>  : null }
                                            {qry.goods_id ? <div> {qry.goods_id} 번 <img onClick={() => _removeFilter('goods_id')} className='admin_goods_filter_remove_icon' alt='' src={icon.icon.close_circle_gray} /> </div>  : null }
                                            {qry.goods_name ? <div> {qry.goods_name} <img onClick={() => _removeFilter('goods_name')} className='admin_goods_filter_remove_icon' alt='' src={icon.icon.close_circle_gray} /> </div>  : null }
                                        
                                            {view_filter_name !== "" ? <div> {view_filter_name} <img onClick={() => _removeFilter('view_filter')} className='admin_goods_filter_remove_icon' alt='' src={icon.icon.close_circle_gray} /> </div>  : null }
                                        </div>
                                    </div>
                                </div>

                            : null
                        }

                        <input type='submit' value='통합 검색' id='admin_goods_filter_search_button' className='pointer' />
                        </form>

                        <div id='admin_goods_view_filter_div' className='aRight font_12 gray'>
                            <div className={goods_view_filter === 'high_price' ? 'custom_color_1 bold' : null}> 
                                <u onClick={() => _selectViewFilter('high_price')} > 
                                    가격 높은 순 
                                </u>
                            </div>

                            <div className={goods_view_filter === 'low_price' ? 'custom_color_1 bold' : null}> 
                                <u onClick={() => _selectViewFilter('low_price')} > 
                                    가격 낮은 순 
                                </u>
                            </div>

                            <div className={goods_view_filter === 'sales' ? 'custom_color_1 bold' : null}> 
                                <u onClick={() => _selectViewFilter('sales')} > 
                                    판매 순
                                </u>
                            </div>
                            
                            <div className={goods_view_filter === 'star' ? 'custom_color_1 bold' : null}> 
                                <u onClick={() => _selectViewFilter('star')} > 
                                    평점 순
                                </u>
                            </div>

                            <div className={goods_view_filter === 'date' ? 'custom_color_1 bold' : null}> 
                                <u onClick={() => _selectViewFilter('date')} > 
                                    생성 일자 순
                                </u>
                            </div>
                        </div>

                        <div id='admin_contents_divs'>
                        
                        <div className='grid_half marginTop_30' id='admin_goods_length_div'>
                            <div id='admin_goods_length_title' className='font_12 bold'> 총 {goods_length} 개의 상품 데이터를 조회했습니다. </div>
                            <div className='aRight'> <input className='pointer button_style_1' type='button' value='상품 등록' id='admin_write_goods_button'  onClick={() => window.location.href='/admin/goods/goods_write'} /> </div>
                        </div>

                        <div id='admin_goods_select_div' className='grid_half'>
                            <div className='font_13 gray'>
                                <input type='checkbox' id='mypage_all_select' className='pointer check_custom_1' 
                                            onChange={() => _selectGoods(null, true)}
                                            checked={select_length === goods_length}
                                />
                                <span className='check_toggle_1' 
                                        onClick={() => _selectGoods(null, true)}
                                > </span>
                                <label className='pointer' htmlFor='mypage_all_select' id='mypage_qna_all_check_label'> 
                                    전체 선택 ( {select_length} / {goods_length} )
                                </label>
                            </div>

                            <div id='admin_goods_select_option_div' className='aRight font_12'>
                                <div> 선택 
                                    <select id='admin_goods_option_select'
                                        className='pointer'
                                        name='admin_goods_selector'
                                    >
                                        <option value='none'> - 옵션 - </option>
                                        <option value='off'> 비활성화 </option>
                                        <option value='on'> 활성화 </option>
                                        <option value='add_sales'> 재고 100 개 추가 </option>
                                    </select>
                                    <input type='button' value='확인' className='pointer bold'
                                          onClick={_selectFuntion}
                                    />
                                </div>
                            </div>
                        </div>

                        <div id='admin_goods_data_info_div'
                            style={border_style}
                        >
                            {goods_length > 0 
                            ? <div id='admin_goods_list_div'>
                                {goods_data.map( (el, key) => {
                                    const border_style = (key + 1) < goods_data.length
                                        ? { 'borderBottom' : 'solid 1px #ababab' }
                                        : null

                                    let goods_state = '상태　|　';

                                    if(el.stock <= 0) {
                                        goods_state += '<b class="red"> 매진 </b>';

                                    } else if(el.state === 0) {
                                        goods_state += '<b class="gray"> 판매 중지 </b>';

                                    } else {
                                        goods_state += '<b> 판매중 </b>';
                                    }

                                    let goods_star = '평점　|　';
                                    star_arr.forEach( (cu) => {
                                        if(el.star >= cu) {
                                            goods_star += '<b class="star_color"> ★ </b>';

                                        } else {
                                            goods_star += '<b> ☆ </b>';
                                        }
                                    })
                                    goods_star += ' ( ' + el.star + ' )';

                                    let goods_stock = '재고　|　';
                                    if(el.stock > 0) {
                                        goods_stock += price_comma(el.stock) + ' 개';

                                    } else {
                                        goods_stock += '<u class="red">' + price_comma(el.stock) + ' 개</u>'
                                    }

                                    let discount_price = 0;
                                    discount_price = el.discount_price / 100;
                                    discount_price = Math.round(el.origin_price * discount_price);

                                    if(discount_price === 0) {
                                        if(el.discount_price !== 0) {
                                            discount_price = 1;
                                        }
                                    }

                                    const first_cat = _searchCategoryName(el.first_cat, 'first');
                                    const last_cat = _searchCategoryName(el.last_cat, 'last', el.first_cat);

                                    let class_col = 'admin_goods_list_div';
                                    if(goods_select[el.id]) {
                                        class_col += ' select_list';
                                    }

                                    let goods_name = el.name;
                                    if(qry.goods_name) {
                                        goods_name = _searchStringColor(goods_name, qry.goods_name);
                                    }

                                    return(
                                        <div className={class_col} key={key}
                                            style={border_style}
                                        >
                                            <div className='admin_goods_other_div font_12'>
                                                <div className='aLeft'> 
                                                    <input type='checkbox' className='pointer' id={'admin_goods_list_' + el.id}
                                                           checked={goods_select[el.id]}
                                                           onChange={() => _selectGoods(el.id)}
                                                    />
                                                    <label
                                                        className={qry.goods_id ? 'pointer custom_color_1 bold' : 'pointer'}
                                                        htmlFor={'admin_goods_list_' + el.id}> 
                                                            No. {el.id} 
                                                    </label>
                                                </div>

                                                <div className='aCenter'>
                                                    <div 
                                                        className={qry.state ? 'bold custom_color_1' : null}
                                                        dangerouslySetInnerHTML={{ __html : goods_state }}
                                                    />
                                                </div>

                                                <div>
                                                    <div className={qry.view_filter === 'sales' ? 'bold custom_color_1' : null}> 
                                                        판매　|　{price_comma(el.sales)} 개 
                                                    </div>
                                                    <div dangerouslySetInnerHTML={{ __html : goods_stock }} />
                                                </div>

                                                <div>
                                                    <div
                                                        className={qry.view_filter === 'star' ? 'bold custom_color_1' : null} 
                                                        dangerouslySetInnerHTML={{ __html : goods_star }} 
                                                    />

                                                    <div className={qry.view_filter === 'date' ? 'bold custom_color_1' : null}> 
                                                        일자　|　{el.date.slice(0, 16)} 
                                                    </div>
                                                </div>

                                                <div className='aRight'>
                                                    <div> 
                                                        <input type='button' value='수정' className='admin_goods_other_button pointer' /> 
                                                    </div>

                                                    <div>
                                                        {el.state === 1
                                                            ? <input type='button' value='비활성화' className='admin_goods_other_button pointer' 
                                                                     onClick={() => _goodsStateToggle(el.id, el.name, false)}
                                                                /> 

                                                            : <input type='button' value='활성화' className='admin_goods_other_button pointer' 
                                                                     onClick={() => _goodsStateToggle(el.id, el.name, true)}
                                                                /> 
                                                        }
                                                        
                                                    </div>
                                                </div>
                                            </div>

                                            <div className='admin_goods_info_grid_divs'>
                                                <div>
                                                    <div className='admin_goods_category_name_div font_12 gray aLeft'>
                                                        [ 
                                                         <div className={qry.first_cat ? 'inline_block bold custom_color_1' : 'inline_block'}> {first_cat} </div>
                                                        　|　
                                                         <div className={qry.last_cat ? 'inline_block bold custom_color_1' : 'inline_block'}> {last_cat} </div>
                                                        ]
                                                    </div>

                                                    <div
                                                        className='admin_goods_thumbnail'
                                                        style={{ 'backgroundImage' : `url(${el.thumbnail})` }} 
                                                    />
                                                </div>

                                                <div className='admin_goods_info'>
                                                    <div className='admin_goods_title recipe_korea' dangerouslySetInnerHTML={{ __html : goods_name }} />
                                                    <div className='admin_goods_price_info_div font_14'> 
                                                        <div> 원가　|　{price_comma(el.origin_price)} 원 </div>
                                                        <div className='gray'> 할인　|　- {price_comma(discount_price)} 원 ( {el.discount_price} % ) </div>
                                                        <div className={qry.view_filter === 'high_price' || qry.view_filter === 'low_price' || qry.min_price || qry.max_price
                                                                            ? 'admin_goods_result_price_div bold underLine custom_color_1'
                                                                            : 'admin_goods_result_price_div'
                                                    }> 
                                                            가격　|　{price_comma(el.result_price)} 원 
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>


                            : <div id='admin_goods_empty_div' className='aCenter'>
                                <h3> 상품 데이터가 없습니다. </h3>
                              </div>
                            }
                        </div>

                        </div>

                      </div>
                
                    : <div id='admin_goods_loading_div' className='aCenter'>
                        <h4> 데이터를 불러오고 있습니다. </h4>
                      </div>
                }                
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
        goods_length : state.admin.goods_length,
        goods_loading : state.admin.goods_loading,
        goods_select : state.admin.goods_select,
        write_first_cat : state.admin.write_first_cat,
        write_last_cat : state.admin.write_last_cat,
        goods_min_price : state.admin.goods_min_price,
        goods_max_price : state.admin.goods_max_price,
        goods_search_id : state.admin.goods_search_id,
        goods_search_name : state.admin.goods_search_name,
        goods_state : state.admin.goods_state,
        goods_view_filter : state.admin.goods_view_filter
    }), 
  
    (dispatch) => ({
        adminAction : bindActionCreators(adminAction, dispatch)
    })
  )(AdminGoods);