import React, { Component } from 'react';
import axios from 'axios';

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import * as adminAction from '../../../Store/modules/admin';
import '../../../css/responsive/admin.css';

import $ from 'jquery';
import URL from '../../../config/url';

class AdminGoods extends Component {

    componentDidMount() {
    }

    render() {
        const { _pageMove } = this.props;

        return(
            <div id='admin_goods_div'>

                <div id='admin_goods_other_div' className='aRight'>
                    <div className='aCenter'> 
                        {/* <form>
                            <input />
                        </form> */}
                    </div>
                    <div> </div>
                    <div> <u> 상품 삭제 </u> </div>
                    <div className='page_move'> 
                        <u onClick={() => _pageMove('href', '/admin/goods/goods_write')}> 
                            상품 등록 
                        </u> 
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
        admin_code : state.admin.admin_code
    }), 
  
    (dispatch) => ({
        adminAction : bindActionCreators(adminAction, dispatch)
    })
  )(AdminGoods);