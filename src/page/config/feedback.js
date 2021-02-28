import React, { Component } from 'react';
import axios from 'axios';
import Modal from 'react-modal';
import queryString from 'query-string';

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import * as configAction from '../../Store/modules/config';
// import '../../css/responsive/signup.css';

import Paging from '../config/paging';

import URL from '../../config/url';

import $ from 'jquery';
import icon from '../../source/img/icon.json';

let add_feedback = false;
let updating = false;
class Feedback extends Component {

    async componentDidMount() {
        // 피드백 리스트 가져오기
        await this._getFeedbackList();
    }

    _getFeedbackList = async () => {
        const { configAction, location } = this.props;
        const qry = queryString.parse(location.search);

        const obj = { 'type' : 'SELECT', 'table' : 'feedback', 'comment' : '피드백 리스트 가져오기' };

        obj['option'] = {};
        obj['option']['state'] = '<>';
        obj['where'] = [];

        if(!qry['state']) {
            obj['where'][0] = { 'table' : 'feedback', 'key' : 'state', 'value' : '3' };

        } else {
            obj['option']['state'] = '=';
            obj['where'][0] = { 'table' : 'feedback', 'key' : 'state', 'value' : qry['state'] };
        }

        obj['order'] = [];
        obj['order'][0] = { 'table' : 'feedback', 'key' : 'id', 'value' : 'DESC' };

        if(qry['date'] === 'past') {
            obj['order'][0] = { 'table' : 'feedback', 'key' : 'id', 'value' : 'ASC' };
        }

        const now_page = qry.feedback_page ? Number(qry.feedback_page) : 1;
            
        const cnt_start = now_page === 1 ? 0 : (20 * (Number(now_page) - 1) );
        const cnt_end = (now_page * 20);

        obj['order'][1] = { 'table' : 'feedback', 'key' : 'limit', 'value' : [cnt_start, cnt_end] };

        const get_list = await axios(URL + '/api/query', {
            method : 'POST',
            headers: new Headers(),
            data : obj
        })

        // 총 갯수 구하기
        const cover_obj = obj;
        cover_obj['count'] = true;

        const list_count = await axios(URL + '/api/query', {
            method : 'POST',
            headers: new Headers(),
            data : cover_obj
        })

        const save_obj = {};
        save_obj['loading'] = true;
        save_obj['info'] = JSON.stringify(get_list.data[0]);
        save_obj['length'] = JSON.stringify(list_count.data[0][0]['count(*)'])

        return configAction.set_feedback_info(save_obj)
    }

    _toggleFeedbackModal = (bool) => {
        const { configAction } = this.props;

        const save_obj = {};
        save_obj['modal'] = bool;

        return configAction.set_feedback_info(save_obj)
    }

    _setFeedbackInput = (event, type) => {
        const { configAction } = this.props;
        let value = event.target.value.trim();
        
        if(type === 'contents') {
            value = value.replace(/(\n|\r\n)/g, '<br>');
        }

        const save_obj = {};
        save_obj[type] = value;

        return configAction.set_feedback_info(save_obj);
    }

    _addFeedback = async (event) => {
        event.preventDefault();
        const { feedback_url, feedback_contents, _checkLogin, configAction, _sendMailer, _addAlert } = this.props;
        const user_id = await _checkLogin();

        if(add_feedback === true) {
            alert('피드백을 추가하고 있습니다.');
            return;
        }

        if(feedback_url.length > 0 && feedback_contents.length > 0) {
            add_feedback = true;

            const add_obj = { 'type' : 'INSERT', 'table' : 'feedback', 'comment' : '피드백 추가하기' };

            add_obj['columns'] = [];
            add_obj['columns'].push({ 'key' : 'page', 'value' : feedback_url })
            add_obj['columns'].push({ 'key' : 'contents', 'value' : feedback_contents })
            add_obj['columns'].push({ 'key' : 'create_date', 'value' : null })
            add_obj['columns'].push({ 'key' : 'state', 'value' : 0 })


            if(user_id) {
                add_obj['columns'].push({ 'key' : 'user_id', 'value' : user_id.id })

            } else {
                add_obj['columns'].push({ 'key' : 'ip', 'value' : null })
                add_obj['columns'].push({ 'key' : 'user_id', 'value' : 2 })
            }

            const add_result = await axios(URL + '/api/query', {
                method : 'POST',
                headers: new Headers(),
                data : add_obj
            })

            if(add_result.data[0]) {
                // 관리자에게 메일 전송
                const contents = `
                내용 : ${feedback_contents}
                `

                const obj = {
                    'email' : 'sejun3278@naver.com',
                    'contents' : contents, 
                    'title' : `Sejun's Mall 피드백이 새로 등록되었습니다.` 
                }
                _sendMailer(obj);

                // 알림 메세지 전송
                const alert_info = {};
                alert_info['user_id'] = 15;
                alert_info['reason'] = '새로운 피드백이 등록되었습니다.';
                alert_info['move_url'] = '/feedback';

                _addAlert(alert_info)

                await this._getFeedbackList();

                alert('피드백을 남겨주셔서 감사합니다. \n빠른 시일내에 확인하겠습니다.');
                configAction.set_feedback_info({ 'page' : "", 'contents' : "", "select" : add_result.data[0], 'modal' : false });

                $('input[name=feedback_page]').val("");
                $('textarea[name=feedback_contents]').val("");
                add_feedback = false;
                return;

            } else {
                alert('피드백 등록에 실패했습니다. \n다시 시도해주세요.');
                return;
            }

        } else {
            if(feedback_url.length === 0) {
                document.getElementById('feedback_page').focus();
                return alert('[ 페이지 이름 / 주소 ] 를 입력해주세요.')
            
            } else if(feedback_contents.length === 0) {
                document.getElementById('feedback_contents').focus();
                return alert('[ 피드백 내용 ] 을 입력해주세요.')
            }
        }
    }

