import { SET_USER_INFO } from "../actions";

const initialState = {
  userInfo: {
    _id: "",
    username: "",
    email: "",
    avatar: "",
  },
};

const mainReducer = (state = initialState, action) => {
  switch (action.type) {
    case SET_USER_INFO:
      return {
        ...state,
        userInfo: {
          ...state.userInfo,
          ...action.payload,
        },
      };
    default:
      return state;
  }
};
export default mainReducer;