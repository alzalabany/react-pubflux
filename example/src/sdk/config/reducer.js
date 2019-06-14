import { leaf, initialState } from "./const";
import { CONFIG, CONFIG_RESET } from '../events';

// path: store.auth
function configReducer(state = initialState, action, store) {

  if( action.type === CONFIG_RESET )
    return initialState;

  // no need to verify.. this will only run if event is === CONFIG || CONFIG_RESET
  return {
    ...state,
    ...action.data
  }
}
configReducer.initialState = initialState;
configReducer.eventName = [CONFIG, CONFIG_RESET];

export default configReducer;
