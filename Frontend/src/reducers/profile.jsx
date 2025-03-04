
import {
    ProfileAboutReducer,
    FolderListReducer,
    FileListReducer,
    ProfileAccountReducer,
    SelectedPageReducer
    
}from '../actions/types'

const initialState = {
    ProfileAbout : null,
    SelectedPage : null,
    FolderList : [],
    FileList : [],
    ProfileAccount : {
        'AccountEmail' : '',
        'AccountID' : '',
        'AccountName' : 'Gest',
        'IsOwner' : false,
        'IsFollowing' : false
    }
};


export default function (state = initialState, action) {

  
    const { type, payload} = action;
    
        //console.log('fired')
    switch (type) {
        
        case ProfileAboutReducer:
            return {
                ...state,
                ProfileAbout : payload
            }
        case FolderListReducer:
            return {
                ...state,
                FolderList : payload
            }
        case ProfileAccountReducer:
            // var obj1 = payload
            // var obj2 = state.ProfileAccount
            // for (let key in obj1) {
            //     if (obj2.hasOwnProperty(key)) {
            //         obj2[key] = obj1[key]; // Update the value in obj2
            //     }
            // }
            return {
                ...state,
                ProfileAccount : payload
            }
        case FileListReducer:
            return {
                ...state,
                FileList : payload
            }
        case SelectedPageReducer:
            return {
                ...state,
                SelectedPage : payload
            }
        default:
            return state
    }

   
}