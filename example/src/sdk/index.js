import { combineReducers } from 'react-pubflux';

import Auth from './auth';
import Config from './config';

export { default as events } from './events';

export const rootReducer = combineReducers({
  [Config.config.leaf]: Config.reducer,
  [Auth.config.leaf]: Auth.reducer,
});

export const selectors = {
  [Config.config.leaf]: Config.selectors,
  [Auth.config.leaf]: Auth.selectors,
};

export const actions = [
  ...Config.actions,
  ...Auth.actions
 ];

export const STORAGE_ADDR = '/APP/V1/'
