export const INIT_ACTION = '/simpleflux/@@init/';

export function subscribe(name, fn, eventStore) {
  if (Array.isArray(name)) return name.map(n => subscribe(n, fn, eventStore));

  if (!eventStore[name]) eventStore[name] = [];

  // mutate eventStore
  eventStore[name].push(fn);

  // return unsubscribe fn;
  const idx = eventStore[name].length - 1;
  return () => {
    eventStore[name].splice(idx, 1);
  };
}
export function combineReducers(reducers) {
  const reducerKeys = Object.keys(reducers);
  const emptyState = {};

  const shouldProc = (eventName, type) =>{
    if(!eventName)return true;
    if(typeof eventName === 'string' && eventName === type) return true;
    if(Array.isArray(eventName) && eventName.indexOf(type) > -1) return true;

    return false;
  }

  return function combination(state = emptyState, action) {
    let hasChanged = false;
    const nextState = {};
    if (!action || typeof action.type !== 'string') {
      console.error(
        'All actions must contain a type attribute, eg: { type: String, ... }, we will ignore your action',
        action,
      );
      return state;
    }

    reducerKeys.forEach((key) => {
      const reducer = reducers[key];
      const previousStateForKey = state[key];
      const { initialState, eventName } = reducer;
      let nextStateForKey = shouldProc(eventName, action.type) ? reducer(
          previousStateForKey,
          action,
          state || {},
        ) : previousStateForKey || initialState;

      if (typeof nextStateForKey === 'undefined') {
        console.error(
          `reducer named ${
            key
          } returned undefined, you must return something !, we will just ignore your action for this key...`,
        );
        nextStateForKey = previousStateForKey || initialState;
      }

      nextState[key] = nextStateForKey;

      hasChanged = hasChanged || nextStateForKey !== previousStateForKey;
    });

    return hasChanged ? nextState : state;
  };
}

export function proxyArgToFns(x, store) {
  const selectors = {};
  for (const i in x) {
    selectors[i] = {};
    for (const ii in x[i]) {
      selectors[i][ii] = x[i][ii].bind(null, store);
    }
  }
  return selectors;
}

export function isFunction(fn){
  return typeof fn === 'function';
}
