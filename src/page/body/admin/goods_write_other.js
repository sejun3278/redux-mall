import React, { Component } from 'react';
// import axios from 'axios';

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import * as adminAction from '../../../Store/modules/admin';
import '../../../css/responsive/admin.css';

// import $ from 'jquery';
// import URL from '../../../config/url';

class AdminGoodsWriteOther extends Component {

    componentDidMount() {

    }

    render() {
        const { _pageMove } = this.props;

        return(
            <div id='goods_write_other_div'>
                <ul className='list_none'>
                    <li> 
                        <u className='page_move'> 등록 </u> 
                    </li>

                    <li> 
                        <u className='page_move'
                           onClick={() => _pageMove('href', '/admin/goods')}
                        > 
                            취소 
                        </u>
                    </li>
                </ul>
            </div>
        )
    }
}

AdminGoodsWriteOther.defaultProps = {
  }
  
  export default connect(
    (state) => ({
        admin_code : state.admin.admin_code
    }), 
  
    (dispatch) => ({
        adminAction : bindActionCreators(adminAction, dispatch)
    })
  )(AdminGoodsWriteOther);