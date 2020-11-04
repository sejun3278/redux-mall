import { createAction, handleActions } from 'redux-actions';

const LOGINANDLOGOUT = 'config/login_and_logout';

export const login_and_logout = createAction(LOGINANDLOGOUT);


const initialState = {
    login : false
};

export default handleActions({
   [LOGINANDLOGOUT] : (state, data) => {
      return {
        ...state,
        login : data.payload.bool
      };
    }
}, initialState);