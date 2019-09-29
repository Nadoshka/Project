import uuid from 'uuid';
import { SET_ALERT, REMOVE_ALERT } from './types';
//we have an action called setAlert will dispatch the type of setAlert to the reducer and will add the alert to the state.which initially is just an empty array.
export const setAlert = (msg, alertType, timeout = 5000) => dispatch => {
  const id = uuid.v4();
  //dispatch() is the method used to dispatch actions and trigger state changes to the store,react-redux is the library that is passing these methods to component as props.
  dispatch({
    type: SET_ALERT,
    payload: { msg, alertType, id },
  });

  // we're able to do this because of that thunk middleware.
  //Redux Thunk is a middleware that lets you call action creators that return a function instead of an action object.The thunk can be used to delay the dispatch of an action, or to dispatch only if a certain condition is met
  setTimeout(() => dispatch({ type: REMOVE_ALERT, payload: id }, timeout));
};
