import { createAction, handleActions } from 'redux-actions';

const SETADMINCODE = 'admin/set_admin_code';
const LOGINADMIN = 'admin/login_admin';
const LISTMODALTOGGLE = 'admin/list_modal_toggle';
const ADMINNOWPAGE = 'admin/admin_now_page';
const SETWRITECAT = 'admin/set_write_cat';
const SELECTWRITEIMG = 'admin/select_write_img';
const SETPRICE = 'admin/set_price';
const SETWRITEMODIFY = 'admin/set_write_modify'
const MODIFYTHUMBNAIL = 'admin/modify_thumbnail';
const ADMINCHECKTOGGLE = 'admin/admin_check_toggle';
const SETIMAGETYPEOBJ = 'admin/set_image_type_obj';
const SETIMAGEOBJ = 'admin/set_image_obj';
const WRITECONTENTS = 'admin/write_contents';
const SETGOODSDATA = 'admin/set_goods_data';
const SAVEWRITEGOODS = 'admin/save_write_goods';
const MODIFYCHECK = 'admin/modify_check';
const CHANGEFILTER = 'admin/change_filter';
const SAVEADMINORDERDATA = 'admin/save_admin_order_data';
const DATALOADING = 'admin/data_loading'
const SETDATE = 'admin/set_date';

export const set_admin_code = createAction(SETADMINCODE);
export const login_admin = createAction(LOGINADMIN);
export const list_modal_toggle = createAction(LISTMODALTOGGLE);
export const admin_now_page = createAction(ADMINNOWPAGE);
export const set_write_cat = createAction(SETWRITECAT);
export const select_write_img = createAction(SELECTWRITEIMG);
export const set_price = createAction(SETPRICE);
export const set_write_modify = createAction(SETWRITEMODIFY);
export const modify_thumbnail = createAction(MODIFYTHUMBNAIL);
export const admin_check_toggle = createAction(ADMINCHECKTOGGLE);
export const set_image_type_obj = createAction(SETIMAGETYPEOBJ);
export const set_image_obj = createAction(SETIMAGEOBJ);
export const write_contents = createAction(WRITECONTENTS);
export const set_goods_data = createAction(SETGOODSDATA);
export const save_write_goods = createAction(SAVEWRITEGOODS);
export const modify_check = createAction(MODIFYCHECK);
export const change_filter = createAction(CHANGEFILTER);
export const save_admin_order_data = createAction(SAVEADMINORDERDATA);
export const data_loading = createAction(DATALOADING);
export const set_date = createAction(SETDATE);

const initialState = {
    admin_code : "",
    admin_state : null,
    admin_login : false,
    admin_check : false,
    admin_loading : false,
    list_modal : false,
    now_page : 'admin',
    write_first_cat : 'none',
    write_last_cat : 'none',
    write_select_img : 'direct',
    write_thumbnail : "",
    write_origin_price : 0,
    write_discount_price : 0,
    write_result_price : 0,
    write_modify : false,
    write_select_img_where : 'top',
    write_img_type : JSON.stringify({ "thumb" : "direct", "bonus" : ['direct', 'direct', 'direct'] }),
    write_img_collect : JSON.stringify({ "thumb" : '', "bonus" : ['', '', ''] }),
    write_contents : "",
    goods_loading : false,
    goods_data : JSON.stringify([]),
    goods_length : 0,
    goods_select : JSON.stringify({}),
    goods_min_price : 0,
    goods_max_price : 0,
    goods_search_id : null,
    goods_search_name : "",
    goods_state : 'none',
    goods_view_filter : null,
    modify_check : false,
    write_goods_data : JSON.stringify({}),
    admin_order_info : JSON.stringify([]),
    admin_order_length : 0,
    data_loading : false,
    start_date : null,
    end_date : null,
    date_change : false,
    admin_detail_info : JSON.stringify({}),
    admin_order_detail_info : JSON.stringify({}),
    admin_order_goods_info : JSON.stringify([]),
    admin_order_loading : false
}

