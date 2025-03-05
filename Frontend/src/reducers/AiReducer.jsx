
import {
    AiVideoMergeUrlReducer,
    
}from '../actions/types'

const initialState = {
    AiVideoMergeUrl : [],
};


export default function (state = initialState, action) {

  
    const { type, payload} = action;
    
        //console.log('fired')
    switch (type) {
        
        case AiVideoMergeUrlReducer:
            return {
                ...state,
                AiVideoMergeUrl : payload
            }     
     
        default:
            return state
    }

   
}