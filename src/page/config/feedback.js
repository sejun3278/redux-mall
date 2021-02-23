import React, { Component } from 'react';
import axios from 'axios';
import Modal from 'react-modal';

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import * as configAction from '../../Store/modules/config';
import * as signupAction from '../../Store/modules/signup';
// import '../../css/responsive/signup.css';

import img from '../../source/img/img.json';
import icon from '../../source/img/icon.json';
class Feedback extends Component {

    _toggleFeedbackModal = (bool) => {
        const { configAction } = this.props;

        const save_obj = {};
        save_obj['modal'] = bool;

        return configAction.set_feedback_info(save_obj)
    }

    render() {
        const { feedback_modal, _setModalStyle } = this.props;
        const { _toggleFeedbackModal } = this;

        return(
            <div id='feedback_div' className='font_13'>
                <div id='feedback_title_div' className='aCenter'> 
                    <h3> Feedback </h3> 
                    <p> 개선해야 할 점 또는 추가 되어야 할 점에 대해 남겨주시면 감사하겠습니다. </p>
                </div>

                <div id='feedback_contents_div'>
                    <div id='feedback_add_div' className='aCenter pointer kotra_bold_font'
                        onClick={() => _toggleFeedbackModal(true)}
                    >
                        <h3> 피드백 등록 </h3>
                    </div>
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
                            <form name='feedback_write'>
                                <div className='feedback_grid_div'>
                                    <div className='paybook_bold'> 페이지 이름 / 주소 </div>
                                    <div> <input name='feedback_page' maxLength='40' /> </div>
                                </div>

                            </form>
                        </div>
                    </div>

                </Modal>
            </div>
        )
    }
}

Feedback.defaultProps = {
}

export default connect(
  (state) => ({
    feedback_modal : state.config.feedback_modal
  }), 

  (dispatch) => ({
    configAction : bindActionCreators(configAction, dispatch)
  })
)(Feedback);