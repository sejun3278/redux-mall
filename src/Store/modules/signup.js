import { createAction, handleActions } from 'redux-actions';

const INPUTINFO = 'signup/input_info';
const SETALERT = 'signup/set_alert';
const SIGNUPALLOW = 'signup/sigunup_allow';
const MODALTOGGLE = 'signup/modal_toggle';
const LOGINTOGGLE = 'signup/login_toggle';
const SETLOGINAFTER = 'signup/set_login_after';
const TOGGLESELECTEMAILHOST = 'signup/toggle_select_email_host';
const SAVESIGNUPID = 'signup/save_signup_id';

export const input_info = createAction(INPUTINFO);
export const set_alert = createAction(SETALERT);
export const signup_allow = createAction(SIGNUPALLOW);
export const modal_toggle = createAction(MODALTOGGLE);
export const login_toggle = createAction(LOGINTOGGLE);
export const set_login_after = createAction(SETLOGINAFTER);
export const toggle_select_email_host = createAction(TOGGLESELECTEMAILHOST);
export const save_signup_id = createAction(SAVESIGNUPID);

const initialState = {
    id : "",
    nick : "",
    name : "",
    email_id : "",
    email_select : null,
    email_host : "naver.com",
    pw : "",
    pw_check : "",
    agree : false,
    alert_obj : { id : false, nick : false, name : false, email : false, email_host : false, pw : false, pw_check : false },
    signup_allow : true,
    login_modal : false,
    login_able : true,
    login_after : "",
    signup_id : ""
};

export default handleActions({
   [INPUTINFO] : (state, data) => {
    const result = data.payload;

      return { 
          ...state, 
          id : result.id !== undefined ? result.id : state.id,
          nick : result.nick !== undefined ? result.nick : state.nick,
          name : result.name !== undefined ? result.name : state.name,
          email_id : result.email_id !== undefined ? result.email_id : state.email_id,
          email_host : result.email_host !== undefined ? result.email_host : state.email_host,
          pw : result.pw !== undefined ? result.pw : state.pw,
          pw_check : result.pw_check !== undefined ? result.pw_check : state.pw_check,
          agree : result.agree !== undefined ? result.agree : state.agree
        };
    },

    [SETALERT] : (state, data) => {
    
      return { 
          ...state,
          alert_obj : data.payload
        };
    },

    [SIGNUPALLOW] : (state, data) => {

      return {
        ...state,
        signup_allow : data.payload.bool
      }
    },

    [MODALTOGGLE] : (state, data) => {

      return {
        ...state,
        login_modal : data.payload.bool
      }
    },

    [LOGINTOGGLE] : (state, data) => {

      return {
        ...state,
        login_able : data.payload.bool
      }
    },

    [SETLOGINAFTER] : (state, data) => {

      return {
        ...state,
        login_after : data.payload.url
      }
    },

    [TOGGLESELECTEMAILHOST] : (state, data) => {
      return {
        ...state,
        email_select : data.payload.bool
      }
    },

    [SAVESIGNUPID] : (state, data) => {
      return {
        ...state,
        signup_id : data.payload.id
      }
    }

}, initialState);