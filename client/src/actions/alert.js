import uuid from 'uuid';
import { SET_ALERT, REMOVE_ALERT } from './types';
//dispatch() is the method used to dispatch actions which trigger state changes to the store.
//the action setAlert will dispatch the type of setAlert to the reducer and will add the alert to the state.which initially is just an empty array.
export const setAlert = (msg, alertType, timeout = 5000) => dispatch => {
  const id = uuid.v4();

  dispatch({
    type: SET_ALERT,
    payload: { msg, alertType, id },
  });

  // action creators as loadUser (for example app.js -> loadUser is an action creator)
  // action is a plain object

  // we're able to do this because of that thunk middleware.
  //Redux Thunk is a middleware that lets you call action creators that return a function instead of an action object.The thunk can be used to delay the dispatch of an action, or to dispatch only if a certain condition is met
  setTimeout(() => dispatch({ type: REMOVE_ALERT, payload: id }), timeout);
};
