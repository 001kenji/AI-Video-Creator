import {
    FAIL_EVENT,
    AiVideoMergeUrlReducer,
    AudioToVideoTranscriptionReducer,
    SUCCESS_EVENT,
    FullAudioToVideoTranscriptionReducer,
    ProgressInformationReducer,
    AudioToVideoTranscriptionStatusReducer,
    RetryRequestScopeReducer,
    RetryNumberOfRequestMadeReducer,
    RetryRequestThrottledReducer,
    UploadAudioToVideoRetryBodyReducer,
    UploadAudioToVideoThrottledBodyReducer,
    MergeAudioToVideoThrottledReducer,
    MergeAudioToVideoRetryBodyReducer
} from './types'
import Cookies from 'js-cookie'

export const PromptMergeVideos = (props) => async dispatch => {
    dispatch({
        type: AiVideoMergeUrlReducer,
        payload:  [] 
    });
    dispatch({
        type :RetryRequestScopeReducer,
        payload : null
    })
    dispatch({
        type : RetryRequestThrottledReducer,
        payload : false
    })
    function AuthFunc(data) {
        const parsedData = data ? JSON.parse(data) : {};
        if (parsedData.failed || parsedData.error) {
            dispatch({
                type: ProgressInformationReducer,
                payload: parsedData.failed || parsedData.error
            });
            dispatch ({
                type : RetryRequestScopeReducer,
                payload : 'failedMergeAudioToVideoRetry'
            })
            dispatch({
                type: AiVideoMergeUrlReducer,
                payload:  [] 
            });
        }else if (parsedData.retry) {
            dispatch({
                type : ProgressInformationReducer,
                payload : parsedData.result
            })
            dispatch({
                type : RetryNumberOfRequestMadeReducer,
                payload : parsedData.NumberOfRequestRetry
            })
            dispatch({
                type : RetryRequestScopeReducer,
                payload : parsedData.scope
            })
        }else if(parsedData.success) {
            dispatch({
                type: AiVideoMergeUrlReducer,
                payload:  parsedData.video_url 
            });
            
            dispatch({
                type: SUCCESS_EVENT,
                payload:  parsedData.success
            });
            
        }else if(parsedData.detail){
            dispatch({
                type : RetryRequestThrottledReducer,
                payload : true
            })
            dispatch({
                type: FAIL_EVENT,
                payload: parsedData.detail
            });
            dispatch({
                type: AiVideoMergeUrlReducer,
                payload:  [] 
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

export const PromptMergeAudioToVideo = (props) => async dispatch => {
    // dispatch({
    //     type: AiVideoMergeUrlReducer,
    //     payload: []
    // });
    // dispatch({
    //     type :RetryRequestScopeReducer,
    //     payload : null
    // })
    dispatch({
        type : RetryRequestThrottledReducer,
        payload : false
    })
    function AuthFunc(data) {
        const parsedData = data ? JSON.parse(data) : {};
        if (parsedData.failed) {
            dispatch({
                type: FAIL_EVENT,
                payload: parsedData.failed
            });
            dispatch({
                type: AiVideoMergeUrlReducer,
                payload: []
            });
        }else if(parsedData.success) {
            dispatch({
                type: AiVideoMergeUrlReducer,
                payload: parsedData.video_url
            });
            dispatch({
                type: SUCCESS_EVENT,
                payload: parsedData.success
            });
        }else if (parsedData.retry){
            var val = [
                parsedData.NumberOfRequestRetry,  //RetryNumberOfRequestMadeReducer
                [], //AiVideoMergeUrlReducer
                parsedData.result,  //ProgressInformationReducer
                parsedData.retry  //RetryRequestScopeReducer
            ]
            dispatch({
                type : MergeAudioToVideoRetryBodyReducer,
                payload : val
            })
            
        }
    }    

    try {
        var myHeaders = new Headers();
        // myHeaders.append("Content-Type", "application/json");
        myHeaders.append('Accept', 'application/json');
        if (localStorage.getItem('access') != null) {
            myHeaders.append('Authorization', `JWT ${localStorage.getItem('access')}`);
            myHeaders.append("x-CSRFToken", `${Cookies.get('Inject')}`);
        }
        myHeaders.append("Cookie", `Inject=${Cookies.get('Inject')}`);
 
        var requestOptions = {
            method: 'POST',
            headers: myHeaders,
            redirect: 'follow',
            body: props
        };
        
        const response = await fetch(`${import.meta.env.VITE_APP_API_URL}/app/merge_audio_to_video/`, requestOptions);
        if (response.status === 429) {
            // Read the JSON error message
            const errorJson = await response.json();
            console.error("Request throttled:", errorJson.detail);
            dispatch({
                type : MergeAudioToVideoThrottledReducer,
                payload : [
                    0,  //RetryNumberOfRequestMadeReducer
                    true, //RetryRequestThrottledReducer
                    [],  //AiVideoMergeUrlReducer
                    'MergeAudioToVideoThrottled',  //RetryRequestScopeReducer
                    errorJson.detail  //ProgressInformationReducer
                ]
            })
            return; // Exit early since the request is throttled
        }
        const reader = response.body.getReader();
        const decoder = new TextDecoder("utf-8");
        let buffer = "";
        
        while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            buffer += decoder.decode(value, { stream: true });
            let lines = buffer.split("\n");
            // Process each complete JSON line
            for (let i = 0; i < lines.length - 1; i++) {
                if (!lines[i].trim()) continue;
                try {
                    const jsonData = JSON.parse(lines[i]);
                    if (jsonData.progress) {
                        console.log("Progress:", jsonData.progress);
                        dispatch({
                            type: ProgressInformationReducer,
                            payload: jsonData.progress
                        });
                    } else if (jsonData.success || jsonData.failed || jsonData.error || jsonData.retry) {
                        AuthFunc(JSON.stringify(jsonData));
                    }
                } catch (e) {
                    console.error("Error parsing JSON:", e);
                }
            }
            // Save any partial line for the next chunk
            buffer = lines[lines.length - 1];
        }
    } catch (error) {
        console.error('Fetch error:', error);
        dispatch({
            type: FAIL_EVENT,
            payload: 'Failed to fetch AI-generated image'
        });
        dispatch({
            type: AiVideoMergeUrlReducer,
            payload: []
        });
    }
};


export const UploadAudioToVideoAudios = (props) => async dispatch => {
    // dispatch({
    //     type: AudioToVideoTranscriptionReducer,
    //     payload: []
    // });
    
    // dispatch({
    //     type: FullAudioToVideoTranscriptionReducer,
    //     payload: ''
    // });
    dispatch({
        type : RetryRequestThrottledReducer,
        payload : false
    })
    try {
        var myHeaders = new Headers();
        myHeaders.append('Accept', 'application/json');
        if (localStorage.getItem('access') != null) {
            myHeaders.append('Authorization', `JWT ${localStorage.getItem('access')}`);
            myHeaders.append("x-CSRFToken", `${Cookies.get('Inject')}`);
        }
        myHeaders.append("Cookie", `Inject=${Cookies.get('Inject')}`);
     
        var requestOptions = {
            method: 'POST',
            headers: myHeaders,
            redirect: 'follow',
            body: props
        };
        
        const response = await fetch(`${import.meta.env.VITE_APP_API_URL}/app/audio_to_video_upload/`, requestOptions);
        if (response.status === 429) {
            // Read the JSON error message
            const errorJson = await response.json();
            console.error("Request throttled:", errorJson.detail);
            dispatch({
              type: UploadAudioToVideoThrottledBodyReducer,
              payload: [
                null,                   // RetryNumberOfRequestMadeReducer (or similar)
                [],                     // AudioToVideoTranscriptionReducer
                [],                     // FullAudioToVideoTranscriptionReducer
                errorJson.detail,       // ProgressInformationReducer
                'failedThrottled',      // AudioToVideoTranscriptionStatusReducer
                true                    // RetryRequestThrottledReducer  
              ]
            });
            return; // Exit early since the request is throttled
        }
        const reader = response.body.getReader();
        const decoder = new TextDecoder("utf-8");
        let buffer = "";
        
        while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            buffer += decoder.decode(value, { stream: true });
            let lines = buffer.split("\n");
            // Process complete lines (each should be a valid JSON string)
            for (let i = 0; i < lines.length - 1; i++) {
                if (!lines[i].trim()) continue;
                try {
                    const jsonData = JSON.parse(lines[i]);
                    // If progress message exists, update progress
                    
                    if (jsonData.progress) {
                        console.log("Progress:", jsonData.progress);
                        dispatch({
                            type :ProgressInformationReducer,
                            payload : String(jsonData.progress)
                        })
                    }else if (jsonData.retry){
                        var val = [
                            jsonData.NumberOfRequestRetry,  //RetryNumberOfRequestMadeReducer
                            [], //AudioToVideoTranscriptionReducer
                            [],  //FullAudioToVideoTranscriptionReducer
                            jsonData.result,  //ProgressInformationReducer
                            jsonData.retry  //AudioToVideoTranscriptionStatusReducer
                        ]
                        dispatch({
                            type : UploadAudioToVideoRetryBodyReducer,
                            payload : val
                        })
                        
                    } else if (jsonData.success || jsonData.failed || jsonData.error ) {
                        // Final response received
                        if (jsonData.failed || jsonData.error) {
                            dispatch({
                                type: FAIL_EVENT,
                                payload: jsonData.failed || jsonData.error
                            });
                            dispatch({
                                type: AudioToVideoTranscriptionReducer,
                                payload: []
                            });
                            dispatch({
                                type: AudioToVideoTranscriptionStatusReducer,
                                payload: 'failed'
                            });
                        }else if(jsonData.success) {
                            if (jsonData.data && jsonData.data.length > 0) {
                                dispatch({
                                    type: AudioToVideoTranscriptionReducer,
                                    payload: jsonData.data[0]
                                });
                                dispatch({
                                    type: FullAudioToVideoTranscriptionReducer,
                                    payload: jsonData.data[1]
                                });
                                dispatch({
                                    type: AudioToVideoTranscriptionStatusReducer,
                                    payload: 'success'
                                });
                            }
                            dispatch({
                                type: SUCCESS_EVENT,
                                payload: jsonData.success
                            });
                        }
                    }
                } catch (e) {
                    console.error("Error parsing JSON:", e);
                }
            }
            // Keep the last partial line in the buffer
            buffer = lines[lines.length - 1];
        }
    } catch (error) {
        console.error('Fetch error:', error);
        dispatch({
            type: FAIL_EVENT,
            payload: 'Failed to transcribe your audio(s)'
        });
        dispatch({
            type: AudioToVideoTranscriptionReducer,
            payload: []
        });
        dispatch({
            type: FullAudioToVideoTranscriptionReducer,
            payload: ''
        });
    }
};
