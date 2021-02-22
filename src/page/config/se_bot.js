import React, { Component } from 'react';
import axios from 'axios';

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import * as configAction from '../../Store/modules/config';
import * as mypageAction from '../../Store/modules/my_page';
// import '../../css/responsive/signup.css';

import img from '../../source/img/img.json';
import icon from '../../source/img/icon.json';

import URL from '../../config/url';
import answer_list from '../../source/answer';
import $ from 'jquery';

import keywrod_list from '../../source/answer_list.json';

let chat_able = false;
let chat_scrolling = false;
class SeBot extends Component {

    async componentDidMount() {
        const user_info = await this.props._checkLogin();
        const user_id = user_info ? user_info.id : null;

        // 채팅 내역 가져오기
        await this._getChatList(user_id)

        // 스크롤 반응
        const target = document.getElementById('sebot_chat_contents_div');
        target.addEventListener("scroll", this._setScrollSize);
    }

    componentDidUpdate() {
        const { chat_loading, chat_start_scroll, mypageAction } = this.props;

        if(chat_loading === true && chat_start_scroll === false) {
            setTimeout(() => {
                mypageAction.set_chat_info({ 'start_scroll' : true });
            }, 1000);
        }
    }

    _setScrollSize = async () => {
        const { mypageAction , chat_start_scroll } = this.props;

        const height = $('#sebot_chat_contents_div').scrollTop();
        const all_height = $('#sebot_chat_contents_div').prop('scrollHeight');

        if(all_height - 600 < height) {
            mypageAction.set_chat_info({ 'move' : true })

        } else {
            mypageAction.set_chat_info({ 'move' : false })
        }

        if(height <= 100) {
            if(chat_start_scroll === true && chat_scrolling === false) {
                // 남은 정보 가져오기
                await this._dataScrolling();
            }
        }
    }

    _dataScrolling = async () => {
        const { chat_start_scroll, chat_scroll, chat_length, mypageAction } = this.props;

        if(chat_start_scroll === true && chat_scrolling === false) {

            const add_scroll = chat_scroll + 1;
            const limit_check = (add_scroll * 30) - chat_length;

            if(limit_check < 0) {
                chat_scrolling = true;

                $('body').css({ 'cursor' : 'wait' });

                mypageAction.set_chat_info({ 'scroll' : add_scroll })

                const user_info = await this.props._checkLogin();
                const user_id = user_info ? user_info.id : null;

                await this._getChatList(user_id, add_scroll, true);
            }

        } else {
            return;
        }
    }

    _getChatList = async (user_id, scroll, scrolling) => {
        const { mypageAction, chat_length } = this.props;

        const obj = { 'type' : 'SELECT', 'table' : 'chat', 'comment' : '유저의 채팅 데이터 가져오기' };

        obj['join_arr'] = [];
        obj['join_arr'][0] = { 'key1' : 'id', 'key2' : 'chat_id' }

        obj['option'] = {};
        obj['option']['user_id'] = '='; 
        obj['option']['state'] = '=';

        obj['where'] = [];
        obj['where'].push({ 'table' : 'chat', 'key' : 'user_id', 'value' : user_id, 'option' : 'ip' })
        obj['where'].push({ 'table' : 'chat', 'key' : 'state', 'value' : 0 })

        const cover_scroll = scroll ? scroll : this.props.chat_scroll
        obj['end'] = cover_scroll === 0 ? 30 : (cover_scroll + 1) * 30;

        const get_data = await axios(URL + '/get/chat', {
            method : 'POST',
            headers: new Headers(),
            data : obj
        })

        const save_obj = {};

        // 초기 채팅 Length 가져오기
        if(chat_length === 0) {
            obj['count'] = true;

            const get_length = await axios(URL + '/get/chat', {
                method : 'POST',
                headers: new Headers(),
                data : obj
            })

            const length = get_length.data.data[0]['count(*)'];
            save_obj['length'] = length;
        }

        // if(get_data.data !== false) {
        const chat_info = get_data.data.data.reverse();
        save_obj['info'] = JSON.stringify(chat_info);
        // }
        save_obj['loading'] = true;
        save_obj['ip'] = get_data.data.ip;

        mypageAction.set_chat_info(save_obj);

        chat_scrolling = false;

        $('body').css({ 'cursor' : 'default' })
        if(!scrolling) {
            this._moveScrollBottom();
        }
    }

    _chating = async (event) => {
        const { chat_loading, chat_waiting } = this.props;

        event.preventDefault();

        if(chat_loading === false) {
            alert('로딩중입니다. \n잠시만 기다려주세요.');
            return;

        } else if(chat_waiting === true || chat_able === true) {
            alert('SeBot 이 답변을 입력하고 있습니다.');
            return;
        }

        const form_data = event.target;
        const chat = form_data.chat.value.trim();
        
        const input_target = document.getElementsByName('chat');

        if(chat.length > 0) {
            await this._addChating(chat);
        }

        input_target[0].value = '';
        input_target[0].focus();
        return;
    }

