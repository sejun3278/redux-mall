import { createAction, handleActions } from 'redux-actions';

const SETUSERDATA = 'admin_user/set_user_data';

export const set_user_data = createAction(SETUSERDATA);

const initialState = {
    user_data : JSON.stringify({}),
    user_cnt : 0,
    user_loading : false
};

export default handleActions({
   [SETUSERDATA] : (state, data) => {
      const body = data.payload.obj;

      return {
        ...state,
        user_data : JSON.stringify(body.data),
        user_cnt : body.cnt,
        user_loading : true
      };
    }

}, initialState);