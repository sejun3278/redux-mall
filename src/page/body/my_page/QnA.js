import React, { Component } from 'react';
import axios from 'axios';
import queryString from 'query-string';

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import * as configAction from '../../../Store/modules/config';
import * as myPageAction from '../../../Store/modules/my_page';
import * as goodsAction from '../../../Store/modules/goods';

import '../../../css/responsive/signup.css';
import '../../../css/myPage.css';

import img from '../../../source/img/img.json';
import icon from '../../../source/img/icon.json';
import URL from '../../../config/url';
import $ from 'jquery';

class QnA extends Component {

    async componentDidMount() {

        await this._getQnAInfo();

        // 스크롤링
        window.addEventListener("scroll", this._setScrollSize);
    }

    _setScrollSize = async () => {
        const { QandA_length, scroll, scrolling, configAction } = this.props;

        const event = 'html'
        // const check = _checkScrolling('#body_div');

        const scroll_top = $(event).scrollTop();
        // 현재 스크롤바의 위치
    
        const inner_height = $('#bottom_div').prop('scrollHeight');
        // 해당 div 의 총 높이
    
        const scroll_height = $('#mypage_qna_contents_div').prop('scrollHeight');

        if(scrolling === false) {
            if( (Math.round(scroll_top) + inner_height) >= (scroll_height - 100)) {
                const add_scroll = scroll + 1;
                const limit_check = (add_scroll * 10) - QandA_length;

                if(limit_check < 0) {
                    await configAction.set_scroll({ 'num' : add_scroll, 'bool' : true })
                    // $('html').css({ 'cursor' : 'wait' })

                    this._getQnAInfo(add_scroll);
                }
            }
        }
    }

    // 문의 정보 가져오기
    _getQnAInfo = async (scrolls) => {
        const { user_info, goodsAction, scroll, location } = this.props;
        const qry = queryString.parse(location.search);

        const obj = { 'type' : 'SELECT', 'table' : 'q&a', 'comment' : '상품 문의 정보 가져오기 (답변 포함)', 'join' : true };

        if(qry['answer']) {
            // 답변 완료된 글만 가져오기
            obj['special_opt'] = 'INNER JOIN';
        }

        obj['on'] = true;
        obj['on_arr'] = [
                            { 'name' : 'em1', 'value' : '*' },
                            { 'name' : 'em2', 'value' : [ { 'name' : 'contents', 'as' : 'answer' } ] },
                            { 'name' : 'goods', 'value' : [ 
                                { 'name' : 'id', 'as' : 'goods_id' },
                                { 'name' : 'thumbnail', 'as' : 'goods_thumbnail' },
                                { 'name' : 'result_price', 'as' : 'goods_result_price' },
                                { 'name' : 'star', 'as' : 'goods_star', },
                                { 'name' : 'name', 'as' : 'goods_name', 'last' : true },
                                // { 'name' : 'result_price', 'as' : 'goods_result_price', 'last' : true },
                            ] }
                        ]
            // = SELECT em1.*, em2.contents as anwser 
        // obj['add_table'] = { 'name' : 'goods', 'type' : 'INNER JOIN' };

        obj['add_table'] = [];
        obj['add_table'][0] = { 'table' : 'goods', 'type' : 'INNER JOIN', 'key1' : { 'table' : 'goods', 'value' : 'id' }, 'key2' : { 'table' : 'em1', 'value' : 'goods_id' } };

        obj['join_arr'] = [];
        obj['join_arr'][0] = { 'key1' : 'id', 'key2' : 'question_id' }

        obj['option'] = {};
        // obj['option']['goods_id'] = '=';

        obj['where'] = [];
        // obj['where'].push({ 'table' : 'q&a', 'key' : 'goods_id', 'value' : goods_id });

        if(!qry['remove']) {
            obj['option']['state'] = '<>';
            obj['where'].push({ 'table' : 'q&a', 'key' : 'state', 'value' : 2 });
        }

        obj['option']['question_id'] = 'IS NULL';
        obj['where'].push({ 'table' : 'q&a', 'key' : 'question_id', 'value' : null });

        obj['option']['type'] = '=';
        obj['where'].push({ 'table' : 'q&a', 'key' : 'type', 'value' : 0 });

        obj['option']['user_id'] = '=';
        obj['where'].push({ 'table' : 'q&a', 'key' : 'user_id', 'value' : user_info.id });

        if(qry.goods_id) {
            obj['option']['goods_id'] = '=';
            obj['where'].push({ 'table' : 'q&a', 'key' : 'goods_id', 'value' : qry.goods_id });
        }

        if(qry.contents) {
            obj['option']['contents'] = 'LIKE';
            obj['where'].push({ 'table' : 'q&a', 'key' : 'contents', 'value' : "%" + qry.contents + "%" });
        }

        obj['order'] = []

        if(!qry['date'] || qry['date'] === 'lately') {
            obj['order'].push({ 'table' : 'q&a', 'key' : 'id', 'value' : "DESC" });
        
        } else if(qry['date'] === 'past') {
            obj['order'].push({ 'table' : 'q&a', 'key' : 'id', 'value' : "ASC" });
        }

        const cover_scroll = scrolls ? scrolls : scroll;
        const end = cover_scroll === 0 ? 10 : (cover_scroll * 10) + 10;

        obj['order'].push({ 'table' : 'q&a', 'key' : 'limit', 'value' : [end] });


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
        save_obj['loading'] = true;

        goodsAction.save_QandA_data(save_obj);

        if(scrolls) {
            this._scrollingAfter();
        }
    }

