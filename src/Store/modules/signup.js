import { createAction, handleActions } from 'redux-actions';

const INPUTINFO = 'signup/input_info';
const SETALERT = 'signup/set_alert';

export const input_info = createAction(INPUTINFO);
export const set_alert = createAction(SETALERT);

const initialState = {
    id : "",
    nick : "",
    pw : "",
    pw_check : "",
    agree : false,
    alert_obj : { id : false, nick : false, pw : false, pw_check : false },
};

export default handleActions({
   [INPUTINFO] : (state, data) => {
    const result = data.payload;
    let agree = data.payload.agree;

      return { 
          ...state, 
          id : result.id,
          nick : result.nick,
          pw : result.pw,
          pw_check : result.pw_check,
          agree : agree
        };
    },

    [SETALERT] : (state, data) => {
    
          return { 
              ...state,
              alert_obj : data.payload
            };
        },

}, initialState);