import {
  ATTEMPT_LOGIN,
  LOGIN_FAILED,
  LOGIN_START,
  LOGIN_END,
  LOGIN_RESET,
  LOGIN_SUCCESS
} from '../events';

function log(eventName, eventData){
  console.log(eventName);
  console.table(eventData);

  return ;
}

async function attempt(_, data, emit) {
  const {username, password} = data;
  if(!username || !password)
    return emit(LOGIN_FAILED,"DATA_REQUIRED");

  if(username.length < 1 || password.length < 1)
    return emit(LOGIN_FAILED,"DATA_REQUIRED");

  emit(LOGIN_START); // used for spinners

  const login = await new Promise(resolve=>{
    // memic api call !
    const user = {
      id: parseInt( Math.random()*100 , 0), // randome id
      username
    }
    const data = {
      ok: true,
      data: user,
    }

    setTimeout(()=>resolve(data), 2000);
  });

  emit(LOGIN_END); // used for spinners


  if(login.ok && login.data && login.data.id){

    // straight to reducer :).
    return {
      type: LOGIN_SUCCESS,
      data: login.data,
    }
  }

};

// only run me if event is attempting login
attempt.eventName = ATTEMPT_LOGIN;

// used to reset login
function logout(){
  return {
    type: LOGIN_RESET
  }
}
logout.eventName = LOGIN_RESET;

export default [log, attempt, logout];
