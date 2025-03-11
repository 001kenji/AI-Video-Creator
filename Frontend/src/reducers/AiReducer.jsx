
import {
    AiVideoMergeUrlReducer,
    FullAudioToVideoTranscriptionReducer,
    AudioToVideoTranscriptionReducer,
    ProgressInformationReducer,
    AudioToVideoTranscriptionStatusReducer,
    RetryRequestScopeReducer,
    RetryNumberOfRequestMadeReducer,
    RetryRequestThrottledReducer,
    UploadAudioToVideoRetryBodyReducer,
    UploadAudioToVideoThrottledBodyReducer,
    MergeAudioToVideoThrottledReducer,
    MergeAudioToVideoRetryBodyReducer
    
}from '../actions/types'

const initialState = {
    AiVideoMergeUrl : [],
    AudioToVideoTranscription : [],
    FullAudioToVideoTranscription : [],
    AudioToVideoTranscriptionStatus : '',
    ProgressInformation : '',
    RetryRequestScope : null,
    RetryNumberOfRequestMade : 0,
    RetryRequestThrottled : false
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
        case RetryRequestScopeReducer:
            return {
                ...state,
                RetryRequestScope : payload
            }
        case RetryNumberOfRequestMadeReducer:
            return {
                ...state,
                RetryNumberOfRequestMade : payload
            }   
        case RetryRequestThrottledReducer:
            return {
                ...state,
                RetryRequestThrottled : payload
            } 
        case UploadAudioToVideoRetryBodyReducer:
            return {
                ...state,
                RetryNumberOfRequestMade : payload[0],
                AudioToVideoTranscription : payload[1],
                FullAudioToVideoTranscription : payload[2],
                ProgressInformation : payload[3],
                AudioToVideoTranscriptionStatus : payload[4]
            } 
        case UploadAudioToVideoThrottledBodyReducer:
            return {
                ...state,
                RetryNumberOfRequestMade : payload[0],
                AudioToVideoTranscription : payload[1],
                FullAudioToVideoTranscription : payload[2],
                ProgressInformation : payload[3],
                AudioToVideoTranscriptionStatus : payload[4],
                RetryRequestThrottled : payload[5]
            }
        case MergeAudioToVideoThrottledReducer:
            return {
                ...state,
                RetryNumberOfRequestMade : payload[0],
                RetryRequestThrottled : payload[1],
                AiVideoMergeUrl : payload[2],
                RetryRequestScope : payload[3],
                ProgressInformation : payload[4],
            } 
        case MergeAudioToVideoRetryBodyReducer:
            return {
                ...state,
                RetryNumberOfRequestMade : payload[0],
                AiVideoMergeUrl : payload[1],
                ProgressInformation : payload[2],
                RetryRequestScope : payload[3],
            } 
     
        default:
            return state
    }

   
}