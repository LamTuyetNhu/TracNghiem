
import { INCREMENT, DECREMENT } from '../action/counterAction';
import {FETCH_USER_LOGIN_SUCCESS} from "../action/userAction"
const INITIAL_STATE = {
  account: {
    access_token: '',
    refresh_token: '',
    username: '',
    role: ''
  },
  isAuthenticated: false
};

const userReducer = (state = INITIAL_STATE, action) => {
    switch (action.type) {
        case FETCH_USER_LOGIN_SUCCESS:
          console.log("action: ", action)
            return {
                ...state, account: {
                  access_token: action?.payload?.data?.token,
                  refresh_token: action?.payload?.data?.refresh_token,
                  username: action?.payload?.data?.dataUser?.NameUser,
                  role: action?.payload?.data?.dataUser?.RoleID
                },
                isAuthenticated: true
            };

        case DECREMENT:
            return {
                ...state, count: state.count - 1,
            };
        default: return state;
    }
};

export default userReducer;