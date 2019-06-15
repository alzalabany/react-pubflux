# Create a Simple Todo App with React's pubflux

** Disclamer ** : this is not a planned tutorial, its mearly a recording of me using pubflux to create a simple working todoApp in less than 10min !

## folder structure

I start by creating my folder struc and components.

we will need 3 folders (Components, Views, sdk);

notice i use Pascal Case for my own Components folder, and lowercase for any potentialy an external library (npm library), this way i can always know by just looking at import statement which are mine and which is not.

no creating Files, just quick thinking we will be needing

- todoInput.js -> input to create new todo
- todoList.js -> list that contain todos
- todoItem.js -> item of todo.
- index.js -> layout component, that will glue all parts together.

most probably we will also need a Button component to be used to delete/add todo, so lets add that inside Components folder.

now with boilerplate part, lets fill in some data inside these components

## Developing UI

### boilerplate code

```jsx
// Views/index.js
import React from 'react';
import TodoInput from './todoInput.js';
import TodoList from './todoList.js';

export default class TodoApp extends React.PureComponent{
  render(){
    return <div className="main-content">
      <TodoInput />
      <TodoList />
    </div>
  }
}
```
First component index just glue our components together

next lets code our Input, this one will have to be smart component (connected with pubflux) so that it can emit events to create new todo items.

```jsx
// Views/todoInput.js
import React from 'react';
import { withFlux } from 'react-pubflux'
import Button from '../Components/Button';

class TodoInput extends React.PureComponent{
  constructor(){
    this.ref = React.createRef();
  }
  onAdd = e =>{
    const text = this.ref.currentTarget.value();

    this.props.emit('TODO_ADD',{ text });
  }
  render(){
    return <div className="input-container">
      <input ref={this.ref} placeholder="add new item" />
      <Button onClick={onAdd} title="+" />
    </div>
  }
}

// we need this HOC to get access to `props.emit`
export default withFlux(TodoInput);
```
as it appear we now need button component, so lets write that.

```jsx
// Components/Button.js
import React from 'react';

export default class ButtonComponent extends React.PureComponent{
  render(){
    const {title, ...props} = this.props;
    return <button className="btn" {...props}>
      {title}
    </button>
  }
}
```

cool now we want to show list of todos, Starting with TodoList
that also will need to be smart connected component, so it can fetch items and emit events that delete/cross over items.


```jsx

// Views/todoList.js
import React from 'react';
import { withFlux } from 'react-pubflux'
import TodoItem from './todoItem.js';

class TodoList extends React.PureComponent{

  crossItem = ( id ) => {
    const { emit } = this.props;

    emit('TODO_CROSS_ITEM',{ id }, true);
  }

  del = (id) => {
    const { emit } = this.props;

    emit('TODO_REMOVE_ITEM',{ id }, true);
  }


  render(){
    const {items} = this.props;
    return <ul>
      {items.map(item=><TodoItem key={item.id}
        onRemove={this.del.bind(this, item.id)}
        onCross={this.crossItem.bind(this, item.id)}
        data={item} />)}
    </ul>
  }
}

TodoList.stateToProps = (store, selectors) => ({ items: selectors.todo.getItems() });

export default withFlux(TodoList);
```

finally lets code up TodoItem

```jsx
// todoItem.js
import React from 'react';

export default class TodoItem extends React.PureComponent{

  render(){
    const {data, onCross, onRemove, ...props} = this.props;
    return <li {...props}>
      <label>{data.text}</label>
      <Button onClick={onCross} title="cross" />
      <Button onClick={onRemove} title="remove" />
    </li>
  }
}
```

now that marks end of our UI dev. :)..

> you can imagin, this is just boilerplate code to allow us to get things going while waited for Mr. Jon Doe the UX designer to hand over our designs :) !

now so far we have written too many code and didnt even start our dev server yet.. this is what i consider good practice !

> ** tip **: going back and forth between your browser and your codeeditor is a bad sign. you have to have some faith bro/sis :), in our code we trust.

you gona have plenty of time to fix your typos later, plus don't your code-editor warn you about them as you type already ?! if not i advise you to install eslint and read about flowJs/typescript if u need.

## Logic developement

as it appeared from coding our UI, there are couple selectors, events, that we gona need for our UI to work. so lets start coding inside our `src` folder now.

what we gona need is todo folder, inside it

- action.js
- reducer.js
- const.js
- events.js

easy things first lets collect events from above and add them to events.js

```js
// sdk/events.js
export const TODO_ADD = 'TODO_ADD'
export const TODO_CROSS_ITEM = 'TODO_CROSS_ITEM'
export const TODO_REMOVE_ITEM = 'TODO_REMOVE_ITEM'

```

now lets edit our UI files, and insteed of using strings for events, lets use imported const from src/events.js

example:-

```js
// Views/todoInput.js
import { TODO_ADD } from '../src/events';
// ...
this.props.emit(TODO_ADD,{ text }); // just remove quote from around string :)
//... reset of file
```

