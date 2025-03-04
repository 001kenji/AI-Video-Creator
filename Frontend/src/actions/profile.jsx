import {
    LOADING_USER,
    FAIL_EVENT,
    SUCCESS_EVENT,
    FileListReducer,
    ProfileAccountReducer,
    ProfileAboutReducer
} from './types'
import Cookies from 'js-cookie'
import { useSelector } from 'react-redux'

export const UpdateProfile = (props) => async dispatch => {
    dispatch({
        type : LOADING_USER,
        payload : 'Saving...'
    })
    function AuthFunc(props) {
        const data = props != '' ? JSON.parse(props) : ''
        
       //console.log('data :',data,'props:',props)
        if(data.failed ) {
            dispatch({
                type : FAIL_EVENT,
                payload : data.failed 
            })
            
        }else {
            dispatch({
                type : SUCCESS_EVENT,
                payload : data.success
            })

        }
        
        

    }
    

    try{
    
    var myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    myHeaders.append('Accept', 'application/json')
    myHeaders.append('Authorization' , `JWT ${localStorage.getItem('access')}`)
    myHeaders.append("x-CSRFToken", `${Cookies.get('Inject')}`);
    myHeaders.append("Cookie", `Inject=${Cookies.get('Inject')}`);
 
    var requestOptions = {
        method: 'POST',
        headers: myHeaders,
        redirect: 'follow',
        body : props
      };
    fetch(`${import.meta.env.VITE_APP_API_URL}/app/profile/`, requestOptions)
    .then(response => response.text())
    .then(result => AuthFunc(result))
    .catch(error => {
        console.error('There has been a problem with your fetch operation:', error);
      
    });
         
     }catch(err) {
        console.log(err)
        
     }





}

export const FetchUserProfile = (props) => async dispatch => {
 
    function AuthFunc(props) {
        const data = props != '' ? JSON.parse(props) : ''
        var scope = data[0] ? data[0]['scope'] : data.scope ? data.scope : '' 
       //console.log('data :',data,'props:',props)
        if(data.failed ) {
            dispatch({
                type : FAIL_EVENT,
                payload : data.failed
            })

        }else if(scope == 'ReadProfile') {
            const val = JSON.parse(props)
            var userdata = {
                'AccountEmail': val[1]['email'],
                'AccountName' : val[1]['name'],
                'AccountID' : val[1]['id'],
                'ProfilePic' : val[1]['ProfilePic'],
                'IsOwner' : val[0]['IsOwner'],
            }
           dispatch({
            type : ProfileAboutReducer,
            payload : val[1]['ProfileAbout']
           })
            dispatch({
                type : ProfileAccountReducer,
                payload : userdata
            })           
            
        }else if (data.success) {
            const val = JSON.parse(props)
            dispatch({
                type : SUCCESS_EVENT,
                payload : val['success']
            })
        }              

    }   

    try{
    
    var myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    myHeaders.append('Accept', 'application/json')
    if(localStorage.getItem('access') != null){
       // console.log(localStorage.getItem('access') )
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
    fetch(`${import.meta.env.VITE_APP_API_URL}/app/profile/`, requestOptions)
    .then(response => response.text())
    .then(result => AuthFunc(result))
    .catch(error => {
        console.error('There has been a problem with your fetch operation:', error);
      
    });
         
     }catch(err) {
        console.log(err)
        
     }





}

export const UploadProfileFile = (props) => async dispatch => {
    
    function AuthFunc(props) {
        const data = props != '' ? JSON.parse(props) : ''
       //console.log('data :',data,'props:',props)
        if(data.failed ) {
            const val = JSON.parse(props)
           //console.log(val)
           
            dispatch({
                type : FAIL_EVENT,
                payload : val
            })

        }else if(data.Scope == 'UploadRepositoryFile'){
            dispatch({
                type : SUCCESS_EVENT,
                payload : data.success
            })
            dispatch({
                type : FileListReducer,
                payload : data.FileList
            })
        }else if(data.Scope == 'GoogleAPICredentialFileUpload'){
            dispatch({
                type : SUCCESS_EVENT,
                payload : data.success
            })
            dispatch({
                type : ProfileAboutReducer,
                payload : data.AboutBody
            })
        }  
    }
    

    try{
    
    var myHeaders = new Headers();
    //myHeaders.append("Content-Type", "application/json");
    myHeaders.append('Accept', 'application/json')
    myHeaders.append('Authorization' , `JWT ${localStorage.getItem('access')}`)
    myHeaders.append("x-CSRFToken", `${Cookies.get('Inject')}`);
    myHeaders.append("Cookie", `Inject=${Cookies.get('Inject')}`);

    
    //console.log('fetching test 2')
    var requestOptions = {
        method: 'post',
        headers: myHeaders,
        redirect: 'follow',
        body : props
      };
    //const res = await axios.post(`${import.meta.env.VITE_APP_API_URL}/auth/jwt/create/`,config, body );
    fetch(`${import.meta.env.VITE_APP_API_URL}/app/profiledocs/`, requestOptions)
    .then(response => response.text())
    .then(result => AuthFunc(result))
    .catch(error => {
        console.error('There has been a problem with your fetch operation:', error);
      
    });
         
     }catch(err) {
        console.log(err)
        
     }





}