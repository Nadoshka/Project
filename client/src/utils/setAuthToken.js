import axios from 'axios';

//Check if there's a token in local storage or not.
const setAuthToken = token => {
  if (token) {
    axios.defaults.headers.common['x-auth-token'] = token;
  } else {
    delete axios.defaults.headers.common['x-auth-token'];
  }
};
// the reason we're doing this is when we have a token we just will send it with every request instead of picking and choosing which request to send it with.
export default setAuthToken;
