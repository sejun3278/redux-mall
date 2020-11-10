import { createAction, handleActions } from 'redux-actions';

const LOGINANDLOGOUT = 'config/login_and_logout';
const RESIZEWINODW = 'config/resize_window';
const SAVEUSERINFO = 'config/save_user_ifno';
const SAVEADMININFO = 'config/save_admin_info';
const SETALLCOOKIES = 'config/set_all_cookies';


export const login_and_logout = createAction(LOGINANDLOGOUT);
export const resize_window = createAction(RESIZEWINODW);
export const save_user_info = createAction(SAVEUSERINFO);
export const save_admin_info = createAction(SAVEADMININFO);
export const set_all_cookies = createAction(SETALLCOOKIES);


const initialState = {
    login : false,
    user_info : null,
    admin_info : false,
    window_width : 0,
    window_height : 0,
    modify_user_check : false,
    all_cookies : {},
};

export default handleActions({
   [LOGINANDLOGOUT] : (state, data) => {
      return {
        ...state,
        login : data.payload.bool
      };
    },

    [RESIZEWINODW] : (state, data) => {
        return {
            ...state,
            window_width : data.payload.width,
            window_height : data.payload.height
        };
    },

    [SAVEUSERINFO] : (state, data) => {
        return {
            ...state,
            user_info : data.payload.info,
        }; 
    },

    [SAVEADMININFO] : (state, data) => {
        return {
            ...state,
            admin_info : data.payload.info
        }
    },

    [SETALLCOOKIES] : (state, data) => {
        return {
            ...state,
            all_cookies : data.payload.obj
        }
    }

}, initialState);