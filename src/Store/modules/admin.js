import { createAction, handleActions } from 'redux-actions';

const SETADMINCODE = 'admin/set_admin_code';
const LOGINADMIN = 'admin/login_admin';

export const set_admin_code = createAction(SETADMINCODE);
export const login_admin = createAction(LOGINADMIN);


const initialState = {
    admin_code : "",
    admin_state : null
};

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
        admin_state : data.payload.bool
      }
    }

}, initialState);