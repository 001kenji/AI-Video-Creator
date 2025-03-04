import {combineReducers} from 'redux'
import auth from './auth'
import ProfileReducer from './profile';
import AiReducer from './AiReducer';
//combineReduxers creates a single object called 'rootReducer'
export default combineReducers({
    auth,
    AiReducer,
    ProfileReducer
});