import React, { Component } from 'react';
import axios from 'axios';

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import * as configAction from '../../Store/modules/config';
import * as signupAction from '../../Store/modules/signup';

import '../../css/main.css';
import icon from '../../source/img/icon.json';

import $ from 'jquery';

let alert_scrolling = false;
class Alert extends Component {

    componentDidMount() {
        const scroll_target = document.getElementById('alert_contents_div');
        if(scroll_target !== null) {
            scroll_target.addEventListener("scroll", this._setScrollSize);
        }
    }

    _setScrollSize = async () => {
        const { _checkScrolling, alert_scroll, user_alert_length, _getAlertMessage, configAction } = this.props;
        const user_info = JSON.parse(this.props.user_info);

        const check = _checkScrolling('#alert_contents_div');
        
        const add_scroll = alert_scroll + 1;
        const limit_check = (add_scroll * 10) - user_alert_length;

        if(check === true) {
            if(alert_scrolling === false && (limit_check < 0)) {
                _getAlertMessage(user_info.id, add_scroll);

                $('body').css({ 'cursor' : 'wait' });
                configAction.save_user_alert_info({ 'scroll' : add_scroll, 'scrolling' : true });
            }
        }
    }

    _clickAlert = async (info) => {
        const update_obj = { 'type' : 'UPDATE', 'table' : 'alert', 'comment' : '쪽지 확인 완료' };

        update_obj['columns'] = [];
        update_obj['columns'][0] = { 'key' : 'confirm', 'value' : 1 };
        
        update_obj['where'] = [];
        update_obj['where'].push({ 'key' : 'id', 'value' : info.id });

        update_obj['where_limit'] = 0;
        
        await axios(URL + '/api/query', {
            method : 'POST',
            headers: new Headers(),
            data : update_obj
        });

        return window.location.href = info.move_url
    }

    render() {
        const { configAction, user_alert_length, alert_loading, user_alert_noShow, alert_scrolling } = this.props;
        const user_alert_info = JSON.parse(this.props.user_alert_info);
        const { _clickAlert } = this;

        return(
            <div id='header_alert_div'>
                        <img alt='' src={icon.icon.close_black} id='header_alert_close_icon' className='pointer' 
                             onClick={() => configAction.save_user_alert_info({ 'bool' : false })} title='알림 쪽지창 닫기'
                        />
                        <h4 id='header_alert_title_div' className='aCenter'> 
                            <img alt='' src={icon.icon.alert_default} id='header_alert_icon' /> 알림 쪽지 
                        </h4>

                        {alert_loading === true 
                            ?
                            user_alert_length > 0
                                ?  <div id='alert_all_contents_div'>
                                        <div id='alert_length_title_div' className='grid_half'>
                                            <div id='alert_length_title'> 총 <b> {user_alert_length} </b> 개의 쪽지를 받으셨습니다. </div>
                                            <div className='aRight font_12'> 읽지 않은 쪽지　|　<b> {user_alert_noShow} </b> </div>
                                        </div>

                                        <div id='alert_contents_div'>
                                            {user_alert_info.map( (el, key) => {
                                                let style_col = {}

                                                if((key + 1) < user_alert_info.length) {
                                                    style_col['borderBottom'] = 'dotted 1px #ababab';
                                                }

                                                if(el.confirm === 0) {
                                                    style_col['backgroundColor'] = '#faf3e0'
                                                }

                                                return(
                                                    <div key={key} className='alert_contents_list_div pointer'
                                                        style={style_col} onClick={() => _clickAlert(el)}
                                                    >
                                                        <div className='font_13' dangerouslySetInnerHTML={{ __html : el.reason }} />
                                                        <div className='font_12 gray aRight'> {el.create_date.slice(0, 16)} </div>
                                                    </div>
                                                )
                                            })}

                                            {alert_scrolling === true 
                                                ? <div id='alert_contents_wait_div'> 
                                                    <h4> 데이터를 추가로 불러오고 있습니다. </h4>
                                                  </div>
                                                : null}
                                        </div>
                                    </div>

                                : <h4 className='aCenter'>
                                    받은 쪽지가 없습니다.
                                </h4>

                            : <h4 className='aCenter gray'>
                                데이터를 불러오고 있습니다.
                              </h4>
                        }
                    </div>
        )
    }
}

Alert.defaultProps = {
}

export default connect(
  (state) => ({
    alert_loading : state.config.alert_loading,
    user_alert_length : state.config.user_alert_length,
    user_alert_info : state.config.user_alert_info,
    user_alert_noShow : state.config.user_alert_noShow,
    user_info : state.config.user_info,
    alert_scroll : state.config.alert_scroll,
    alert_scrolling : state.config.alert_scrolling,
  }), 

  (dispatch) => ({
    signupAction : bindActionCreators(signupAction, dispatch),
    configAction : bindActionCreators(configAction, dispatch)
  })
)(Alert);