export default handleActions({
   [SETADMINCODE] : (state, data) => {
      return {
        ...state,
        admin_code : data.payload.code
      };
    },

    [LOGINADMIN] : (state, data) => {

      return {
        ...state,
        admin_state : data.payload.bool !== undefined ? data.payload.bool : state.admin_state,
        admin_loading : data.payload.loading !== undefined ? data.payload.loading : state.admin_loading
      }
    },

    [LISTMODALTOGGLE] : (state, data) => {
      return {
        ...state,
        list_modal : data.payload.bool
      }
    },

    [ADMINNOWPAGE] : (state, data) => {
      return {
        ...state,
        now_page : data.payload.page
      }
    },

    [SETWRITECAT] : (state, data) => {
      const body = data.payload;

      return {
        ...state,
        write_first_cat : body.first !== undefined ? body.first : state.write_first_cat,
        write_last_cat : body.last !== undefined ? body.last : state.write_last_cat
      }
    },
    
    [SELECTWRITEIMG] : (state, data) => {
      const body = data.payload;
      
      let cover_where = body.where;
      if(!cover_where) {
        cover_where = state.write_select_img_where;
      }

      return {
        ...state,
        write_img_type : body.img,
        write_select_img_where : cover_where
      }
    },

    [SETPRICE] : (state, data) => {
      const body = data.payload;

      return {
        ...state,
        write_origin_price : body.origin,
        write_discount_price : body.discount,
        write_result_price : body.result
      }
    },

    [SETWRITEMODIFY] : (state, data) => {
      return {
        ...state,
        write_modify : data.payload.bool
      }
    },

    [ADMINCHECKTOGGLE] : (state, data) => {
      return {
        ...state,
        admin_check : data.payload.bool
      }
    },

    [SETIMAGETYPEOBJ] : (state, data) => {
      return {
        ...state,
        write_img_type : data.payload.obj
      }
    },

    [SETIMAGEOBJ] : (state, data) => {
      return {
        ...state,
        write_img_collect : data.payload.img
      }
    },

    [WRITECONTENTS] : (state, data) => {
      return {
        ...state,
        write_contents : data.payload.contents
      }
    },

    [SETGOODSDATA] : (state, data) => {
      return {
        ...state,
        goods_data : data.payload.data !== undefined ? data.payload.data : state.goods_data,
        goods_length : data.payload.length !== undefined ? data.payload.length : state.goods_length,
        goods_select : data.payload.select !== undefined ? data.payload.select : state.goods_select,
        goods_loading : true
      }
    },

    [SAVEWRITEGOODS] : (state, data) => {
      
      return {
        ...state,
        write_goods_data : data.payload.data.goods_data,
        write_origin_price : data.payload.data.origin_price,
        write_discount_price : data.payload.data.discount_price,
        write_result_price : data.payload.data.result_price,
        write_first_cat : data.payload.data.first_cat,
        write_last_cat : data.payload.data.last_cat,
        write_select_img_where : data.payload.data.where,
        write_contents : data.payload.data.contents,
        write_img_collect : data.payload.data.img_obj
      }
    },

    [MODIFYCHECK] : (state, data) => {
      return {
        ...state,
        modify_check : data.payload.bool
      }
    },

    [CHANGEFILTER] : (state, data) => {
      return {
        ...state,
        write_first_cat : data.payload.first_cat !== undefined ? data.payload.first_cat : state.write_first_cat,
        write_last_cat : data.payload.last_cat !== undefined ? data.payload.last_cat : state.write_last_cat,
        goods_min_price : data.payload.min_price !== undefined ? data.payload.min_price : state.goods_min_price,
        goods_max_price : data.payload.max_price !== undefined ? data.payload.max_price : state.goods_max_price,
        goods_search_id : data.payload.goods_id !== undefined ? data.payload.goods_id : state.goods_search_id,
        goods_search_name : data.payload.goods_name !== undefined ? data.payload.goods_name : state.goods_search_name,
        goods_state : data.payload.state !== undefined ? data.payload.state : state.goods_state,
        goods_view_filter : data.payload.view !== undefined ? data.payload.view : state.goods_view_filter
      }
    },

    [SAVEADMINORDERDATA]: (state, data) => {
      return{
        ...state,
        admin_order_info : data.payload.info !== undefined ? data.payload.info : state.admin_order_info,
        admin_order_length : data.payload.length !== undefined ? data.payload.length : state.admin_order_length,
        admin_detail_info : data.payload.detail_info !== undefined ? data.payload.detail_info : state.admin_detail_info,
        admin_order_detail_info : data.payload.order_detail_info !== undefined ? data.payload.order_detail_info : state.admin_order_detail_info,
        admin_order_goods_info : data.payload.order_goods_info !== undefined ? data.payload.order_goods_info : state.admin_order_goods_info,
        admin_order_loading : data.payload.bool !== undefined ? data.payload.bool : state.admin_order_loading
      }
    },

    [DATALOADING] : (state, data) => {
      return{
        ...state,
        data_loading : data.payload.bool
      }
    },

    [SETDATE] : (state, data) => {
      return{
        ...state,
        start_date : data.payload.start !== undefined ? data.payload.start : state.start_date,
        end_date : data.payload.end !== undefined ? data.payload.end : state.end_date,
        date_change : data.payload.bool !== undefined ? data.payload.bool : state.date_change
      }
    }

}, initialState);