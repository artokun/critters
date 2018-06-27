import React, { Component } from 'react';
// import { PropTypes } from 'prop-types';
import { connect } from 'react-redux';
import * as actions from 'store/actions';
import { Route, Switch, Redirect } from 'react-router-dom';
import styled from 'styled-components';

class App extends Component {
  render() {
    return (
      <MainContainer>
        <Switch>
          <Route exact path="/" component={() => <div>Home</div>} />
          <Route path="/*" component={() => <div>404 You are lost</div>} />
        </Switch>
      </MainContainer>
    );
  }
}

const PrivateRoute = ({ component: Component, ...rest }) => (
  <Route
    {...rest}
    render={props =>
      props.user ? (
        <Component {...rest} />
      ) : (
        <Redirect
          to={{
            pathname: '/login',
          }}
        />
      )
    }
  />
);

const MainContainer = styled.div`
  width: 100%;
  min-height: 100vh;
`;

const mapStateToProps = ({ user }) => ({ user });

export default connect(
  mapStateToProps,
  actions
)(App);
