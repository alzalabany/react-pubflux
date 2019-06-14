# react-pubflux

> a simpler alternative to redux that use mix of pubsub and flux patterns to speed up app building

[![NPM](https://img.shields.io/npm/v/react-pubflux.svg)](https://www.npmjs.com/package/react-pubflux) [![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

## Install

```bash
npm install --save react-pubflux
```

## Concept

- same power of redux (immutable store, centralized storage, etc..)
- split app into 2 distinct areas, UI and SDK
- app logic is separated into multiple small functions, each can be configured to run only on certain events, or on any event


so reasoning is, UI emit events, and that's it, fire and forget..
and UI react to changes in app state.

SDK job is to listen to those events, and decide what to do with it. result can be punch more events, or a change to app state.


## Usage

you start by wrapping your app with provider.

provider accepts following props

**reducer** : rootReducer of app
**actions** : array of all actions to be registered -more on that later-
**selectors**: *optional* include object that contain selectors to ease selecting chunks of data in your app lateron
**onChange**: a callback that is called everytime your store changes
**initialState**: the initialState for store :).

```jsx
import React, { Component } from 'react'
import { Provider } from 'react-pubflux';
import rootReducer, { actions, selectors } from './appSdk';

function persistState(state){
  localStorage.setItem('STORAGE_ADDR', JSON.stringifiy(state));
}

const initialState = localStorage.getItem('STORAGE_ADDR');

class Example extends Component {
  render () {
    return (
      <Provider
        reducer={rootReducer}
        actions={actions}
        selectors={selectors}
        onChange={persistState}
        initialState={initialState || {}}
      >
        <App />
      </Provider>
    )
  }
}
```

## Root Reducer

```js
// example configReducer.js
export default function configReducer(state, action, store){
  // remember this reducer will never run except if event type was CONFIG.. so you dont need to check.
  return {
    ...state,
    action.data,
  }
}
configReducer.eventName = 'CONFIG';

// we recommend you export selectors after reducer
export const getConfig = store => store.config || {};

// example rootReducer.js
export default combineReducers({
  config: configReducer,
})
```

thats simpleset form of reducer and selectors

## Actions

- A.K.A brain of app.
- you can split your loggic into as many small functions as you need. and limit which one run when too,
- actions are async functions, if they resolve with an object that has a type property it will trigger reducers, otherwise it will end execution.


```js
async function shouldICare(event, eventData, emit, getState) {
  const appState = getState();
  const condition = Math.random();

  // run some login to determine if i should care
  if(.5 > condition)
    return 'no i should not :).. this end there';

  // well i decided that another function should continue on.
  if(.4 > condition)
  return void emit('YO_ANOTHER_FUNCTION', eventData);

  // or i can return this object so that reducers can process it
  return {
    type: 'CONFIG',
    data: {number: condition};
  }

}

```


## License

MIT © [alzalabany](https://github.com/alzalabany)
