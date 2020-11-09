import { createAction, handleActions } from 'redux-actions';

const LOGINANDLOGOUT = 'config/login_and_logout';
const RESIZEWINODW = 'config/resize_window';
const SAVEUSERINFO = 'config/save_user_ifno';
const SAVEADMININFO = 'config/save_admin_info';

export const login_and_logout = createAction(LOGINANDLOGOUT);
export const resize_window = createAction(RESIZEWINODW);
export const save_user_info = createAction(SAVEUSERINFO);
export const save_admin_info = createAction(SAVEADMININFO);


const initialState = {
    login : false,
    user_info : null,
    admin_info : false,
    window_width : 0,
    window_height : 0,
    modify_user_check : false
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
    }

}, initialState);