import { SET_USER_INFO, SET_SEARCHED_USER } from "../actions";

const initialState = {
  userInfo: {
    _id: "",
    username: "",
    email: "",
    avatar: "",
  },
  searchedUser: {},
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
    case SET_SEARCHED_USER:
      return {
        searchedUser: {
          ...state.searchedUser,
          ...action.payload,
        },
      };
    default:
      return state;
  }
};
export default mainReducer;
