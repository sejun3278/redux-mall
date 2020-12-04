import React, { Component } from 'react';
// import axios from 'axios';

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import * as adminAction from '../../../Store/modules/admin';
import '../../../css/home.css';

// import $ from 'jquery';
// import URL from '../../../config/url';

class AdminOrder extends Component {

    componentDidMount() {
    }

    render() {

        return(
            <div id='admin_order_div'>
            </div>
        )
    }
}

AdminOrder.defaultProps = {
  }
  
  export default connect(
    (state) => ({
        admin_code : state.admin.admin_code
    }), 
  
    (dispatch) => ({
        adminAction : bindActionCreators(adminAction, dispatch)
    })
  )(AdminOrder);