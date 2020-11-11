import { createAction, handleActions } from 'redux-actions';

const SETADMINCODE = 'admin/set_admin_code';
const LOGINADMIN = 'admin/login_admin';
const LISTMODALTOGGLE = 'admin/list_modal_toggle';
const ADMINNOWPAGE = 'admin/admin_now_page';

export const set_admin_code = createAction(SETADMINCODE);
export const login_admin = createAction(LOGINADMIN);
export const list_modal_toggle = createAction(LISTMODALTOGGLE);
export const admin_now_page = createAction(ADMINNOWPAGE);

const initialState = {
    admin_code : "",
    admin_state : null,
    admin_login : false,
    list_modal : false,
    now_page : 'admin'
};

export default handleActions({
   [SETADMINCODE] : (state, data) => {
      return {
        ...state,
        admin_code : data.payload.code
      };
    },

    [LOGINADMIN] : (state, data) => {
      return {
        ...state,
        admin_state : data.payload.bool
      }
    },

    [LISTMODALTOGGLE] : (state, data) => {
      return {
        ...state,
        list_modal : data.payload.bool
      }
    },

    [ADMINNOWPAGE] : (state, data) => {
      return {
        ...state,
        now_page : data.payload.page
      }
    }

}, initialState);