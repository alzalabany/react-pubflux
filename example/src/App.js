import React, { Component } from 'react'

import { withFlux } from 'react-pubflux'
import { LOGIN_START, LOGIN_END, ATTEMPT_LOGIN , LOGIN_RESET, CONFIG, CONFIG_RESET } from './sdk/events';
import UserComponent from './UserComponent'
class App extends Component {

  state = {loading: null};

  componentDidMount(){
    const { listen } = this.props;

    this.clean = [
      listen(LOGIN_START, ()=>this.setState({loading: true})),
      listen(LOGIN_END, ()=>this.setState({loading: false})),
    ]
  }
  componentWillUnmount(){
    this.clean.map(fn=>fn());
  }

  setConfig = () => {
    // 3rd param === true mean send this directly to reducer :)
    // i dont recommend this way because it will ignore all actions, yet it exsists for convience
    // this will go --> rootReducer --> update store --> back
    this.props.emit(CONFIG, {data:{randome: Math.random()}}, true)
  }

  clearConfig = () => {
    this.props.emit( CONFIG_RESET ); // this will go to action --> reducer --> store --> and back
  }

  login = () => {
    this.props.emit(ATTEMPT_LOGIN, {
      username:'demo',
      password:'demo'
    });
  }

  resetAuth = () => this.props.emit(LOGIN_RESET)

  render () {
    const {loading} = this.state
    const ids = Object.keys(this.props.appUsers);
    return (
      <div>
        <h1> {loading === true ? 'Loading...' : loading === null ? 'Hello' : 'Finished'} </h1>

        <button onClick={this.login}> login :) </button>
        <button onClick={this.resetAuth}> Clearn login </button>
        <button onClick={this.setConfig}> Set value to config directly without any actions </button>
        <button onClick={this.clearConfig}> reset config </button>
        <ul>
          {ids.map(id=><UserComponent id={id} key={id} />)}
        </ul>
        <pre><code>{JSON.stringify(this.props,null, 2)}</code></pre>
      </div>
    )
  }
}

App.stateToProps = ( store, selectors, props ) => {
  // store = global app state
  // selectors is object with selectors exported from my sdk folder
  // props are props passed down to this component from its parent
  return {
    config: selectors.config.getConfig(), // get all configs
    appUsers: selectors.auth.getAuth(), // get auth slice too :)
  }
}

// sometimes its usefull to just use
// App.stateToProps = (_, selectors) => selectors.auth.getAuth(); // inject whole slice as props

export default withFlux(App);
