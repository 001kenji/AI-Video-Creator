import {
    FAIL_EVENT,
    AiVideoMergeUrlReducer,
    SUCCESS_EVENT,
} from './types'
import Cookies from 'js-cookie'

export const PromptMergeVideos = (props) => async dispatch => {
    dispatch({
        type: AiVideoMergeUrlReducer,
        payload:  [] 
    });
    function AuthFunc(data) {
        const parsedData = data ? JSON.parse(data) : {};
        if (parsedData.failed) {
            dispatch({
                type: FAIL_EVENT,
                payload: parsedData.failed
            });
            dispatch({
                type: AiVideoMergeUrlReducer,
                payload:  [] 
            });
        } else {
            dispatch({
                type: AiVideoMergeUrlReducer,
                payload:  parsedData.video_url 
            });
            
            dispatch({
                type: SUCCESS_EVENT,
                payload:  parsedData.success
            });
        }
    }    

    try{
    
    var myHeaders = new Headers();
    // myHeaders.append("Content-Type", "application/json");
    myHeaders.append('Accept', 'application/json')
    if(localStorage.getItem('access') != null){
        myHeaders.append('Authorization' , `JWT ${localStorage.getItem('access')}`)
        myHeaders.append("x-CSRFToken", `${Cookies.get('Inject')}`);
    }
    
    myHeaders.append("Cookie", `Inject=${Cookies.get('Inject')}`);
 
    var requestOptions = {
        method: 'POST',
        headers: myHeaders,
        redirect: 'follow',
        body : props
      };
    fetch(`${import.meta.env.VITE_APP_API_URL}/app/merge/`, requestOptions)
    .then(response => response.text())
    .then(result => AuthFunc(result))
    .catch(error => {
        console.error('Fetch error:', error);
        dispatch({
            type: FAIL_EVENT,
            payload: 'Failed to fetch AI-generated image'
        });
        dispatch({
            type: AiVideoMergeUrlReducer,
            payload:  []
        });
    });
   
         
     }catch(err) {
        console.log(err)
        
     }

}

export const UploadAudioToVideoAudios = (props) => async dispatch => {
    dispatch({
        type: AudioToVideoTranscriptionReducer,
        payload:  [] 
    });
    function AuthFunc(data) {
        const parsedData = data ? JSON.parse(data) : {};
        if (parsedData.failed) {
            dispatch({
                type: FAIL_EVENT,
                payload: parsedData.failed
            });
            dispatch({
                type: AudioToVideoTranscriptionReducer,
                payload:  [] 
            });
        } else {
            dispatch({
                type: AudioToVideoTranscriptionReducer,
                payload:  parsedData.data 
            });
            
            dispatch({
                type: SUCCESS_EVENT,
                payload:  parsedData.success
            });
        }
    }    

    try{
    
    var myHeaders = new Headers();
    // myHeaders.append("Content-Type", "application/json");
    myHeaders.append('Accept', 'application/json')
    if(localStorage.getItem('access') != null){
        myHeaders.append('Authorization' , `JWT ${localStorage.getItem('access')}`)
        myHeaders.append("x-CSRFToken", `${Cookies.get('Inject')}`);
    }
    
    myHeaders.append("Cookie", `Inject=${Cookies.get('Inject')}`);
 
    var requestOptions = {
        method: 'POST',
        headers: myHeaders,
        redirect: 'follow',
        body : props
      };
    fetch(`${import.meta.env.VITE_APP_API_URL}/app/audio_to_video_upload/`, requestOptions)
    .then(response => response.text())
    .then(result => AuthFunc(result))
    .catch(error => {
        console.error('Fetch error:', error);
        dispatch({
            type: FAIL_EVENT,
            payload: 'Failed to fetch AI-generated image'
        });
        dispatch({
            type: AudioToVideoTranscriptionReducer,
            payload:  []
        });
    });
   
         
     }catch(err) {
        console.log(err)
        
     }

}