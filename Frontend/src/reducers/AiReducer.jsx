
import {
    AiVideoMergeUrlReducer,
    AudioToVideoTranscriptionReducer
    
}from '../actions/types'

const initialState = {
    AiVideoMergeUrl : [],
    AudioToVideoTranscription : []
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
        case AudioToVideoTranscriptionReducer:
            return {
                ...state,
                AudioToVideoTranscription : payload
            }   
     
        default:
            return state
    }

   
}