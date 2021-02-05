import { createAction, handleActions } from 'redux-actions';

const SETSEARCHDATA = 'search/set_search_data';
const SAVEQUERY = 'search/save_qry';
const TOGGLEVIEWTYPE = 'search/toggle_view_type';

export const set_search_data = createAction(SETSEARCHDATA);
export const save_qry = createAction(SAVEQUERY);
export const toggle_view_type = createAction(TOGGLEVIEWTYPE);

const initialState = {
    search_data : JSON.stringify([]),
    search_length : 0,
    search : "",
    search_view_type : "album",
    serach_first_cat : null,
    serach_last_cat : null,
    search_ready : false
};

export default handleActions({
   [SETSEARCHDATA] : (state, data) => {
      return {
        ...state,
        search_data : data.payload.arr !== undefined ? data.payload.arr : state.search_data,
        search_length : data.payload.length !== undefined ? data.payload.length : state.search_length,
        search_ready : true
      };
    },

    [SAVEQUERY] : (state, data) => {
        const cover_search_view_type = data.payload.view_type !== undefined
                        ? data.payload.view_type
                        : state.search_view_type

        return {
            ...state,
            search : data.payload.search,
            search_view_type : cover_search_view_type,
            serach_first_cat : data.payload.first_cat,
            serach_last_cat : data.payload.last_cat
        }
    },

    [TOGGLEVIEWTYPE ] : (state, data) => {

        return {
            ...state,
            search_view_type : data.payload.bool
        }
    }

}, initialState);