import * as types from './types';

export const setUser = user => dispatch => {
  dispatch({ type: types.TEST, payload: user });
};

export const deleteUser = user => dispatch => {
  dispatch({ type: types.TEST, payload: user });
};
