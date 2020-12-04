import { createAction, handleActions } from 'redux-actions';

const CUSTOMEMAILTOGGLE = 'my_page/custom_email_toggle';
const TOGGLEHOST = 'my_page/toggle_host';
const GETHOSTDATA = 'my_page/get_host_data';
const TOGGLEABLE = 'my_page/toggle_able';
const TOGGLEMODIFYOTHERMODAL = 'my_page/toggle_modify_other_modal';

export const custom_email_toggle = createAction(CUSTOMEMAILTOGGLE);
export const toggle_host = createAction(TOGGLEHOST);
export const get_host_data = createAction(GETHOSTDATA);
export const toggle_able = createAction(TOGGLEABLE);
export const toggle_modify_other_modal = createAction(TOGGLEMODIFYOTHERMODAL);

const initialState = {
    email_custom : false,
    host_open : false,
    host_code : null,
    host : null,
    modify_able : true,
    modify_other_modal : false,
    modify_other_type : 'search_pw',
    disable_type : 1
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
    },

    [TOGGLEMODIFYOTHERMODAL] : (state, data) => {
      const cover_disable_type = data.payload.type_num !== undefined ? data.payload.type_num : state.disable_type

      return {
        ...state,
        modify_other_modal : data.payload.bool,
        modify_other_type : data.payload.type,
        disable_type : cover_disable_type
      }
    },

}, initialState);