    // 스크롤링 후 적용
    _scrollingAfter = () => {
        const { configAction, qna_all_check } = this.props;
        configAction.set_scroll({ 'bool' : false });

        if(qna_all_check === true) {
            this._selectQandA(null, true);
        }
    }

    // 선택하기
    _selectQandA = (num, all_check) => {
        const { myPageAction } = this.props;
        const QandA_info = JSON.parse(this.props.QandA_info);
        let qna_select = JSON.parse(this.props.qna_select);
        
        const obj = {};
        if(!all_check) {
            if(qna_select[String(num)]) {
                // 있을 경우에는 삭제
                delete qna_select[String(num)];

                obj['bool'] = false;
                // document.getElementById('mypage_qna_checkbox_'+ num).checked = false;

            } else {
                // 없을 경우에는 추가
                qna_select[String(num)] = { 'id' : num }

                if(Object.keys(qna_select).length === QandA_info.length) {
                    obj['bool'] = true;
                }
            }

        } else {
            if(Object.keys(qna_select).length === QandA_info.length) {
                // 전체 선택 풀기
                qna_select = {};
                obj['bool'] = false;

            } else {
                for(let i = 0; i < QandA_info.length; i++) {
                    qna_select[String(QandA_info[i].id)] = { 'id' : QandA_info[i].id }
                }

                obj['bool'] = true;
            }
        }

        obj['obj'] = JSON.stringify(qna_select);
        
        myPageAction.save_QandA_data(obj)
    }

    // 삭제하기
    _removeQandA = async (id, all) => {
        const { _checkLogin, configAction, removing, myPageAction } = this.props;

        const qna_select = JSON.parse(this.props.qna_select);
        let cover_select_obj = qna_select;

        const select_length = Object.keys(qna_select).length;

        const user_info = await _checkLogin();

        if(!user_info) {
            alert('로그인 시간이 만료되었습니다. \n다시 로그인을 시도해주세요.');
            return window.location.replace('/');

        } else if(removing === true) {
            alert('처리중입니다. 잠시만 기다려주세요.')
            return;
        }

        if(all) {
            if(select_length === 0) {
                return alert('삭제할 문의 내역을 하나 이상 선택해주세요.');
            }

            // 선택 삭제하기
            if(!window.confirm('선택한 ' + select_length + ' 개의 문의 내역을 모두 삭제하시겠습니까?')) {
                return;
            }

        } else {
            if(!window.confirm('해당 문의를 삭제하시겠습니까?')) {
                return;
            }

            cover_select_obj = { id : { 'id' : id } }
        }

        configAction.removing({ 'bool' : true });

        const obj = { 'type' : 'UPDATE', 'table' : 'q&a', 'comment' : '문의 삭제하기' };

        obj['columns'] = [];
        // obj['columns'].push({ 'key' : 'remove_date', 'value' : null });
        obj['columns'].push({ 'key' : 'state', 'value' : 2 });

        obj['where'] = [];
        
        obj['where'].push({ 'key' : 'user_id', 'value' : user_info.id });

        obj['where_limit'] = 1;

        for(let key in cover_select_obj) {
            const qna_id = cover_select_obj[key].id;

            delete qna_select[qna_id];

            obj['where'][1] = { 'key' : 'id', 'value' : qna_id };

            await axios(URL + '/api/query', {
                method : 'POST',
                headers: new Headers(),
                data : obj
            })
        }

        configAction.removing({ 'bool' : false });

        myPageAction.save_QandA_data({ 'obj' : JSON.stringify(qna_select) })

        await this._getQnAInfo();

        return alert('삭제가 완료되었습니다.'); 
    }

