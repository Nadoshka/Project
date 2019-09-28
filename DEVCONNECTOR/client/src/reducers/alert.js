import { SET_ALERT, REMOVE_ALERT } from '../actions/types';

const initialState = [];

export default function(state = initialState, action) {
  // action contain two things. One mandatory which is a type and then a payload which is the data.
  const { type, payload } = action;
  switch (type) {
    case SET_ALERT: // => dispatch the type SET_ALERT
      return [...state, payload]; // return the array with new alert
    case REMOVE_ALERT:
      return state.filter(alert => alert.id !== payload); //remove will filter through and return all alerts except the one which match the payload
    default:
      return state;
  }
}
