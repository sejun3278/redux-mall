import { createAction, handleActions } from 'redux-actions';

const CUSTOMEMAILTOGGLE = 'my_page/custom_email_toggle';
const TOGGLEHOST = 'my_page/toggle_host';
const GETHOSTDATA = 'my_page/get_host_data';
const TOGGLEABLE = 'my_page/toggle_able';

export const custom_email_toggle = createAction(CUSTOMEMAILTOGGLE);
export const toggle_host = createAction(TOGGLEHOST);
export const get_host_data = createAction(GETHOSTDATA);
export const toggle_able = createAction(TOGGLEABLE)

const initialState = {
    email_custom : false,
    host_open : false,
    host_code : null,
    host : null,
    modify_able : true
};

export default handleActions({
   [CUSTOMEMAILTOGGLE] : (state, data) => {
      return {
        ...state,
        email_custom : data.payload.bool
      };
    },

    [TOGGLEHOST] : (state, data) => {
      return {
        ...state,
        host_open : data.payload.bool
      }
    },

    [GETHOSTDATA] : (state, data) => {
      return {
        ...state,
        host_code : data.payload.host_code,
        host : data.payload.host
      }
    },

    [TOGGLEABLE] : (state, data) => {
      return {
        ...state,
        modify_able : data.payload.bool
      }
    }

}, initialState);