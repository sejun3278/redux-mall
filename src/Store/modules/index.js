import { combineReducers } from 'redux';

import config from './config';
import signup from './signup';


export default combineReducers({
    config,
    signup
});