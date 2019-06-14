import { leaf, initialState, noobUser } from "./const";
import {LOGIN_SUCCESS, LOGIN_RESET} from '../events';

// path: store.auth
function authReducer(state = initialState, action, store) {
  if (action.type === LOGIN_SUCCESS)
    return {
      ...state,
      [action.data.id]: action.data
    };

  if (action.type === LOGIN_RESET)
    return initialState;

  return state;
}
authReducer.initialState = initialState;

//auth.eventName = LOGIN_SUCCESS; // commented out to let it run on all events..

export default authReducer;

export const getAuth = store => store[leaf] || initialState;
export const getUserById = (store, id) => getAuth(store)[id] || noobUser;