next lets code our action.js.
now this file should contain all logic of our app, it can be composed of as many functions as you want, and just export array of them all at end of file.

```js
// src/todo/actions.js
import * as events from '../events';

function addTodo( eventName, eventData, emit, getState ){

  // step 1 validate eventData
  if(!eventData || ! eventData.text || eventData.text !== 'string' || eventData.text.length < 1){
      emit(events.TODO_ADDING_FAILED, {reason:'corrupt', eventData});
      return;
  }
  // step 2 validate its not a duplicate
  const store = getState();
  const todos = store.todo.data || [];
  const index = todos.indexOf(eventData.text);

  if( index > -1 ){
    // lets emit event TODO_ADDING_FAILED
    return void emit(events.TODO_ADDING_FAILED, {reason:'duplicate', eventData});
  }

  // okay now that everything is perfect, lets pass data to reducer.

  return {
    type: events.TODO_ADD,
    data: {
      state: 0
      text: eventData.text,
      id : parseInt( Math.random() * 1000, 0), // generate random 4 digit id
    }
  }

}

// this function will only be called if eventName === TODO_ADD
addTodo.eventName = events.TODO_ADD;

```

hope code is clear, just few things to clear up.

`return void emit(...)`  is used to return undefined, in other words it will execute emit function, but will not return its value.. we use it as shorthand insteed of writing `emit(..)` on its line and return; in other;

- dont forget to add "TODO_ADDING_FAILED" to events.js now.

next lets prepare our reducer to store data.

```
/src/todo/reducer.js
import {TODO_ADD} from '../events';

// simple implementation of immmbutable delete object by key
function sliceId(obj, id){
  return Object.entries(obj).reduce((carry,[id,data])=>{
    if( id === id) return carry; // dont add it to output
    carry[id] = data;
    return carry;
    },{});
}

// reducer
function todoReducer(state, action){

  if( action.type === TODO_ADD){
    const {data} = action;
    const newState {
      byId:{
        ... state.byId,
        [data.id]: data
      }
    }
    newState.ids = Object.keys(newState.byId).sort();

    return newState;
  }

  if( action.type === TODO_CROSS_ITEM){
    return {
      ...state,
      byId:{
        ...state.byId,
        [ action.id ]: {
          ...state.byId[action.id],
          state: state.byId[action.id].state === 0 ? 1 : 0
        }
      }
    }
  }

  if(action.type === TODO_REMOVE_ITEM){
    return {
      byId: sliceItem(state.byId, action.id),
      ids: state.ids.filter(id=>id!==action.id),
    }
  }

  return state; // this will never happen !
}
// this reducer will only run if action.type is inside this array
todoReducer.eventName = [TODO_ADD, TODO_CROSS_ITEM, TODO_REMOVE_ITEM];
// this reducer initialState will be used in case its slice is undefined...
todoReducer.initialState = initialState;

export default todoReducer;
```

straight forward, we configured reducer to only run on TODO actions, defined its initalState which we gona keep in const.js file, and we exported it as default.

well using byId and ids in this example may look bad.. infact it does look very bad code, but a. i'm writting this tutorial in 1 sitting from top of my head, b.i'm a man of convention, and keeping my data in central store indexed is somthing that served me very well.
i usually keep items in byId, and have multiple indexs setup like `byState: {0: [1,2,3], 1:[6,5]}` // where 1,2,3 are ids of items that state = 0, etc.. but this is out of scope of this example.

next lets define selectors, our UI above in todoList.js used selector "getItems" so lets define that under export default...

```
/src/todo/reducer.js
import {leaf, initialState} from './const';
// ... code from above

export default todoReducer;

export const getTodoSlice = store => store[leaf] || initialState;

export const getItems = store => {
  const slice = getTodoSlice(store);

  return slice.ids.map(id=>slice.byId[id]);
}
```



okay. now we have everything in place, lets finally glue them all together.

inside src/todo/index.js
```js
// src/todo/index.js
import reducer, * as selectors from "./reducer";
import actions from "./actions";
import * as config from "./const";

export default {
  reducer,
  actions,
  selectors,
  config
};

```

inside src/index.js

```js
//src/index.js
import Todo from './todo';

export const STORAGE_ADDR = '/MY_TODO/V1/'; // used for localStorage path.

export const rootReducer = combineReducers({
  [Todo.config.leaf]: Todo.reducer,
})

export const selectors = {
  [Todo.config.leaf]: Todo.selectors,
}

export const actions = [
  ...Todo.actions,
]
```

and finally moment of truth, lets launch our app..

inside our App index.js

```jsx
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
import App from './Views'

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
```

and tada :)..

run `yarn start` fix the 100 typos that you have written while coding all that blindly and kaboom :) your todo app will be working as charm :)


## conclusion

hopefully now you see power of splitting UI developement from SDK developement.
it doesnot only allow your team to work separatly, it also open door for great things like sharing SDK code with your crossplatform projects "same sdk folder will run on reactnative project, or anyother project that need logic of your platform"
