import { createAction, handleActions } from 'redux-actions';

const SAVEORDERINFO = 'order/save_order_info';
const TOGGLEDELIVERYCODEMODAL = 'order/toggle_delivery_code_modal';
const TOGGLEORDERINFOAGREE = 'order/toggle_order_info_agree';
const SETORDERHOST = 'order/set_order_host';
const TOGGLEDELIVERYSAMEINFO = 'order/toggle_delivery_same_info';
const SETCOVERORDERINFO = 'order/set_cover_order_info';
const ORDERING = 'order/order_ing';
const TOGGLEPAYMENTAGREE = 'order/toggle_payment_agree';
const TOGGLEPAYMENTSELECT = 'order/toggle_payment_select';
const SETDATE = 'order/set_date';
const SELECTORDERDETAIL = 'order/select_order_detail';
const TOGGLECANCELMODAL = 'order/toggle_cancel_modal';

export const save_order_info = createAction(SAVEORDERINFO);
export const toggle_delivery_code_modal = createAction(TOGGLEDELIVERYCODEMODAL);
export const toggle_order_info_agree = createAction(TOGGLEORDERINFOAGREE);
export const set_order_host = createAction(SETORDERHOST);
export const toggle_delivery_same_info = createAction(TOGGLEDELIVERYSAMEINFO);
export const set_cover_order_info = createAction(SETCOVERORDERINFO);
export const order_ing = createAction(ORDERING);
export const toggle_payment_agree = createAction(TOGGLEPAYMENTAGREE);
export const toggle_payment_select = createAction(TOGGLEPAYMENTSELECT);
export const set_date = createAction(SETDATE);
export const select_order_detail = createAction(SELECTORDERDETAIL);
export const toggle_cancel_modal = createAction(TOGGLECANCELMODAL);

const initialState = {
    order_loading : false,
    order_info : JSON.stringify({}),
    order_list_info : JSON.stringify({}),
    cart_data : JSON.stringify({}),
    order_delivery_code_modal : false,
    order_host_code : "",
    order_host : "",
    order_info_agree : false,
    order_same_info_bool : false,
    cover_order_name : "",
    cover_order_email : "",
    cover_order_phone : "",
    order_ing : false,
    payment_agree : false,
    payment_pay_agree : false,
    payment_select : null,
    start_date : null,
    end_date : null,
    start_select_num : null,
    order_detail_select : null,
    order_detail_bool : false,
    order_detail_loading : false,
    order_cancel_modal : false,
    order_canceling : false,
    buy_order_info : JSON.stringify({})
};

export default handleActions({
   [SAVEORDERINFO] : (state, data) => {
      return {
        ...state,
        order_info : data.payload.order_info !== undefined ? data.payload.order_info : state.order_info,
        order_list_info : data.payload.order_list_info !== undefined ? data.payload.order_list_info : state.order_list_info,
        cart_data : data.payload.cart_data !== undefined ? data.payload.cart_data : state.cart_data,
        order_loading : data.payload.loading !== undefined ? data.payload.loading : state.order_loading,
        buy_order_info : data.payload.buy_info !== undefined ? data.payload.buy_info : state.buy_order_info,
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
    },

    [ORDERING] : (state, data) => {
      return {
        ...state,
        order_ing : data.payload.bool
      }
    },

    [TOGGLEPAYMENTAGREE] : (state, data) => {
      return {
        ...state,
        payment_agree : data.payload.agree !== undefined ? data.payload.agree : state.payment_agree,
        payment_pay_agree : data.payload.pay_agree !== undefined ? data.payload.pay_agree : state.payment_pay_agree
      }
    },

    [TOGGLEPAYMENTSELECT] : (state, data) => {
      return {
        ...state,
        payment_select : data.payload.select
      }
    },

    [SETDATE] : (state, data) => {
      return {
        ...state,
        start_date : data.payload.start_date !== undefined ? data.payload.start_date : state.start_date,
        end_date : data.payload.end_date !== undefined ? data.payload.end_date : state.end_date,
        start_select_num : data.payload.select_num !== undefined ? data.payload.select_num : state.start_select_num
      }
    },

    [SELECTORDERDETAIL] : (state, data) => {
      return {
        ...state,
        order_detail_select : data.payload.id !== undefined ? data.payload.id : state.order_detail_select,
        order_detail_bool : data.payload.bool !== undefined ? data.payload.bool : state.order_detail_bool,
        order_detail_loading : data.payload.loading !== undefined ? data.payload.loading : state.order_detail_loading
      }
    },

    [TOGGLECANCELMODAL] : (state, data) => {
      return {
        ...state,
        order_cancel_modal : data.payload.bool !== undefined ? data.payload.bool : state.order_cancel_modal,
        order_canceling : data.payload.cancel !== undefined ? data.payload.cancel : state.order_canceling
      }
    }

}, initialState);