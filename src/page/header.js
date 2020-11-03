import React from 'react';
import '../css/main.css';

import { Link } from 'react-router-dom';

const Header = (props) => {
    
    return (
        <div id='main_header'> 
            <div id='main_header_left'> </div>
            <div id='main_header_center'> 
                { /* Center */ }
                <h4 id='main_title'> <b onClick={() => props._pageMove('href', '/')} className='pointer'> Sejun's Mall </b> </h4>
            </div>

            <div id='main_header_right'> 
                { /* Right */ }
                <ul id='main_login_ul'>
                    <li> 
                        <u className='remove_underLine pointer'
                           onClick={() => props._modalToggle(true)}
                        > 
                            로그인 
                        </u> 
                    </li>
                    <li> <Link to='/signup'> 회원가입 </Link> </li>
                </ul>
            </div>
        </div>
    );
}

export default Header;