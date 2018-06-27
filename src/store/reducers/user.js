import * as types from 'store/actions/types';

const initialState = {
  user: null,
};

export default function(state = initialState, { type, payload }) {
  switch (type) {
    case types.TEST:
      return { ...state, user: payload };
    default:
      return state;
  }
}
