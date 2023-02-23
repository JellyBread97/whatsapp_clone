// SET_USER_INFO
// payload: { userInfo: User }
// updates the user info in the store. To use when editing the profile before sending the PUT request,
// as well as when logging in and retrieving the user info.
export const SET_USER_INFO = `SET_USER_INFO`;
export const SET_SEARCHED_USER = `SET_SEARCHED_USER`;

export const setUserInfoAction = (user) => {
  return {
    type: SET_USER_INFO,
    payload: user,
  };
};

export const setSearchedUser = (searchedUser) => {
  console.log("setSearchedUser-----------", searchedUser);
  return {
    type: SET_SEARCHED_USER,
    payload: searchedUser,
  };
};
