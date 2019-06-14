import {
  CONFIG,
  CONFIG_RESET
} from '../events';

// i'm a noob fn. i will just use this to pass along events to reducer
function noob(eventName, eventData){
  return {
    type: eventName,
    data: eventData
  }
}
noob.eventName = [ CONFIG, CONFIG_RESET ];

export default [noob];