    _selectFeedback = async (info) => {
        const { configAction, user_info, feedback_now_id } = this.props;

        if(user_info) {
            if(user_info.admin === 'Y') {
                if(info.state === 0) {
                    // 피드백 확인으로 업데이트
                    this._updateFeedbackState(info, 1)
                }
            }
        }

        const save_obj = {};
        if(feedback_now_id === null || feedback_now_id !== info.id) {
            save_obj['select'] = info.id;

        } else if(feedback_now_id === info.id) {
            save_obj['select'] = null;
        }

        configAction.set_feedback_info(save_obj)
    }

    _updateFeedbackState = async (info, state) => {
        if(state === 3) {
            if(!window.confirm('피드백을 삭제하시겠습니까?')) {
                return;
            }
        }

        const update_obj = { 'type' : 'UPDATE', 'table' : 'feedback', 'comment' : '피드백 상태 업데이트' }

        updating = true;

        update_obj['columns'] = [];
        update_obj['columns'].push({ 'key' : 'state', 'value' : state });

        if(state === 1) {
            update_obj['columns'].push({ 'key' : 'confirm_date', 'value' : null });

        } else if(state === 2) {
            update_obj['columns'].push({ 'key' : 'complate_date', 'value' : null });

        } else if(state === 3) {
            update_obj['columns'].push({ 'key' : 'remove_date', 'value' : null });
        }
        
        update_obj['where'] = [];
        update_obj['where'].push({ 'key' : 'id', 'value' : info.id });

        update_obj['where_limit'] = 0;

        await axios(URL + '/api/query', {
            method : 'POST',
            headers: new Headers(),
            data : update_obj
        })

        if(state === 2) {
            alert('피드백이 완료되었습니다.');
        
        } else if(state === 3) {
            alert('피드백이 삭제되었습니다.');
        } 

        await this._getFeedbackList();
        updating = false;
    }


    // 필터 적용하기
    _changeFilter = (event, type, remove) => {
        const { location, _filterURL } = this.props;
        const qry = queryString.parse(location.search);

        delete qry['feedback_page'];

        if(!remove) {
            const value = event.target.value;
            qry[type] = value;

            if(type === 'date') {
                if(value === 'lately') {
                    delete qry['date'];
                }

            } else if(type === 'state') {
                if(value === 'null') {
                    delete qry['state'];
                }
            }

        } else {
            delete qry[type];
        }

        if(Object.entries(qry).length === 0) {
            return window.location.href='/feedback';
        }

        return _filterURL(qry, "");
    }

