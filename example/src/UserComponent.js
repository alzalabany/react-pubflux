import React from 'react';
import {withFlux} from 'react-pubflux';

class UserComponent extends React.PureComponent{

  render(){
    const { data } = this.props;

    return <li>
      <label>{data.id}</label> : <small> {data.username} </small>
    </li>
  }
}

UserComponent.stateToProps = (store, select, props)=>({
  // notice we dont need to pass store to getUserById.. its already bound
  data: select.auth.getUserById(props.id)
})

export default withFlux(UserComponent)
