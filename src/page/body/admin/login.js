import React, { Component } from 'react';
import axios from 'axios';

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import * as adminAction from '../../../Store/modules/admin';
import '../../../css/responsive/admin.css';

import $ from 'jquery';
import URL from '../../../config/url';

class AdminLogin extends Component {

    componentDidMount() {
    }

    render() {

        return(
            <div id='admin_check_div' className='aCenter'>
                123123123
            </div>
        )
    }
}

AdminLogin.defaultProps = {
  }
  
  export default connect(
    (state) => ({
        admin_code : state.admin.admin_code
    }), 
  
    (dispatch) => ({
        adminAction : bindActionCreators(adminAction, dispatch)
    })
  )(AdminLogin);