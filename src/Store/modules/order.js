import { createAction, handleActions } from 'redux-actions';

const SAVEORDERINFO = 'order/save_order_info';
const TOGGLEDELIVERYCODEMODAL = 'order/toggle_delivery_code_modal';
const TOGGLEORDERINFOAGREE = 'order/toggle_order_info_agree';
const SETORDERHOST = 'order/set_order_host';
const TOGGLEDELIVERYSAMEINFO = 'order/toggle_delivery_same_info';
const SETCOVERORDERINFO = 'order/set_cover_order_info';

export const save_order_info = createAction(SAVEORDERINFO);
export const toggle_delivery_code_modal = createAction(TOGGLEDELIVERYCODEMODAL);
export const toggle_order_info_agree = createAction(TOGGLEORDERINFOAGREE);
export const set_order_host = createAction(SETORDERHOST);
export const toggle_delivery_same_info = createAction(TOGGLEDELIVERYSAMEINFO);
export const set_cover_order_info = createAction(SETCOVERORDERINFO);

const initialState = {
    order_loading : false,
    order_info : JSON.stringify({}),
    cart_data : JSON.stringify({}),
    order_loading : false,
    order_delivery_code_modal : false,
    order_host_code : "",
    order_host : "",
    order_info_agree : false,
    order_same_info_bool : false,
    cover_order_name : "",
    cover_order_email : "",
    cover_order_phone : ""
};

export default handleActions({
   [SAVEORDERINFO] : (state, data) => {
      return {
        ...state,
        order_info : data.payload.order_info,
        cart_data : data.payload.cart_data,
        order_loading : data.payload.loading !== undefined ? data.payload.loading : state.order_loading
      };
    },

    [TOGGLEDELIVERYCODEMODAL] : (state, data) => {
      return {
        ...state,
        order_delivery_code_modal : data.payload.bool
      };
    },

    [TOGGLEORDERINFOAGREE] : (state, data) => {
      return{
        ...state,
        order_info_agree : data.payload.bool
      }
    },

    [SETORDERHOST] : (state, data) => {
      return{
        ...state,
        order_host : data.payload.order_host,
        order_host_code : data.payload.order_host_code
      }
    },

    [TOGGLEDELIVERYSAMEINFO] : (state, data) => {
      return{
        ...state,
        order_same_info_bool : data.payload.bool
      }
    },

    [SETCOVERORDERINFO] : (state, data) => {
      return {
        ...state,
        cover_order_name : data.payload.name !== undefined ? data.payload.name : state.cover_order_name,
        cover_order_email : data.payload.email !== undefined ? data.payload.email : state.cover_order_email,
        cover_order_phone : data.payload.phone !== undefined ? data.payload.phone : state.cover_order_phone
      }
    }

}, initialState);