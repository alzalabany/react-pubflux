import 'babel-polyfill'
import React from 'react'
import ReactDOM from 'react-dom'
import {
  rootReducer,
  selectors,
  actions,
  STORAGE_ADDR,
} from './sdk';
import { Provider } from 'react-pubflux';

import './index.css'
import App from './App'

const rootEl = document.getElementById('root');
const persistState = state => localStorage.setItem(STORAGE_ADDR, JSON.stringify(state));
const initialState = JSON.parse(localStorage.getItem(STORAGE_ADDR) || "{}")

ReactDOM.render(<Provider
        reducer={rootReducer}
        actions={actions}
        selectors={selectors}
        onChange={persistState}
        initialState={initialState || {}}
      >
        <App />
      </Provider>, rootEl)
