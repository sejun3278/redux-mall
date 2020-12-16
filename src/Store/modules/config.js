import { createAction, handleActions } from 'redux-actions';

const LOGINANDLOGOUT = 'config/login_and_logout';
const RESIZEWINODW = 'config/resize_window';
const SAVEUSERINFO = 'config/save_user_ifno';
const SAVEADMININFO = 'config/save_admin_info';
const SETALLCOOKIES = 'config/set_all_cookies';
const TOGGLESEARCHIDANDPW = 'config/toggle_search_id_and_pw';
const SETSEARCHDATA = 'config/set_search_data';
const SEARCHING = 'config/searching';
const SETCONFIRMNUMBER = 'config/set_confirm_number';
const SAVEUSERID = 'config/save_user_id';
const SELECTCATDATA = 'config/select_cat_data';
const SETLOADING = 'config/set_loading';

export const login_and_logout = createAction(LOGINANDLOGOUT);
export const resize_window = createAction(RESIZEWINODW);
export const save_user_info = createAction(SAVEUSERINFO);
export const save_admin_info = createAction(SAVEADMININFO);
export const set_all_cookies = createAction(SETALLCOOKIES);
export const toggle_search_id_and_pw = createAction(TOGGLESEARCHIDANDPW);
export const set_search_data = createAction(SETSEARCHDATA);
export const searching = createAction(SEARCHING);
export const set_confirm_number = createAction(SETCONFIRMNUMBER);
export const save_user_id = createAction(SAVEUSERID);
export const select_cat_data = createAction(SELECTCATDATA);
export const set_loading = createAction(SETLOADING);

const initialState = {
    login : false,
    user_info : null,
    admin_info : false,
    window_width : 0,
    window_height : 0,
    modify_user_check : false,
    all_cookies : {},
    search_id_pw_modal : false,
    search_id_pw_type : 'id',
    search_name : "",
    search_email_id : "",
    search_email_host : "",
    search_id : "",
    searching : false,
    search_result : false,
    search_result_pw : false,
    search_result_id : "",
    confirm_number : "",
    save_user_id : 0,
    mypage_url : false,
    select_cat_open : false,
    select_cat : null,
    select_last_cat : null,
    loading : false
}

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
    },

    [TOGGLESEARCHIDANDPW] : (state, data) => {
        return {
            ...state,
            search_id_pw_modal : data.payload.bool,
            search_id_pw_type : data.payload.type
        }
    },

    [SETSEARCHDATA] : (state, data) => {
        const body = data.payload;

        return {
            ...state,
            search_name : body.name,
            search_email_id : body.email_id,
            search_email_host : body.email_host,
            search_id : body.id
        }
    },

    [SEARCHING] : (state, data) => {
        let cover_searching = data.payload.bool !== undefined ? data.payload.bool : state.searching;
        let cover_result = data.payload.result !== undefined ? data.payload.result : state.search_result;
        let pw_result = data.payload.pw_result !== undefined ? data.payload.pw_result : state.search_result_pw;
        let result_id = data.payload.result_id !== undefined ? data.payload.result_id : state.search_result_id;
        let cover_mypage_url = data.payload.mypage_url !== undefined ? data.payload.mypage_url  : state.mypage_url
        return {
            ...state,
            searching : cover_searching,
            search_result : cover_result,
            search_result_pw : pw_result,
            search_result_id : result_id,
            mypage_url : cover_mypage_url
        }
    },

    [SETCONFIRMNUMBER] : (state, data) => {
        return {
            ...state,
            confirm_number : data.payload.number
        }
    },

    [SAVEUSERID] : (state, data) => {
        return {
            ...state,
            save_user_id : data.payload.id
        }
    },

    [SELECTCATDATA] : (state, data) => {
        const cover_select_open = data.payload.bool !== undefined ? data.payload.bool : state.select_cat_open;
        const cover_select_cat = data.payload.type !== undefined ? data.payload.type : state.select_cat;
        const cover_select_last_cat = data.payload.last_cat !== undefined ? data.payload.last_cat : state.select_last_cat;

        return {
            ...state,
            select_cat_open : cover_select_open,
            select_cat : cover_select_cat,
            select_last_cat : cover_select_last_cat
        }
    },

    [SETLOADING] : (state, data) => {
        return {
            ...state,
            loading : true
        }
    } 

}, initialState);