    _addChating = async (chat) => {
        const { user_info, save_ip, mypageAction, chat_length } = this.props;

        chat_able = true;
        const user_id = user_info.id ? user_info.id : null;

        const insert_obj = { 'type' : 'INSERT', 'table' : 'chat', 'comment' : '채팅 입력하기' };

        insert_obj['columns'] = [];

        if(user_info.id) {
            insert_obj['columns'].push({ "key" : "user_id", "value" : user_id });

        } else if(save_ip !== null) {
            insert_obj['columns'].push({ "key" : "user_id", "value" : 2 });
            insert_obj['columns'].push({ "key" : "ip", "value" : save_ip });
        }

        insert_obj['columns'].push({ "key" : "state", "value" : 0 });
        insert_obj['columns'].push({ "key" : "type", "value" : 0 });
        insert_obj['columns'].push({ "key" : "contents", "value" : chat });
        insert_obj['columns'].push({ "key" : "create_date", "value" : null });

        const insert_question = await axios(URL + '/api/query', {
            method : 'POST',
            headers: new Headers(),
            data : insert_obj
        })
        const chat_id = insert_question.data[0];

        mypageAction.set_chat_info({ 'wait' : true, 'length' : chat_length + 1 });
        await this._getChatList(user_id);

        await this._getAnswer(chat, user_info, save_ip, chat_id)  
    }

    // 답변하기
    _getAnswer = async (str, user_info, ip, chat_id) => {
        const { mypageAction } = this.props;
        // 특수 문자 조회하기
        // const check_str = /[\{\}\[\]\/?.,;:|\)*~`!^\-_+<>@\#$%&\\\=\(\'\"]/gi;

        let keyword_result = {}

        const obj = {}
        if(str.includes('상품 조회')) {
            // 해당 상품에 대해 조회하기
            keyword_result['result'] = 'goods_select';

            let goods_name = str.indexOf('상품 조회');
            goods_name = str.slice(0, goods_name - 1);

            obj['type'] = 'SELECT';
            obj['table'] = 'goods';
            obj['comment'] = '상품 조회하기';

            obj['option'] = { 'name' : "LIKE", 'state' : '=' };
            obj['where'] = [
                            { 'table' : 'goods', 'key' : 'name', 'value' : '%' + goods_name + '%' },
                            { 'table' : 'goods', 'key' : 'state', 'value' : 1 }
                           ]

            const get_goods_info = await axios(URL + '/api/query', {
                method : 'POST',
                headers: new Headers(),
                data : obj
            })

            keyword_result['goods_name'] = goods_name;
            keyword_result['goods_info'] = get_goods_info.data[0];

        } else {
            // const obj = { 'type' : 'SELECT', 'table' : 'keyword', 'comment' : '채팅 답변 조회하기' };
            obj['type'] = 'SELECT';
            obj['table'] = 'keyword';
            obj['comment'] = '채팅 답변 조회하기'

            obj['option'] = { 'keyword' : '=' };
            obj['where'] = [{ 'table' : 'keyword', 'key' : 'keyword', 'value' : str }];

            const get_keyword = await axios(URL + '/api/query', {
                method : 'POST',
                headers: new Headers(),
                data : obj
            })
            keyword_result = get_keyword.data[0][0];
        }

        let cover_user_id = ip !== null ? ip : user_info.user_id;
        let cover_answer_list = null;
        let answer = null;

        if(keyword_result && keyword_result.result !== undefined) {
            cover_answer_list = answer_list(keyword_result, cover_user_id);

            if(typeof cover_answer_list === 'function') {
                const set_fn = cover_answer_list();
                answer = set_fn.ment;

                if(set_fn.bool === true) {
                    await this._chatFunction(keyword_result.result)
                }
            
            } else {
                answer = cover_answer_list[Math.trunc(Math.random() * (cover_answer_list.length - 0) + 0)];
            }

        } else {
            answer = '무슨 말씀이신지 해석할 수가 없어요. ㅠㅠ';
        }

        const insert_answer = { 'type' : 'INSERT', 'table' : 'chat', 'comment' : '답변 등록하기' };

        insert_answer['columns'] = [];
        insert_answer['columns'].push({ "key" : "user_id", "value" : 2 });
        insert_answer['columns'].push({ "key" : "state", "value" : 0 });
        insert_answer['columns'].push({ "key" : "type", "value" : 1 });
        insert_answer['columns'].push({ "key" : "contents", "value" : answer });
        insert_answer['columns'].push({ "key" : "chat_id", "value" : chat_id });
        insert_answer['columns'].push({ "key" : "create_date", "value" : null });

        await axios(URL + '/api/query', {
            method : 'POST',
            headers: new Headers(),
            data : insert_answer
        })

        cover_user_id = user_info.id ? user_info.id : null;
        await this._getChatList(cover_user_id);
        mypageAction.set_chat_info({ 'wait' : false })

        chat_able = false;
    }

