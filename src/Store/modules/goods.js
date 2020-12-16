import { createAction, handleActions } from 'redux-actions';

const SAVEGOODSDATA = 'goods/save_goods_data';
const SETLIKESTATE = 'goods/set_like_state';
const LIKELOADING = 'goods/like_loading';
const SETGOODSNUM = 'goods/set_goods_num';
const SETLOADING = 'goods/set_loading';
const OVERLAPCART = 'goods/overlap_cart';
const ADDCOMPLATECART = 'goods/add_complate_cart';
const TOGGLEFIXED = 'goods/toggle_fixed';

export const save_goods_data = createAction(SAVEGOODSDATA);
export const set_like_state = createAction(SETLIKESTATE);
export const like_loading = createAction(LIKELOADING);
export const set_goods_num = createAction(SETGOODSNUM);
export const set_loading = createAction(SETLOADING);
export const overlap_cart = createAction(OVERLAPCART);
export const add_complate_cart = createAction(ADDCOMPLATECART);
export const toggle_fixed = createAction(TOGGLEFIXED);

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
    open_fixed : false
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
    }

}, initialState);