    render() {
        const { 
            feedback_modal, _setModalStyle, feedback_url, feedback_contents, feedback_loading, feedback_length, 
            feedback_now_id, user_info, _filterURL
        } = this.props;
        const { _toggleFeedbackModal, _setFeedbackInput, _addFeedback, _selectFeedback, _updateFeedbackState, _changeFilter } = this;
        const feedback_info = JSON.parse(this.props.feedback_info);

        const qry = queryString.parse(this.props.location.search);

        return(
            <div id='feedback_div' className='font_13'>
                <div id='feedback_title_div' className='aCenter'> 
                    <h3> <b className='pointer' onClick={() => window.location.href='/feedback'}> Feedback </b> </h3> 
                    <p> 개선해야 할 점 또는 추가 되어야 할 점에 대해 남겨주시면 감사하겠습니다. </p>
                </div>

                {feedback_loading === true 
                ?
                <div>
                    <div id='feedback_add_div' className='aCenter pointer kotra_bold_font'
                         onClick={() => _toggleFeedbackModal(true)}
                    >
                        <h3> 피드백 등록 </h3>
                    </div>

                    <Modal
                        isOpen={feedback_modal}
                        onRequestClose={feedback_modal ? () => _toggleFeedbackModal(false) : null}
                        style={_setModalStyle('50%', '400px')}
                    >
                        <div id='feedback_write_div'>
                            <div id='feedback_write_title_div'>
                                <h4 className='aCenter recipe_korea'> 피드백 등록 </h4>
                                <img alt='' src={icon.icon.close_black} id='feedback_write_close_icon' className='pointer' 
                                    onClick={() => _toggleFeedbackModal(false)} title='닫기'
                                />
                            </div>

                            <div id='feedback_write_contents_div'>
                                <form name='feedback_write' onSubmit={_addFeedback}>
                                    <div className='feedback_grid_div'>
                                        <div className='paybook_bold'> 페이지 이름 / 주소 </div>
                                        <div> <input name='feedback_page' defaultValue={feedback_url} id='feedback_page' className='gray bold' maxLength='40' onChange={(event) => _setFeedbackInput(event, 'page')} /> </div>
                                    </div>

                                    <div className='feedback_grid_div'>
                                        <div className='paybook_bold'> 피드백 내용 </div>
                                        <div> <textarea name='feedback_contents' defaultValue={feedback_contents} id='feedback_contents' className='gray bold' onChange={(event) => _setFeedbackInput(event, 'contents')}/> </div>
                                    </div>

                                    <input 
                                        id={feedback_url.length > 0 && feedback_contents.length > 0 && add_feedback === false ? "feedback_able" : "feedback_disaable"}
                                        type='submit' name='feedback_submit' 
                                        className='pointer white bold recipe_korea' value='피드백 등록' 
                                    />
                                </form>
                            </div>
                        </div>

                    </Modal>

                    <div id='feedback_contents_div'>
                        <div id='feedback_filter_div' className='aRight paybook_bold'>
                                    <div> 기간　|　
                                        <select name='feedback_filter_date'
                                            onChange={(event) => _changeFilter(event, 'date')}
                                            defaultValue={qry['date']}
                                            className={qry['date'] === 'past' ? "select_feedback_filter" : null}
                                        > 
                                            <option value='lately'> 최신순으로 </option> 
                                            <option value='past'> 과거순으로 </option>
                                        </select> 
                                    </div>

                                    <div> 상태　|　
                                        <select name='feedback_filter_state'
                                            onChange={(event) => _changeFilter(event, 'state')}
                                            defaultValue={qry['state']}
                                            className={qry['state'] ? "select_feedback_filter" : null}
                                        > 
                                            <option value='null'> - </option> 
                                            <option value='0'> 확인 전 </option>
                                            <option value='1'> 확인 </option>
                                            <option value='2'> 완료 </option>
                                        </select>
                                    </div>
                                </div>

                                {Object.entries(qry).length > 0
                                    ? <div id='feedback_using_filter_div'>
                                            <h4 className='recipe_korea'> 적용중인 필터 
                                                <img src={icon.icon.reload} id='feedback_reset_filter_icon' className='pointer' title='필터 모두 제거하기' alt=''
                                                    onClick={() => window.confirm('적용중인 필터를 모두 제거하시겠습니까?') ? window.location.href='/feedback' : null}
                                                /> 
                                            </h4>
                                            
                                            <ul id='feedback_using_list_ul' className='gray'>
                                                {Object.entries(qry).map( (el, keys) => {
                                                    const key = el[0];
                                                    const value = el[1];

                                                    let name = '';
                                                    let values = '';
                                                    if(key === 'date') {
                                                        name = '기　간'

                                                        if(value === 'past') {
                                                            values = '과거순 정렬'
                                                        }

                                                    } else if(key === 'state') {
                                                        name = '상　태'

                                                        if(value === '0') {
                                                            values = '확인 전';
                                                            
                                                        } else if(value === '1') {
                                                            values = '확인'

                                                        } else if(value === '2') {
                                                            values = '완료'
                                                        }
                                                    } else if(key === 'feedback_page') {
                                                        name = '페이지'
                                                        values = value + ' 페이지';
                                                    }

                                                    return(
                                                        <li key={keys} className='font_12'>
                                                            {name}　|　{values} 
                                                            <img src={icon.icon.close_circle_gray} alt='' className='pointer' title={name + ' 필터 삭제'}
                                                                onClick={() => _changeFilter(null, key, true)}
                                                            />
                                                        </li>
                                                    )
                                                })}
                                            </ul>
                                      </div>

                                    : null
                                }

                        {feedback_length === 0 || feedback_info.length === 0
                            ? <div id='feedback_empty_div' className='aCenter recipe_korea'>
                                <h3> 등록된 피드백이 없습니다. </h3>
                            </div>

                            : <div id='feedback_contents_list_div'>
                                <p className='paybook_bold'> 총 <b className='custom_color_1'> {feedback_length} </b> 개의 피드백이 조회되었습니다. </p>

                                <div id='feedback_top_paging_div'>
                                    <Paging 
                                        // show_cnt={1}
                                        paging_cnt={feedback_length}
                                        paging_show={20}
                                        page_name='feedback_page'
                                        _filterURL={_filterURL}
                                        qry={qry}
                                    />
                                </div>

                                <div id='feedback_contents_list_border_div'>
                                {feedback_info.map( (el, key) => {
                                    let state = '확인 전'
                                    let class_col = 'gray';

                                    if(el.state === 1) {
                                        state = '확인';
                                        class_col = 'black';

                                    } else if(el.state === 2) {
                                        state = '완료';
                                        class_col = 'custom_color_1 bold';
                                    }

                                    return(
                                        <div className='feedback_list_divs pointer' key={key}
                                            style={key + 1 < feedback_info.length && el.id !== feedback_now_id ? { 'borderBottom' : 'dotted 1px #ababab' } : null}
                                            id={el.id === feedback_now_id ? "feedback_select_border" : null}
                                        >
                                            <div className='feedback_list_other_div'
                                                id={feedback_now_id === el.id ? "select_feedback" : null}
                                                onClick={() => _selectFeedback(el)}
                                                style={feedback_now_id !== null && feedback_now_id !== el.id ? { 'color' : '#ababab' } : null}
                                            >
                                                <div>
                                                    <div className='feedback_page_div' id={el.id === feedback_now_id ? "feedback_select_font" : null}> {el.page} </div>
                                                </div>

                                                <div className='feedback_list_grid_div_2 aRight'>
                                                    <div> {el.create_date.slice(0, 16)} </div>
                                                    <div className={class_col}> {state} </div>
                                                </div>
                                            </div>

                                            {feedback_now_id === el.id
                                            ?
                                            <div className='feedback_contents_div' id={'feedback_contents_divs_' + el.id}
                                                style={key + 1 < feedback_info.length ? { 'borderBottom' : 'solid 3px black' } : null}
                                            >
                                                <div className='feedback_contents_divs' dangerouslySetInnerHTML={{ __html : el.contents }}/>

                                                {user_info.admin === 'Y'
                                                ?
                                                <div className='feedback_admin_other_div font_12'>
                                                    <div>
                                                        <div> 작성자　|　{el.ip ? el.ip : el.user_id} </div>
                                                    </div>

                                                    <div className='aRight feedback_control_div'>
                                                        <div className='inline_block'> 
                                                            <input type='button' value='삭제'
                                                                onClick={() => updating === false ?_updateFeedbackState(el, 3) : null}
                                                            /> 
                                                        </div>

                                                        {el.state === 1
                                                            ? <div className='inline_block'> 
                                                                <input type='button' value='완료' 
                                                                    onClick={() => updating === false ? _updateFeedbackState(el, 2) : null}
                                                                /> 
                                                              </div>
                                                            : null
                                                        }
                                                    </div>
                                                </div>

                                                : null}
                                            </div>

                                            : null }
                                        </div>
                                    )
                                })}
                                </div>
                                
                                {feedback_info.length > 8
                                ?
                                <div id='feedback_bottom_div'>
                                    <Paging 
                                        // show_cnt={1}
                                        paging_cnt={feedback_length}
                                        paging_show={20}
                                        page_name='feedback_page'
                                        _filterURL={_filterURL}
                                        qry={qry}
                                    />
                                </div>

                                : null}
                              </div>
                        }
                    </div>

                </div>

                : <div id='feedback_loading_div'>
                    <h3 className='aCenter recipe_korea'> 데이터를 조회하고 있습니다. </h3>
                  </div>
                }
            </div>
        )
    }
}

Feedback.defaultProps = {
}

export default connect(
  (state) => ({
    feedback_modal : state.config.feedback_modal,
    feedback_url : state.config.feedback_url,
    feedback_contents : state.config.feedback_contents,
    feedback_info : state.config.feedback_info,
    feedback_loading : state.config.feedback_loading,
    feedback_length : state.config.feedback_length,
    feedback_now_id : state.config.feedback_now_id
  }), 

  (dispatch) => ({
    configAction : bindActionCreators(configAction, dispatch)
  })
)(Feedback);