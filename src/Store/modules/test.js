import { createAction, handleActions } from 'redux-actions';

const CHANGENUMBER = 'test/change_number';
const ALLSTATE = 'test/all_state'

export const change_number = createAction(CHANGENUMBER);
export const all_state = createAction(ALLSTATE)


const initialState = {
   num : 0,
   server : "연동 안됨",
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

    [ALLSTATE] : (state, data) => {
      let server = state.server
      let db = state.db

      if(data.payload.server === true) {
         server = '서버 연결 완료'
      }

      if(data.payload.db === true) {
         db = 'Sequelize 가동 중'
      }

      return {
        ...state,
        server : server,
        db : db
      };
    },

}, initialState);