    _initFilter = (type, value, bool) => {
        const { _filterURL, location } = this.props;
        const qry = queryString.parse(location.search);

        if(bool === false) {
            delete qry[type];

        } else {
            qry[type] = value;
        }

        if(Object.keys(qry).length === 0) {
            return window.location.href='/myPage/QandA'
        }

        return _filterURL(qry, "");
    }

    _searchFilter = (event) => {
        event.preventDefault();

        const { _filterURL, location } = this.props;
        const qry = queryString.parse(location.search);

        const form_data = event.target;

        const goods_id = form_data.search_goods_id.value;
        const contents = form_data.search_contents.value.trim();

        if(Number(goods_id) > 0) {
            qry['goods_id'] = goods_id;

        } else {
            delete qry['goods_id']
        }

        if(contents) {
            qry['contents'] = contents;

        } else {
            delete qry['contents']
        }

        if(Object.keys(qry).length === 0) {
            return window.location.href='/myPage/QandA'
        }

        return _filterURL(qry, "")
    }

    render() {
        const { QandA_loading, QandA_length, price_comma, location, _searchStringColor } = this.props;
        const { _selectQandA, _removeQandA, _initFilter, _searchFilter } = this;

        const QandA_info = JSON.parse(this.props.QandA_info);
        const qna_select = JSON.parse(this.props.qna_select);

        const length_check = QandA_info.length === 0 || QandA_length.length === 0;
        let border_style = { 'borderTop' : 'solid 2px #ababab', 'borderBottom' : 'solid 2px #ababab' };
        if(length_check) {
            border_style = { 'borderTop' : 'dotted 2px #ababab', 'borderBottom' : 'dotted 2px #ababab' };
        }

        let select_length = Object.keys(qna_select).length;
        const qry = queryString.parse(location.search);


        return(
            <div id='mypage_qna_div'>
                {QandA_loading === false 
                    ? <div id='mypage_qna_loading_div' className='aCenter'>
                        <div id='my_page_qna_loading_img' style={{ 'backgroundImage' : `url(${img.img.loading})` }} />
                        <h3> 데이터를 불러오고 있습니다. </h3>
                      </div>


                    : <div id='mypage_qna_contents_div'>

                        {/* {QandA_length > 0

                        ?  */}
                        <div id='mypage_qna_filter_list_div'>
                            <div id='mypage_qna_view_filter_div'>
                                <div id='mypage_qna_date_filter_div'>
                                    <ul>
                                        <li className={qry['date'] === 'lately' || !qry['date'] ? "bold custom_color_1" : null}> 
                                            <u onClick={() => qry['date'] !== 'lately' || !qry['date'] ? _initFilter('date', 'lately', true) : null}> 최신순으로 정렬 </u> 
                                        </li>

                                        <li className={qry['date'] === 'past' ? "bold custom_color_1" : null}>
                                            <u  onClick={() => qry['date'] !== 'past' ? _initFilter('date', 'past', true) : null}> 과거순으로 정렬 </u> 
                                        </li>
                                    </ul>
                                </div>

                                <div className='aCenter'>
                                    <ul>
                                        <li className={qry['answer'] ? "bold custom_color_1" : null} > 
                                            <u onClick={() => qry['answer'] ? _initFilter('answer', true, false) : _initFilter('answer', true, true) }> 답변 완료만 보기 </u> 
                                        </li>
                                    </ul>
                                </div>

                                <div className='aRight'>
                                    <ul>
                                        <li className={qry['remove'] ? "bold custom_color_1" : null}> 
                                            <u onClick={() => qry['remove'] ? _initFilter('remove', true, false) : _initFilter('remove', true, true) }> 삭제 문의 포함 </u> 
                                        </li>
                                    </ul>
                                </div>
                            </div>

                            <div id='mypage_qna_search_div'>
                                <form name='mypage_qna_search_form' onSubmit={_searchFilter}>
                                    <div id='mypage_qna_search_grid_div'>
                                        <div> 상품 번호　|　
                                            <input type='number' max={1000} min={1} name='search_goods_id' defaultValue={qry.goods_id} /> 
                                            <input alt='' type='image' className='mypage_qna_search_button pointer' src={icon.icon.search_black} />
                                        </div>

                                        <div> 문의 내용　|　
                                            <input type='text' maxLength='30' name='search_contents' defaultValue={qry.contents} />
                                            <input alt='' type='image' className='mypage_qna_search_button pointer' src={icon.icon.search_black} />
                                        </div>
                                    </div>
                                </form>
                            </div>

                            {Object.keys(qry).length > 0
                            ?
                            <div id='mypage_qna_filtering_div'>
                                <h4> 적용중인 필터 옵션 </h4>

                                <ul className='font_13 gray'>
                                    {qry.date
                                        ? qry.date === 'lately' ? <li> 최신순으로 정렬 <img onClick={() => _initFilter('date', 'lately', false)} src={icon.icon.close_black} alt='' className='mypage_qna_remove_filter_icon' /> </li>

                                        : qry.date === 'past' ? <li> 과거순으로 정렬 <img onClick={() => _initFilter('date', 'past', false)} src={icon.icon.close_black} alt='' className='mypage_qna_remove_filter_icon' /> </li>

                                                              : null

                                        : null
                                    }

                                    {qry.answer 
                                        ? <li> 답변 완료만 보기 <img onClick={() => _initFilter('answer', true, false)} src={icon.icon.close_black} alt='' className='mypage_qna_remove_filter_icon' /> </li> 

                                        : null
                                    }

                                    {qry.remove 
                                        ? <li> 삭제 문의 포함 <img onClick={() => _initFilter('remove', true, false)} src={icon.icon.close_black} alt='' className='mypage_qna_remove_filter_icon' /> </li> 

                                        : null
                                    }

                                    {qry.goods_id 
                                        ? <li> 상품 번호　|　{qry.goods_id} 번 <img onClick={() => _initFilter('goods_id', qry.goods_id, false)} src={icon.icon.close_black} alt='' className='mypage_qna_remove_filter_icon' /> </li> 

                                        : null
                                    }

                                    {qry.contents 
                                        ? <li> 문의 내용　|　{qry.contents.slice(0, 15)} <img onClick={() => _initFilter('contents', qry.contents, false)} src={icon.icon.close_black} alt='' className='mypage_qna_remove_filter_icon' /> </li> 

                                        : null
                                    }
                                </ul>
                            </div>

                            : null }
                        </div>

                        {/* : null } */}

                        <p id='mypage_qna_length_div' className='font_13 bold'> 총 {QandA_length} 개의 상품 문의 내역이 조회됐습니다.  </p>

                        {QandA_length > 0

                        ?
                        <div id='mypage_qna_select_info_div' className='font_12 gray'>
                            <div
                                className={select_length === QandA_info.length
                                    ? 'custom_color_1 bold'
                                    
                                    : null
                                }
                            > 
                                <input type='checkbox' id='mypage_all_select' className='pointer check_custom_1' 
                                    onChange={() => _selectQandA(null, true)}
                                    checked={select_length === QandA_info.length}
                                />
                                <span className='check_toggle_1' onClick={() => _selectQandA(null, true)}> </span>
                                <label className='pointer' htmlFor='mypage_all_select' id='mypage_qna_all_check_label'> 
                                    전체 선택 ( {select_length} / {QandA_info.length} ) 
                                </label>
                            </div>

                            <div className='aRight'> 
                                <u title='선택한 문의 / 답변 내역을 삭제합니다.' className='pointer'
                                   onClick={() => _removeQandA(null, true)}
                                > 
                                    선택 삭제 
                                </u> 
                            </div>
                        </div>

                        : null}

                        <div id='mypage_qna_contents_show_div'
                             style={border_style}
                        >
                        {length_check
                            ? <div id='mypage_qna_main_empty_div' className='aCenter'>
                                <h3> 문의한 내역이 없습니다. </h3>
                                <p className='font_13 gray'> 
                                    <u className='pointer' onClick={() => window.location.href='/search'}> 
                                        ◀　상품 문의하러 가기 
                                    </u> 
                                </p>
                              </div>

                            : <div id='mypage_qna_main_contents_div'>
                                {QandA_info.map( (el, key) => {
                                    const answer_state = el.answer ? '답변 완료' : '답변 대기';

                                    let class_col = 'mypage_qna_main_list_div pointer font_13'
                                    if(qna_select[el.id]) {
                                        class_col += ' mypage_select_qna_list';
                                    }

                                    let contents = el.contents;
                                    if(qry.contents) {
                                        contents = _searchStringColor(contents, qry.contents);
                                    }

                                    return(
                                        <div key={key} className={class_col}
                                            style={ QandA_info.length > key + 1 ? { 'borderBottom' : 'solid 1px #ababab' } : null }
                                        >
                                                <div className='mypage_qna_other_grid_div'>
                                                    <div className='mypage_qna_other_div_1'
                                                         onClick={() => el.state !== 2 ? _selectQandA(el.id) : null}
                                                    >
                                                        <div> 
                                                            {el.state !== 2
                                                            ?
                                                            <input type='checkbox' className='mypage_qna_checkbox pointer' 
                                                                   onChange={() => _selectQandA(el.id)}
                                                                   checked={!!qna_select[el.id]}
                                                                   id={'mypage_qna_checkbox_' + el.id}
                                                            />

                                                            : null}
                                                        </div>
                                                        <div> No. {el.id} </div>
                                                    </div>

                                                    <div className='mypage_qna_other_div_2'>

                                                        <div className='mypage_qna_remove_div'>
                                                            {el.state !== 2
                                                            ?
                                                            <input type='button' value='삭제' className='mypage_qna_remove_button pointer'
                                                                   onClick={() => _removeQandA(el.id, false)}
                                                            />

                                                            : <b className='font_12 bold red'> 삭제됨 </b> } 
                                                        </div>

                                                        <div style={el.answer ? { 'color' : '#35c5f0', 'fontWeight' : 'bold' } : null}
                                                            className='mypage_qna_state_div'
                                                        > 
                                                            {answer_state} 
                                                        </div>
                                                        <div className='mypage_qna_create_date_div'> 문의 일자　|　{el.create_date.slice(0, 16)} </div>
                                                    </div>
                                                </div> 

                                            <div className='mypage_qna_goods_and_reivew_info_div'>
                                                <div className='mypage_qna_goods_and_price_grid_div'>
                                                    <div className='mypage_qna_goods_info_thumbnail pointer'
                                                        onClick={() => window.location.href='/goods?goods_num=' + el.goods_id}
                                                        style={{ 'backgroundImage' : `url(${el.goods_thumbnail})` }}/>

                                                    <div className='mypage_qnd_goods_info_div'>
                                                        <div className='font_12 pointer'> 
                                                            <b onClick={() => window.location.href='/goods?goods_num=' + el.goods_id}> 상품 번호　|　{el.goods_id} </b>
                                                        </div>
                                                        <div className='mypage_qnd_goods_name_div cut_one_line pointer'> 
                                                            <b onClick={() => window.location.href='/goods?goods_num=' + el.goods_id}> {el.goods_name} </b>
                                                        </div>
                                                        <div className='mypage_qnd_goods_price_div gray'> {price_comma(el.goods_result_price)} 원 </div>
                                                    </div>
                                                </div>

                                                <div className='mypage_qna_info_div'>
                                                    <div className='mypage_qna_question_div mypage_qna_info_grid_div'> 
                                                        <div className='mypage_qna_info_title_div'> <b> Q. </b> </div>
                                                        <div className='mypage_qna_quesition_contents_div cut_multi_line font_12' dangerouslySetInnerHTML={{ __html : contents }} />
                                                    </div>

                                                    <div className='mypage_qnd_anwser_div mypage_qna_info_grid_div'> 
                                                        <div className='mypage_qna_info_title_div'> <b> A. </b> </div>
                                                        <div className='mypage_qna_anwser_contents_div cut_multi_line font_12'
                                                            style={!el.answer ? { 'color' : '#ababab' } : null}
                                                        >
                                                            {!el.answer 
                                                                ? "답변을 기다리고 있습니다."
                                                                
                                                                : el.answer
                                                            }
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })}
                              </div>
                        }
                        </div>
                      </div>
                }
            </div>
        )
    }
}
  
  export default connect(
    (state) => ({
        QandA_info : state.goods.QandA_info,
        QandA_length : state.goods.QandA_length,
        QandA_loading : state.goods.QandA_loading,
        qna_select : state.my_page.qna_select,
        qna_all_check : state.my_page.qna_all_check,
        scroll : state.config.scroll,
        scrolling : state.config.scrolling,
        removing : state.config.removing
    }), 
  
    (dispatch) => ({
      configAction : bindActionCreators(configAction, dispatch),
      myPageAction : bindActionCreators(myPageAction, dispatch),
      goodsAction : bindActionCreators(goodsAction, dispatch),
    })
  )(QnA);