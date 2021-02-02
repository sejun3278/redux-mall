import { createAction, handleActions } from 'redux-actions';

const SAVEGOODSDATA = 'goods/save_goods_data';
const SETLIKESTATE = 'goods/set_like_state';
const LIKELOADING = 'goods/like_loading';
const SETGOODSNUM = 'goods/set_goods_num';
const SETLOADING = 'goods/set_loading';
const OVERLAPCART = 'goods/overlap_cart';
const ADDCOMPLATECART = 'goods/add_complate_cart';
const TOGGLEFIXED = 'goods/toggle_fixed';
const SAVEQANDADATA = 'goods/save_QandA_data';
const TOGGLEWRITE = 'goods/toggle_write';
const SAVEWIRTEDATA = 'goods/save_write_data';
const SAVEREVIEWDATA = 'goods/save_review_data';

export const save_goods_data = createAction(SAVEGOODSDATA);
export const set_like_state = createAction(SETLIKESTATE);
export const like_loading = createAction(LIKELOADING);
export const set_goods_num = createAction(SETGOODSNUM);
export const set_loading = createAction(SETLOADING);
export const overlap_cart = createAction(OVERLAPCART);
export const add_complate_cart = createAction(ADDCOMPLATECART);
export const toggle_fixed = createAction(TOGGLEFIXED);
export const save_QandA_data = createAction(SAVEQANDADATA);
export const toggle_write = createAction(TOGGLEWRITE);
export const save_write_data = createAction(SAVEWIRTEDATA);
export const save_review_data = createAction(SAVEREVIEWDATA);

const initialState = {
    goods_loading : false,
    goods_data : JSON.stringify({}),
    like_state : false,
    like_loading : false,
    goods_num : 0,
    goods_result_price : 0,
    overlap_cart : false,
    save_overlap_id : null,
    add_complate : false,
    open_fixed : false,
    QandA_info : JSON.stringify([]),
    QandA_write : false,
    QandA_contents : "",
    QandA_secret : false,
    QandA_select : null,
    QandA_length : 0,
    QandA_loading : false,
    review_info : JSON.stringify([]),
    review_length : 0,
    review_select : null
};

export default handleActions({
   [SAVEGOODSDATA] : (state, data) => {
      return {
        ...state,
        goods_data : data.payload.obj
      };
    },

    [SETLIKESTATE] : (state, data) => {

      return {
        ...state,
        like_state : data.payload.obj
      }
    },

    [LIKELOADING] : (state, data) => {
      return {
        ...state,
        like_loading : data.payload.bool
      }
    },

    [SETGOODSNUM] : (state, data) => {
      const goods_num = data.payload.num !== undefined ? data.payload.num : state.goods_num;
      const goods_result_price = data.payload.price !== undefined ? data.payload.price : state.goods_result_price

      return {
        ...state,
        goods_num : goods_num,
        goods_result_price : goods_result_price
      }
    },

    [SETLOADING] : (state) => {
      return {
        ...state,
        goods_loading : true
      }
    },

    [OVERLAPCART] : (state, data) => {
      return {
        ...state,
        overlap_cart : data.payload.bool,
        save_overlap_id : data.payload.num === undefined ? state.save_overlap_id : data.payload.num
      }
    },

    [ADDCOMPLATECART] : (state, data) => {
      return {
        ...state,
        add_complate : data.payload.bool
      }
    },

    [TOGGLEFIXED] : (state, data) => {
      return {
        ...state,
        open_fixed : data.payload.bool
      }
    },

    [SAVEQANDADATA] : (state, data) => {
      return {
        ...state,
        QandA_info : data.payload.arr !== undefined ? data.payload.arr : state.QandA_info,
        QandA_length : data.payload.qna_length !== undefined ? data.payload.qna_length : state.QandA_length,
        QandA_loading : data.payload.loading !== undefined ? data.payload.loading : state.QandA_loading
      }
    },

    [TOGGLEWRITE] : (state, data) => {
      return {
        ...state,
        QandA_write : data.payload.qna !== undefined ? data.payload.qna : state.QandA_write,
      }
    },

    [SAVEWIRTEDATA] : (state, data) => {
      return {
        ...state,
        QandA_contents : data.payload.qna_contents !== undefined ? data.payload.qna_contents : state.QandA_contents,
        QandA_secret : data.payload.qna_secret !== undefined ? data.payload.qna_secret : state.QandA_secret,
        QandA_select : data.payload.qna_select !== undefined ? data.payload.qna_select : state.QandA_select
      }
    },

    [SAVEREVIEWDATA] : (state, data) => {
      return {
        ...state,
        review_info : data.payload.arr !== undefined ? data.payload.arr : state.review_info,
        review_length : data.payload.length !== undefined ? data.payload.length : state.review_length,
        review_select : data.payload.select !== undefined ? data.payload.select : state.review_select
      }
    }

}, initialState);