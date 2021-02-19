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
const SAVECOUPONDATA = 'my_page/save_coupon_data';
const TOGGLECOUPONMODAL = 'my_page/toggle_coupon_modal';
const TOGGLECOUPONADD = 'my_page/toggle_coupon_add';
const SETCOUPONPRICE = 'my_page/set_coupon_price';
const SELECTCOUPON = 'my_page/select_coupon';
const SAVEQANDADATA = 'my_page/save_QandA_data'; 
const SAVEMYPAGEREVIEWDATA = 'my_page/save_mypage_reivew_data';
const SETCHATINFO = 'my_page/set_chat_info';

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
export const save_cart_result_price = createAction(SAVECARTRESULTPRICE);
export const save_coupon_data = createAction(SAVECOUPONDATA);
export const toggle_coupon_modal = createAction(TOGGLECOUPONMODAL);
export const toggle_coupon_add = createAction(TOGGLECOUPONADD);
export const set_coupon_price = createAction(SETCOUPONPRICE);
export const select_coupon = createAction(SELECTCOUPON);
export const save_QandA_data = createAction(SAVEQANDADATA);
export const save_mypage_reivew_data = createAction(SAVEMYPAGEREVIEWDATA);
export const set_chat_info = createAction(SETCHATINFO);

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
    cart_result_price : 0,
    cart_final_price : 0,
    cart_able_goods_length : 0,
    cart_delivery_price : 0,
    cart_coupon_price : 0,
    prediction_point : 0,
    use_point : 0,
    coupon_loading : false,
    coupon_add_loading : false,
    coupon_list : JSON.stringify([]),
    coupon_list_open_modal : false,
    coupon_discount_price : 0,
    cover_coupon_select : JSON.stringify({}),
    coupon_select : JSON.stringify({}),
    qna_select : JSON.stringify({}),
    qna_all_check : false,
    mypage_review_info : JSON.stringify([]),
    mypage_review_length : 0,
    mypage_review_loading : false,
    mypage_review_scroll : 0,
    mypage_review_select : JSON.stringify({}),
    mypage_review_all_select : false,
    mypage_review_removing : false,
    chat_loading : false,
    chat_waiting : false,
    chat_info : JSON.stringify([]),
    save_ip : null,
    chat_scroll : 0,
    chat_scrolling : false,
    chat_move_bottom : false,
    chat_length : 0,
    chat_start_scroll : false
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
        cart_select_list : data.payload.select_arr !== undefined ? data.payload.select_arr : state.cart_select_list,
        cart_able_goods_length : data.payload.length !== undefined ? data.payload.length : state.cart_able_goods_length
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
        cart_origin_price : data.payload.origin_price !== undefined ? data.payload.origin_price : state.cart_origin_price,
        cart_discount_price : data.payload.discount_price !== undefined ? data.payload.discount_price : state.cart_discount_price,
        cart_result_price : data.payload.result_price !== undefined ? data.payload.result_price : state.cart_result_price,
        cart_final_price : data.payload.final_price !== undefined ? data.payload.final_price : state.cart_final_price,
        cart_delivery_price : data.payload.delivery_price !== undefined ? data.payload.delivery_price : state.cart_delivery_price,
        cart_coupon_price : data.payload.coupon_price !== undefined ? data.payload.coupon_price : state.cart_coupon_price,
        prediction_point : data.payload.point !== undefined ? data.payload.point : state.prediction_point,
        use_point : data.payload.use_point !== undefined ? data.payload.use_point : state.use_point
      }
    },

    [SAVECOUPONDATA] : (state, data) => {
      return {
        ...state,
        coupon_list : data.payload.list,
        coupon_loading : true,
        coupon_add_loading : false
      }
    },

    [TOGGLECOUPONMODAL] : (state, data) => {
      return {
        ...state,
        coupon_list_open_modal : data.payload.bool,
        coupon_add_loading : false
      }
    },

    [TOGGLECOUPONADD] : (state, data) => {
      return {
        ...state,
        coupon_add_loading : data.payload.bool
      }
    },

    [SETCOUPONPRICE] : (state, data) => {
      return {
        ...state,
        coupon_discount_price : data.payload.price
      }
    },

    [SELECTCOUPON] : (state, data) => {
      return {
        ...state,
        cover_coupon_select : data.payload.cover !== undefined ? data.payload.cover : state.cover_coupon_select,
        coupon_select : data.payload.obj !== undefined ? data.payload.obj : state.coupon_select
      }
    },

    [SAVEQANDADATA] : (state, data) => {
      return {
        ...state,
        qna_select : data.payload.obj !== undefined ? data.payload.obj : state.qna_select,
        qna_all_check : data.payload.bool !== undefined ? data.payload.bool : state.qna_all_check
      }
    },

    [SAVEMYPAGEREVIEWDATA] : (state, data) => {
      return {
        ...state,
        mypage_review_info : data.payload.arr !== undefined ? data.payload.arr : state.mypage_review_info,
        mypage_review_length : data.payload.length !== undefined ? data.payload.length : state.mypage_review_length,
        mypage_review_loading : data.payload.loading !== undefined ? data.payload.loading : state.mypage_review_loading,
        mypage_review_scroll : data.payload.scroll !== undefined ? data.payload.scroll : state.mypage_review_scroll,
        mypage_review_select : data.payload.select !== undefined ? data.payload.select : state.mypage_review_select,
        mypage_review_all_select : data.payload.all_select !== undefined ? data.payload.all_select : state.mypage_review_all_select,
        mypage_review_removing : data.payload.remove !== undefined ? data.payload.remove : state.mypage_review_removing
      }
    },

    [SETCHATINFO] : (state, data) => {
      return {
        ...state,
        chat_loading : data.payload.loading !== undefined ? data.payload.loading : state.chat_loading,
        chat_waiting : data.payload.wait !== undefined ? data.payload.wait : state.chat_waiting,
        chat_info : data.payload.info !== undefined ? data.payload.info : state.chat_info,
        save_ip : data.payload.ip !== undefined ? data.payload.ip : state.save_ip,
        chat_scroll : data.payload.scroll !== undefined ? data.payload.scroll : state.chat_scroll,
        chat_scrolling : data.payload.scrolling !== undefined ? data.payload.scrolling : state.scrolling,
        chat_move_bottom : data.payload.move !== undefined ? data.payload.move : state.chat_move_bottom,
        chat_length : data.payload.length !== undefined ? data.payload.length : state.chat_length,
        chat_start_scroll : data.payload.start_scroll !== undefined ? data.payload.start_scroll : state.chat_start_scroll
      }
    }
 
}, initialState);