import uuid from 'uuid';
import { SET_ALERT, REMOVE_ALERT } from './types';
//we have an action called setAlert will dispatch the type of setAlert to the reducer and will add the alert to the state.which initially is just an empty array.
export const setAlert = (msg, alertType, timeout = 5000) => dispatch => {
  const id = uuid.v4();
  dispatch({
    type: SET_ALERT,
    payload: { msg, alertType, id },
  });

  // we're able to do this because of that thunk middleware.
  setTimeout(() => dispatch({ type: REMOVE_ALERT, payload: id }, timeout));
};
