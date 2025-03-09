
import {
    AiVideoMergeUrlReducer,
    FullAudioToVideoTranscriptionReducer,
    AudioToVideoTranscriptionReducer,
    ProgressInformationReducer,
    AudioToVideoTranscriptionStatusReducer
    
}from '../actions/types'

const initialState = {
    AiVideoMergeUrl : [],
    AudioToVideoTranscription : [],
    FullAudioToVideoTranscription : [],
    AudioToVideoTranscriptionStatus : '',
    ProgressInformation : ''
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
        case FullAudioToVideoTranscriptionReducer:
            return {
                ...state,
                FullAudioToVideoTranscription : payload
            }   
        case ProgressInformationReducer:
            return {
                ...state,
                ProgressInformation : payload
            } 
        case AudioToVideoTranscriptionStatusReducer:
            return {
                ...state,
                AudioToVideoTranscriptionStatus : payload
            }   
     
        default:
            return state
    }

   
}