
import {
    AiVideoMergeUrlReducer,
    
}from '../actions/types'

const initialState = {
    AiVideoMergeUrl :[
        "kenjicladia@gmail.com/youtube/all_for_all_audio_0_with_audio.mp4",
        "kenjicladia@gmail.com/youtube/all_for_all_audio_1_with_audio.mp4",
        "kenjicladia@gmail.com/youtube/all_for_all_audio_2_with_audio.mp4"
      ],
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