import { combineReducers } from 'redux';

import config from './config';
import signup from './signup';
import my_page from './my_page';

export default combineReducers({
    config,
    signup,
    my_page
});