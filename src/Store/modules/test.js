import { createAction, handleActions } from 'redux-actions';

const CHANGENUMBER = 'test/change_number';
const CHECKSERVER = 'test/check_server';
const CHECKDB = 'test/check_db';

export const change_number = createAction(CHANGENUMBER);
export const check_server = createAction(CHECKSERVER);
export const check_db = createAction(CHECKDB);

const initialState = {
   num : 0,
   server : "연동 안됨 222",
   db : "연동 안됨"
};

export default handleActions({
   [CHANGENUMBER] : (state, data) => {
      let num = state.num;

      if(data.payload.bool === true) {
         num = num + 1;

      } else if(data.payload.bool === false) {
         num = num - 1;
      }

      return {
        ...state,
        num : num
      };
    },

    [CHECKSERVER] : (state, data) => {
      let server = state.server

      if(data.payload.status !== false) {
         server = data.payload.status
      }

      return {
        ...state,
        server : server
      };
    },

    [CHECKDB] : (state, data) => {
      let db = state.db

      if(data.payload.status !== false) {
         db = data.payload.status
      }

      return {
        ...state,
        db : db
      };
    },

}, initialState);