    _chatFunction = async (type) => {
        if(type === 'clean') {
            await this._allRemoveChatList(false, true);
        }
    }

    // 모든 채팅 내역 삭제하기
    _allRemoveChatList = async (confirm, pass) => {
        const { chat_waiting, mypageAction, _checkLogin, save_ip } = this.props;
        const user_info = await _checkLogin();

        if(chat_waiting === true) {
            if(pass !== true) {
                return;
            }
        }

        let check = true;
        if(confirm === true) {
            check = window.confirm('모든 채팅 내역을 삭제하시겠습니까?');
        }

        if(check === false) {
            return;
        }

        mypageAction.set_chat_info({ 'wait' : true });

        const remove_chat = { 'type' : 'UPDATE', 'table' : 'chat', 'comment' : '모든 채팅 비활성화' };

        remove_chat['columns'] = [];
        remove_chat['columns'].push({ 'key' : 'state', 'value' : 1 });
        
        remove_chat['where'] = [];

        let user_id = user_info ? user_info.id : save_ip;

        if(save_ip !== null) {
            remove_chat['where'].push({ 'key' : 'ip', 'value' : user_id });

        } else if(user_info && user_info.id) {
            remove_chat['where'].push({ 'key' : 'user_id', 'value' : user_id });
        
        } else {
            alert('유저 정보를 조회할 수 없습니다.');
            return window.location.reload();
        }

        remove_chat['where_limit'] = 0;
        
        await axios(URL + '/api/query', {
            method : 'POST',
            headers: new Headers(),
            data : remove_chat
        })

        mypageAction.set_chat_info({ 'wait' : false, 'length' : 0 });
        user_id = user_info ? user_info.id : null;
        await this._getChatList(user_id, null, false);
        
        return alert('삭제가 완료되었습니다.');
    }

    _moveScrollBottom = () => {
        const bottom_height = $('#sebot_chat_contents_div').prop('scrollHeight');

        $('#sebot_chat_contents_div').stop().animate({ scrollTop : bottom_height });
    }

    _changeInput = (str) => {
        const target = document.getElementsByName('chat');

        str = str.slice(4, str.length);

        target[0].value = str;
        target[0].focus();
    }

