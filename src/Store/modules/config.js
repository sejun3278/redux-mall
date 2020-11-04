import { createAction, handleActions } from 'redux-actions';

const CHANGENUMBER = 'test/change_number';

export const change_number = createAction(CHANGENUMBER);


const initialState = {
    login : false
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
    }
}, initialState);