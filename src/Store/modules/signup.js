import { createAction, handleActions } from 'redux-actions';

const INPUTINFO = 'signup/input_info';
const SETALERT = 'signup/set_alert';
const SIGNUPALLOW = 'signup/sigunup_allow';
const MODALTOGGLE = 'signup/modal_toggle';
const LOGINTOGGLE = 'signup/login_toggle';

export const input_info = createAction(INPUTINFO);
export const set_alert = createAction(SETALERT);
export const signup_allow = createAction(SIGNUPALLOW);
export const modal_toggle = createAction(MODALTOGGLE);
export const login_toggle = createAction(LOGINTOGGLE);

const initialState = {
    id : "",
    nick : "",
    pw : "",
    pw_check : "",
    agree : false,
    alert_obj : { id : false, nick : false, pw : false, pw_check : false },
    signup_allow : true,
    login_modal : false,
    login_able : true
};

export default handleActions({
   [INPUTINFO] : (state, data) => {
    const result = data.payload;
    let agree = data.payload.agree;

      return { 
          ...state, 
          id : result.id,
          nick : result.nick,
          pw : result.pw,
          pw_check : result.pw_check,
          agree : agree
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
    }

}, initialState);