    render() {
        const { chat_loading, chat_waiting, save_ip, chat_move_bottom, user_info } = this.props;
        const { _chating, _moveScrollBottom, _addChating, _allRemoveChatList, _changeInput } = this;
        const chat_info = JSON.parse(this.props.chat_info);

        let chat_holder = '채팅을 입력해주세요.';
        if(chat_loading === false) {
            chat_holder = '로딩중입니다.';

        } else if(chat_waiting === true) {
            chat_holder = 'SeBot 이 답변을 입력하고 있습니다.';
        }

        let my_id = '나 (';
        if(save_ip !== null) {
            my_id += save_ip + ')';

        } else {
            my_id += user_info.user_id + ')';
        }

        const all_height = $('#sebot_chat_contents_div').prop('scrollHeight');

        return(
            <div id='sebot_div'>
                <div id='sebot_title_div' className='aCenter'>
                    <img src={icon.my_page.se_bot_black} className='pointer' onClick={() => window.location.href='/se_bot'} />
                    <h3 className='recipe_korea'> SeJun-Bot </h3>
                    <p className='gray font_12'> 궁금한 게 있다면 SeJun-Bot 에게 물어보세요! </p>
                </div>

                <div id='sebot_chat_div'>
                    <div id='sebot_chat_contents_div'>
                        {chat_info.length === 0 && chat_loading === true
                            ? <div className='sebot_chat_div'>
                                <div className='sebot_chat_grid_div'>
                                    <div className='sebot_chat_icon_div' style={{ 'backgroundImage' : `url(${icon.my_page.se_bot_black})` }} />
                                    <span className='chat_contents_div sebot_chat_contents_div'> 대화 내용이 없습니다. </span>
                                </div>
                                <div className='font_13 bold gray'> Sebot </div>
                              </div>

                            : chat_info.map( (el, key) => {

                                return(
                                    <div className='chating_result_div' key={key}
                                    >
                                        <div className='my_chat_div aRight'>
                                            <div className='my_chat_name_div bold font_13'> {my_id} </div>

                                            {/* <div className='chat_contents_border_div'> */}
                                                <span className='chat_contents_div my_chat_contents_div'> {el.contents} </span>
                                            {/* </div> */}
                                            <div className='chat_date_div font_12 gray'> {el.create_date.slice(0, 16)} </div>
                                        </div>    

                                        {el.answer
                                            ? <div className='sebot_chat_div'>
                                                <div className='sebot_chat_grid_div'>
                                                    <div className='sebot_chat_icon_div' style={{ 'backgroundImage' : `url(${icon.my_page.se_bot_black})` }} />
                                                    {/* <span className='chat_contents_div sebot_chat_contents_div'> {el.answer} </span> */}
                                                    <div className='chat_contents_div sebot_chat_contents_div' dangerouslySetInnerHTML={{ __html : el.answer }} />
                                                </div>
                                                <div className='font_13 bold gray'> Sebot </div>
                                              </div>

                                            : null
                                        }
                                    </div>
                                )
                            })
                        }
                    </div>

                    {chat_move_bottom === false && all_height > 600
                            ? <div id='chat_move_bottom_div' className='pointer'
                                    onClick={_moveScrollBottom}
                              > 
                                <h4> 맨 아래로 이동 </h4>
                              </div>

                            : null
                        }

                    <div id='sebot_chating_form_div'>
                        <form onSubmit={_chating}>
                            <div id='sebot_chating_grid_div'>
                                <div> 
                                    <input type='text' name='chat' placeholder={chat_holder} maxLength='100'
                                        readOnly={chat_loading === false || chat_waiting === true}
                                        disabled={chat_loading === false || chat_waiting === true}
                                    /> 
                                </div>

                                <div> 
                                    <input type='submit' value='전송' name='chat_submit' className='pointer'
                                        id={chat_loading === false || chat_waiting === true ? 'disable_chating' : null}
                                    /> 
                                </div>
                            </div>
                        </form>
                    </div>

                    <div id='sebot_other_div' className='aRight font_12'>
                        <div className='inline_block gray pointer' title='채팅 내역들을 모두 삭제합니다.'
                            onClick={() => chat_waiting === false ? _allRemoveChatList(true) : null}
                        > 
                            <u className='paybook_bold'> 채팅창 초기화 </u> 
                        </div>
                    </div>

                    <div id='sebot_keyword_div'>
                        <h4 className='gray paybook_bold'> 채팅 키워드 목록 </h4>

                        <div id='sebot_keyword_list_div'>
                            <div id='sebot_keyword_showping_type_div' className='sebot_keyword_top_div'>
                                {keywrod_list.other.map( (el, key) => {
                                    return(
                                        <div className='sebot_keyword_grid_div' key={key}>
                                            <div className='border_right_dotted'> {el.name} </div>
                                            <div className='sebot_keyword_contents_div'> 
                                                {el.keyword.map( (cu, key2) => {
                                                    return(
                                                        <div key={key2}>
                                                            <u onClick={() => chat_waiting === false ? _addChating(cu) : null}> 
                                                                {cu}
                                                            </u>
                                                        </div>
                                                    )
                                                })}
                                            </div>
                                        </div>
                                    )
                                })}

                                <div id='sebot_keyword_line_div' className='custom_color_1 bold paybook_bold'> ▼ 상품 관련 </div>

                                {keywrod_list.main.map( (el, key) => {
                                    return(
                                        <div className='sebot_keyword_grid_div' key={key}>
                                            <div className='border_right_dotted'> {el.name} </div>
                                            <div className='sebot_keyword_contents_div'> 
                                                {el.keyword.map( (cu, key2) => {
                                                    return(
                                                        <div key={key2}>
                                                            <u onClick={() => chat_waiting === false ? _changeInput(cu) : null}> 
                                                                {cu}
                                                            </u>
                                                        </div>
                                                    )
                                                })}
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>

                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

SeBot.defaultProps = {
}

export default connect(
  (state) => ({
    chat_info : state.my_page.chat_info,
    chat_loading : state.my_page.chat_loading,
    chat_waiting : state.my_page.chat_waiting,
    save_ip : state.my_page.save_ip,
    chat_move_bottom : state.my_page.chat_move_bottom,
    chat_scroll : state.my_page.chat_scroll,
    chat_scrolling : state.my_page.chat_scrolling,
    chat_length : state.my_page.chat_length,
    chat_start_scroll : state.my_page.chat_start_scroll
  }), 

  (dispatch) => ({
    configAction : bindActionCreators(configAction, dispatch),
    mypageAction : bindActionCreators(mypageAction, dispatch)
  })
)(SeBot);