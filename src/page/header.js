import React from 'react';
import '../css/main.css';

import { Link } from 'react-router-dom';

const Header = ({ match }) => {
    console.log(match)
    
    return (
        <div id='main_header'> 
            <div id='main_header_left'> </div>
            <div id='main_header_center'> 
                { /* Center */ }
                <h4 id='main_title'> <Link to='/'> Sejun's Mall </Link> </h4>
            </div>

            <div id='main_header_right'> 
                { /* Right */ }
                <ul id='main_login_ul'>
                    <li> <Link to='/login'> 로그인 </Link> </li>
                    <li> <Link to='/signup'> 회원가입 </Link> </li>
                </ul>
            </div>
        </div>
    );
}

export default Header;