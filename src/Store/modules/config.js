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
const TOGGLEAGREEMODAL = 'config/toggle_agree_modal';
const SETINITDATE = 'config/set_init_date';
const SAVEPAGINGDATA = 'config/save_paging_data'
const TOGGLEFIRSTMOVE = 'config/toggle_first_move'; 
const TOGGLEREVIEWMODAL = 'config/toggle_review_modal'; 
const SETSCROLL = 'config/set_scroll';
const REMOVING = 'config/removing';
const TOGGLEMODAL = 'config/toggle_modal';
const SAVEUSERALERTINFO = 'config/save_user_alert_info';
const SAVEHOTITEMINFO = 'config/save_hot_item_info';

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
export const toggle_agree_modal = createAction(TOGGLEAGREEMODAL);
export const set_init_date = createAction(SETINITDATE);
export const save_paging_data = createAction(SAVEPAGINGDATA);
export const toggle_first_move = createAction(TOGGLEFIRSTMOVE);
export const toggle_review_modal = createAction(TOGGLEREVIEWMODAL);
export const set_scroll = createAction(SETSCROLL);
export const removing = createAction(REMOVING);
export const toggle_modal = createAction(TOGGLEMODAL);
export const save_user_alert_info = createAction(SAVEUSERALERTINFO);
export const save_hot_item_info = createAction(SAVEHOTITEMINFO);

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
    loading : false,
    user_info_agree_modal : false,
    now_date : null,
    now_page : 1,
    paging_cnt : 0,
    paging_show : 20,
    first_move : true,
    review_modal : false,
    review_select : null,
    review_scroll : 0,
    review_info : JSON.stringify([]),
    review_loading : false,
    review_goods_id : null,
    review_star : 0,
    review_writing : false,
    review_callback : null,
    review_order_id : null,
    review_length : 0,
    review_scrolling : false,
    scroll : 0,
    scrolling : false,
    removing : false,
    modal : false,
    user_alert_info : JSON.stringify([]),
    user_alert_length : 0,
    user_alert_noShow : 0,
    alert_modal : false,
    alert_loading : false,
    alert_scroll : 0,
    alert_scrolling : false,
    hot_item_info : JSON.stringify([])
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
    },

    [TOGGLEAGREEMODAL] : (state, data) => {
        return {
            ...state,
            user_info_agree_modal : data.payload.bool
        }
    },

    [SETINITDATE] : (state, data) => {
        return {
            ...state,
            now_date : data.payload.date
        }
    },

    [SAVEPAGINGDATA] : (state, data) => {
        return {
            ...state,
            now_page : data.payload.now_page !== undefined ? data.payload.now_page : state.now_page,
            paging_cnt : data.payload.cnt !== undefined ? data.payload.cnt : state.paging_cnt,
            paging_show : data.payload.paging_show !== undefined ? data.payload.paging_show : state.paging_show
        }
    },

    [TOGGLEFIRSTMOVE] : (state) => {
        return {
            ...state,
            first_move : false
        }
    },

    [TOGGLEREVIEWMODAL] : (state, data) => {
        return {
            ...state,
            review_modal : data.payload.bool !== undefined ? data.payload.bool : state.review_modal,
            review_select : data.payload.select !== undefined ? data.payload.select : state.review_select,
            review_scroll : data.payload.scroll !== undefined ? data.payload.scroll : state.review_scroll,
            review_info : data.payload.arr !== undefined ? data.payload.arr : state.review_info,
            review_loading : data.payload.loading !== undefined ? data.payload.loading : state.review_loading,
            review_goods_id : data.payload.goods_id !== undefined ? data.payload.goods_id : state.review_goods_id,
            review_star : data.payload.star !== undefined ? data.payload.star : state.review_star,
            review_writing : data.payload.writing !== undefined ? data.payload.writing : state.review_writing,
            review_callback : data.payload.callback !== undefined ? data.payload.callback : state.review_callback,
            review_order_id : data.payload.order_id !== undefined ? data.payload.order_id : state.review_order_id,
            review_length : data.payload.length !== undefined ? data.payload.length : state.review_length,
            review_scrolling : data.payload.scrolling !== undefined ? data.payload.scrolling : state.review_scrolling
        }
    },

    [SETSCROLL] : (state, data) => {
        return {
            ...state,
            scroll : data.payload.num !== undefined ? data.payload.num : state.scroll,
            scrolling : data.payload.bool !== undefined ? data.payload.bool : state.scrolling
        }
    },

    [REMOVING] : (state, data) => {
        return {
            ...state,
            removing : data.payload.bool !== undefined ? data.payload.bool : state.removing
        }
    },

    [TOGGLEMODAL] : (state, data) => {
        return {
            ...state,
            modal : data.payload.bool !== undefined ? data.payload.bool : state.modal
        }
    },

    [SAVEUSERALERTINFO] : (state, data) => {
        return {
            ...state,
            user_alert_info : data.payload.info !== undefined ? data.payload.info : state.user_alert_info,
            user_alert_length : data.payload.length !== undefined ? data.payload.length : state.user_alert_length,
            user_alert_noShow : data.payload.show !== undefined ? data.payload.show : state.user_alert_noShow,
            alert_modal : data.payload.bool !== undefined ? data.payload.bool : state.alert_modal,
            alert_loading : data.payload.loading !== undefined ? data.payload.loading : state.alert_loading,
            alert_scroll : data.payload.scroll !== undefined ? data.payload.scroll : state.alert_scroll,
            alert_scrolling : data.payload.scrolling !== undefined ? data.payload.scrolling : state.alert_scrolling
        }
    },

    [SAVEHOTITEMINFO] : (state, data) => {
        return {
            ...state,
            hot_item_info : data.payload.info !== undefined ? data.payload.info : state.hot_item_info
        }
    }

}, initialState);