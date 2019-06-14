import React from 'react'
import ReactDOM from 'react-dom'
import {
  rootReducer,
  selectors,
  actions,
  Storage,
  STORAGE_ADDR,
} from './sdk';
import { Provider } from 'react-pubflux';

import './index.css'
import App from './App'

const rootEl = document.getElementById('root');

ReactDOM.render(<Provider
        reducer={rootReducer}
        actions={actions}
        selectors={selectors}
        onChange={persistState}
        initialState={initialState || {}}
      >
        <App />
      </Provider>, rootEl)
