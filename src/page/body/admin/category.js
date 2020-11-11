import React, { Component } from 'react';

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import * as adminAction from '../../../Store/modules/admin';
import '../../../css/responsive/admin.css';

import { admin_page } from '../../../source/admin_page.json'
import img from '../../../source/img/icon.json';

class AdminCategory extends Component {

    componentDidMount() {
    }

    render() {
        const { _pageMove } = this.props;

        let now_url = document.location.href.split('/');
        now_url = now_url[now_url.length - 1];

        return(
            <div id='admin_category_div'>
                <ul className='list_none aCenter' id='admin_cateogry_ul'> 

                    {admin_page.map( (el, key) => {
                        const word_check = el.word.includes(now_url);

                        return(
                            <li key={key}>
                                <u onClick={() => _pageMove('href', el.url)}
                                    id={word_check ? 'now_page' : null}
                                >
                                {word_check ? <img src={img.icon.select_page} id='select_page_icon'/> 
                                            : null }
                                {el.name}
                                </u>
                            </li>
                        )
                    })}
{/* 
                    <li>    
                        <u onClick={() => _pageMove('href', '/admin/goods')}
                           id={now_url === 'goods' || now_url === 'admin' ? 'now_page' : null}
                        > 
                            상품 관리 
                        </u> 
                    </li>

                    <li> 
                        <u onClick={() => _pageMove('href', '/admin/order')}
                            id={now_url === 'order' ? 'now_page' : null}
                        > 
                            주문 관리 
                        </u> 
                    </li>
                    <li> 배송 관리 </li>
                    <li> 회원 관리 </li> */}
                </ul>
            </div>
        )
    }
}

AdminCategory.defaultProps = {
  }
  
  export default connect(
    (state) => ({
        admin_code : state.admin.admin_code
    }), 
  
    (dispatch) => ({
        adminAction : bindActionCreators(adminAction, dispatch)
    })
  )(AdminCategory);