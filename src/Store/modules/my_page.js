import { createAction, handleActions } from 'redux-actions';

const CUSTOMEMAILTOGGLE = 'my_page/custom_email_toggle';
const TOGGLEHOST = 'my_page/toggle_host';
const GETHOSTDATA = 'my_page/get_host_data';
const TOGGLEABLE = 'my_page/toggle_able';
const TOGGLEMODIFYOTHERMODAL = 'my_page/toggle_modify_other_modal';
const GETMYLIKELIST = 'my_page/get_my_like_list';
const SETMYLIKELOADING = 'my_page/set_my_like_loading';
const SETSELECTLIKE  = 'my_page/set_select_like_length';
const SAVECARTDATA  = 'my_page/save_cart_data';
const CHANGECARTGOODSNUMBER  = 'my_page/change_cart_goods_number';
const SAVECARTRESULTPRICE = 'my_page/save_cart_result_price';

export const custom_email_toggle = createAction(CUSTOMEMAILTOGGLE);
export const toggle_host = createAction(TOGGLEHOST);
export const get_host_data = createAction(GETHOSTDATA);
export const toggle_able = createAction(TOGGLEABLE);
export const toggle_modify_other_modal = createAction(TOGGLEMODIFYOTHERMODAL);
export const get_my_like_list = createAction(GETMYLIKELIST);
export const set_my_like_loading = createAction(SETMYLIKELOADING);
export const set_select_like = createAction(SETSELECTLIKE);
export const save_cart_data = createAction(SAVECARTDATA);
export const change_cart_goods_number = createAction(CHANGECARTGOODSNUMBER);
export const save_cart_result_price = createAction(SAVECARTRESULTPRICE)

const initialState = {
    email_custom : false,
    host_open : false,
    host_code : null,
    host : null,
    modify_able : true,
    modify_other_modal : false,
    modify_other_type : 'search_pw',
    disable_type : 1,
    my_like_list : JSON.stringify([]),
    my_like_bool : false,
    select_like_list : JSON.stringify([]),
    cart_data : JSON.stringify([]),
    cart_loading : false,
    cart_num_obj : JSON.stringify({}),
    cart_select_list : JSON.stringify([]),
    cart_origin_price : 0,
    cart_discount_price : 0,
    cart_result_price : 0
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

    [GETMYLIKELIST] : (state, data) => {
      return {
        ...state,
        my_like_list : data.payload.arr
      }
    },

    [SETMYLIKELOADING] : (state, data) => {
      return {
        ...state,
        my_like_bool : data.payload.bool
      }
    },

    [SETSELECTLIKE] : (state, data) => {
      return {
        ...state,
        select_like_list : data.payload.arr
      }
    },

    [SAVECARTDATA] : (state, data) => {

      return {
        ...state,
        cart_data : data.payload.arr !== undefined ? data.payload.arr : state.cart_data,
        cart_loading : data.payload.bool !== undefined ? data.payload.bool : state.cart_loading,
        cart_num_obj : data.payload.num_obj !== undefined ? data.payload.num_obj : state.cart_num_obj,
        cart_select_list : data.payload.select_arr !== undefined ? data.payload.select_arr : state.cart_select_list
      }
    },

    [CHANGECARTGOODSNUMBER] : (state, data) => {
      return {
        ...state,
        cart_num_obj : data.payload.num_obj !== undefined ? data.payload.num_obj : state.cart_num_obj,
      }
    },

    [SAVECARTRESULTPRICE] : (state, data) => {
      return {
        ...state,
        cart_origin_price : data.payload.origin_price,
        cart_discount_price : data.payload.discount_price,
        cart_result_price : data.payload.result_price
      }
    }

}, initialState);