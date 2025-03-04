
import {
    LOGIN_SUCCESS,
    LOGIN_FAIL,
    USER_LOADED_SUCCESS,
    USER_LOADED_FAIL,
    AUTHENTICATED_SUCCESS,
    AUTHENTICATED_FAIL,
    LOGOUT,
    PASSWORD_RESET_CONFIRM_FAIL ,
    PASSWORD_RESET_CONFIRM_SUCCESS,
    PASSWORD_RESET_FAIL,
    PASSWORD_RESET_SUCCESS,
    SIGNUP_SUCCESS,
    SIGNUP_FAIL,
    ACTIVATION_SUCCESS,
    ACTIVATION_FAIL,
    REFRESH_SUCCESS ,
    REFRESH_FAIL,
    csrf_SUCCESS,
    csrf_FAIL,
    LOADING_USER,
    SUCCESS_EVENT,
    FAIL_EVENT,
    }from './types'
    import Cookies from 'js-cookie';

    export const GetCSRFToken = () => async dispatch => {
        try {
            const response = await fetch(`${import.meta.env.VITE_APP_API_URL}/cred/csrfToken/`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json",
                    "Authorization": `JWT ${localStorage.getItem('access')}`
                },
                credentials: "include", // Ensure cookies are sent
            });
    
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
    
            const res = await response.json(); // Ensure JSON parsing
            //console.log("CSRF Response:", res);
    
            if (res.Success === "CSRF cookie set") {
                Cookies.set("Inject", res.encryptedToken, {
                    path: "/",
                    secure: true,
                    sameSite: "None",
                });
            }
        } catch (error) {
            console.error("CSRF Fetch Error:", error);
            dispatch({ type: csrf_FAIL });
        }
    };
    



export const CheckAuthenticated = () => async dispatch => {
    if(localStorage.getItem('access')) {

        function AuthFunc(data) {
            const res = JSON.parse(data)
           if(res.code != 'token_not_valid'){
               // console.log('authenitcated')
                dispatch ({
                    type: AUTHENTICATED_SUCCESS
                })
                
            
            } else {
                //console.log(' not authenticated')
                dispatch ({
                    type: AUTHENTICATED_FAIL
                })
            }
        }
        

        try{
            var myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/json");
        myHeaders.append('Accept', 'application/json')
        myHeaders.append( 'Authorization', `JWT ${localStorage.getItem('access')}`)
        var raw = JSON.stringify({
            "token": String(localStorage.getItem('access'))
          });
          
        var requestOptions = {
            method: 'POST',
            headers: myHeaders,
            body: raw,
            redirect: 'follow'
          };
          
        //const res = await axios.post(`${import.meta.env.VITE_APP_API_URL}/auth/jwt/create/`,config, body );
        fetch(`${import.meta.env.VITE_APP_API_URL}/auth/jwt/verify/`, requestOptions)
        .then(response => response.text())
        .then(result => AuthFunc(result))
        .catch(error => {
            //console.error('There has been a problem with your fetch operation:', error);
            dispatch({
              type: AUTHENTICATED_FAIL,
            });
        });
             
         }catch(err) {
             //console.log(err)
             dispatch ({
                 type: AUTHENTICATED_FAIL
             })
     
         }



    }else {
        dispatch({
            type : AUTHENTICATED_FAIL
        })
    }

}

export const RefreshRequest = (refreshtoken) => async dispatch => {
    
    dispatch({
        type:LOADING_USER
    })
    if(localStorage.getItem('access')) {

        function AuthFunc(data) {
            const res = JSON.parse(data)
            //console.log(res)
           if(res.code != 'token_not_valid'){
               //console.log('authenitcated')
                dispatch ({
                    type: REFRESH_SUCCESS,
                    payload: res
                })
                
                return true;
            } else {
                var obj = Object.keys(res)
                var response = obj[0]
                var code = obj[1]
                var feeds = res[response]
                var feeds2 = res[code]
                //console.log(feeds,feeds2)
                dispatch({
                    type : REFRESH_FAIL,
                    payload : String(response+ ": "+ String(feeds) )
                })
                

                return false
            }
        }
        

        try{
            var myHeaders = new Headers();
            //console.log(refreshtoken)
        myHeaders.append("Content-Type", "application/json");
        myHeaders.append('Accept', 'application/json')
        myHeaders.append( 'Authorization', `JWT ${localStorage.getItem('access')}`)
        var raw = JSON.stringify({
            "refresh": String(refreshtoken)
          });
          
        var requestOptions = {
            method: 'POST',
            headers: myHeaders,
            body: raw,
            redirect: 'follow'
          };
          
        //const res = await axios.post(`${import.meta.env.VITE_APP_API_URL}/auth/jwt/create/`,config, body );
        fetch(`${import.meta.env.VITE_APP_API_URL}/auth/jwt/refresh/`, requestOptions)
        .then(response => response.text())
        .then(result => AuthFunc(result))
        .catch(error => {
            //console.error('There has been a problem with your fetch operation:', error);
            dispatch({
              type: REFRESH_FAIL,
            });
        });
             
         }catch(err) {
             //console.log(err)
             dispatch ({
                 type: REFRESH_FAIL
             })
     
         }



    }else {
        dispatch({
            type : AUTHENTICATED_FAIL
        })
    }

}

export const delete_user = (email,password) =>  async dispatch => {
    function LoaderResponse(props) {
        const data = JSON.parse(props)
        //console.log('user data request is', data.is_ac)
        
       if(!data.success){
            // dispatch({
            //     type: USER_LOADED_FAIL,
            //     payload : data.error
            // });
            var obj = Object.keys(data)
            var response = obj[0]
            // console.log(...data[response])
            // console.log(typeof(data[response]))
            var feeds = data[response]
            //console.log(feeds)
            dispatch({
                type : LOGIN_FAIL,
                payload : String(response+ ": "+  feeds)
            })
       }else {
            dispatch ({
                type: LOGOUT,
                payload: data.detail
            })
            
       }

        
       
        
       
    }
    //console.log(localStorage.getItem('access'), typeof(localStorage.getItem('access')))
    if (localStorage.getItem('access')  != 'undefined'){
            //console.log('making the loaduser request')
        const config = {
            headers : {
                'Content-Type' : 'application/json',
                'Authorization' : `JWT ${localStorage.getItem('access')}`,
                'Accept' : 'application/json'
            }
        }
        try {
            const body = JSON.stringify({
                "current_email": String(email),
                "current_password": String(password)
            });
            var requestOptions = {
                method: 'DELETE',
                headers: {
                            'Content-Type' : 'application/json',
                            'Authorization' : `JWT ${localStorage.getItem('access')}`,
                            'Accept' : 'application/json'
                        },
                body : body,
                redirect: 'follow'
            };
            //const res = await axios.post(`${import.meta.env.VITE_APP_API_URL}/auth/jwt/create/`,config, body );
            fetch(`${import.meta.env.VITE_APP_API_URL}/auth/users/me/`, requestOptions)
            .then(response => response.text())
            .then(result => LoaderResponse(result))
            .catch(error => {
                //console.error('There has been a problem with your fetch operation:', error);
                dispatch({
                  type: USER_LOADED_FAIL,
                });
            });
           

            
        }catch(err) {
            //console.log('error of loaduser is: ' ,err)
            dispatch ({
                type: USER_LOADED_FAIL
            })
    
        }
    
    }
    else {
        dispatch ({
            type: USER_LOADED_FAIL,
            payload : 'Could not process your request'
        })

    }
    

}

export const load_user = () =>  async dispatch => {
    function LoaderResponse(props) {
        const data = JSON.parse(props)
        //console.log('user data request is', data.is_ac)
        
       if(data.code == 'token_not_valid'){
        dispatch({
            type : LOGOUT,
            payload : data
        })
       }else {
        dispatch({
            type : USER_LOADED_SUCCESS,
            payload : data
        })
       }

        
       
        
       
    }
    //console.log(localStorage.getItem('access'), typeof(localStorage.getItem('access')))
    if (localStorage.getItem('access')  != 'undefined'){
            //console.log('making the loaduser request')
        const config = {
            headers : {
                'Content-Type' : 'application/json',
                'Authorization' : `JWT ${localStorage.getItem('access')}`,
                'Accept' : 'application/json'
            }
        }
        try {
           //const res = await axios.get(`${process.env.VITE_APP_API_URL}/auth/users/me/`, config);
            //myHeaders.append("Content-Type", "application/json");
            var requestOptions = {
                method: 'GET',
                headers: {
                            'Content-Type' : 'application/json',
                            'Authorization' : `JWT ${localStorage.getItem('access')}`,
                            'Accept' : 'application/json'
                        },
            
                redirect: 'follow'
            };
            //const res = await axios.post(`${import.meta.env.VITE_APP_API_URL}/auth/jwt/create/`,config, body );
            fetch(`${import.meta.env.VITE_APP_API_URL}/auth/users/me/`, requestOptions)
            .then(response => response.text())
            .then(result => LoaderResponse(result))
            .catch(error => {
                //console.error('There has been a problem with your fetch operation:', error);
                dispatch({
                  type: USER_LOADED_FAIL,
                });
            });
           

            
        }catch(err) {
            //console.log('error of loaduser is: ' ,err)
            dispatch ({
                type: USER_LOADED_FAIL
            })
    
        }
    
    }
    else {
        dispatch ({
            type: USER_LOADED_FAIL
        })

    }
    

}

export const login = (email, password) =>  async dispatch => {
    //const [responsedata, setresponsedata] = useState()
    dispatch({
        type:LOADING_USER
    })
    
    const config = {
        headers : {
            'Content-Type' : 'application/json'
        }
    }
    const body = JSON.stringify({
        "email": String(email),
        "password": String(password)
    });
   
    function Responser(props) {
        const data = props != '' ? JSON.parse(props) : ''
       //console.log('data :',data,'props:',props)
        if(data.refresh ) {
            //console.log('running success')
            dispatch({
                type : LOGIN_SUCCESS,
                payload : JSON.parse(props)
            })

        }else {
           // console.log('running fail')
            var obj = Object.keys(data)
            var response = obj[0]
            // console.log(...data[response])
            // console.log(typeof(data[response]))
            var feeds = data[response]
            //console.log(feeds)
            dispatch({
                type : LOGIN_FAIL,
                payload : String(response+ ": "+  feeds)
            })
        }
    }

    try {
        var myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/json");
        var requestOptions = {
            method: 'POST',
            headers: myHeaders,
            body: body,
            redirect: 'follow'
          };
        //const res = await axios.post(`${import.meta.env.VITE_APP_API_URL}/auth/jwt/create/`,config, body );
        fetch(`${import.meta.env.VITE_APP_API_URL}/auth/jwt/create/`, requestOptions)
        .then(response => response.text())
        .then(result => Responser(result)) 
        .catch(error => {
            console.error('There has been a problem with your fetch operation:', error);
            dispatch({
              type: LOGIN_FAIL,
            });
        });
        
    }catch(err) {
        //console.log('error is:',err)
        dispatch ({
            type: LOGIN_FAIL
        })

    }

}

export const reset_password = (email) => async dispatch => {
    const config = {
        headers : {
            'Content-Type' : 'application/json'
        }
    }
    dispatch({
        type : LOADING_USER
    })
    const body = JSON.stringify({
        "email": String(email)
    });

    function Reset_Responser(props) {
        // dispatch({
        //     type : PASSWORD_RESET_SUCCESS
        // })
        //console.log(props)
        const data = props != '' ? JSON.parse(props) : ''
        if(!data ) {
            
            dispatch({
                type : PASSWORD_RESET_SUCCESS
            })

        }else {
            var obj = Object.keys(data)
            var response = obj[0]
            // console.log(...data[response])
            // console.log(typeof(data[response]))
            var feeds = data[response]
            //console.log(feeds)
            dispatch({
                type : PASSWORD_RESET_FAIL,
                payload : String(  feeds)
            })
        }

    }

    try {
        var myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/json");
        var requestOptions = {
            method: 'POST',
            headers: myHeaders,
            body: body,
            redirect: 'follow'
          };
        //const res = await axios.post(`${import.meta.env.VITE_APP_API_URL}/auth/jwt/create/`,config, body );
        fetch(`${import.meta.env.VITE_APP_API_URL}/auth/users/reset_password/`, requestOptions)
        .then(response => response.text())
        .then(result => Reset_Responser(result))
        .catch(error => {
            //console.error('There has been a problem with your fetch operation:', error);
            dispatch({
              type: PASSWORD_RESET_FAIL,
            });
        });
        
    }catch(err) {
        //console.log(err)
        dispatch ({
            type: PASSWORD_RESET_FAIL
        })

    }
}

export const reset_passoword_confirm = (uid,token, new_password, re_new_password) => async dispatch => {
    const config = {
        headers : {
            'Content-Type' : 'application/json'
        }
    }
    //console.log('auth',new_password,re_new_password)
    dispatch({
        type : LOADING_USER
    })
    const body = JSON.stringify({
        "uid": uid,
        'token' : token,
        //'token': localStorage.getItem('access'),
        'new_password': new_password,
        're_new_password': re_new_password
    });
    //console.log(body)
    function Reset_Responser_Confirm(props) {
        
        // dispatch({
        //     type : PASSWORD_RESET_CONFIRM_SUCCESS
        // })
        const data = props != '' ? JSON.parse(props) : ''
        //console.log(data)
        if(!data ) {
            
            dispatch({
                type : PASSWORD_RESET_CONFIRM_SUCCESS,
                payload : 'Account Password Successfuly Changed.'
            })

        }else {
            var obj = Object.keys(data)
            var response = obj[0]
            // console.log(...data[response])
            // console.log(typeof(data[response]))
            var feeds = data[response]
            //console.log(feeds)
            dispatch({
                type : PASSWORD_RESET_CONFIRM_FAIL,
                payload : String(  feeds)
            })
        }

    }

    try {
        var myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/json");
        var requestOptions = {
            method: 'POST',
            headers: myHeaders,
            body: body,
            redirect: 'follow'
          };
        //const res = await axios.post(`${import.meta.env.VITE_APP_API_URL}/auth/jwt/create/`,config, body );
        fetch(`${import.meta.env.VITE_APP_API_URL}/auth/users/reset_password_confirm/`, requestOptions)
        .then(response => response.text())
        .then(result => Reset_Responser_Confirm(result))
        .catch(error => {
            //console.error('There has been a problem with your fetch operation:', error);
            dispatch({
              type: PASSWORD_RESET_CONFIRM_FAIL,
            });
        });
        
    }catch(err) {
        //console.log(err)
        dispatch ({
            type: PASSWORD_RESET_CONFIRM_FAIL
        })

    }
}


export const logout = () => dispatch => {
    dispatch ({
        type: LOGOUT
    })
    
    
}


export const signupAuth = (name, email, password,re_password) =>  async dispatch => {
    //const [responsedata, setresponsedata] = useState()
    dispatch({
        type:LOADING_USER
    })
    const config = {
        headers : {
            'Content-Type' : 'application/json'
        }
    }
    const body = JSON.stringify({
        "email": String(email),
        'name': String(name),
        "password": String(password),
        're_password': String(re_password)
    });

    function SingupResponse(props) {
        //console.log('data to payload: ', JSON.parse(data))
        const data = JSON.parse(props)
       
        if(data.id) {
            dispatch({
                type : SIGNUP_SUCCESS,
                payload : 'Check your email to activate account.'
            })

        }else {
            var obj = Object.keys(data)
            var response = obj[0]
            //console.log(...data[response])
            var feeds = String(...data[response])
            
            dispatch({
                type : SIGNUP_SUCCESS,
                payload : String( response + ':' + feeds)
            })
        }
        

    }

    try {
        var myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/json");
        var requestOptions = {
            method: 'POST',
            headers: myHeaders,
            body: body,
            redirect: 'follow'
          };
        //const res = await axios.post(`${import.meta.env.VITE_APP_API_URL}/auth/jwt/create/`,config, body );
        fetch(`${import.meta.env.VITE_APP_API_URL}/auth/users/`, requestOptions)
        .then(response => response.text())
        .then(result => SingupResponse(result))
        .catch(error => {
            //console.error('There has been a problem with your fetch operation:', error);
            dispatch({
              type: SIGNUP_FAIL,
            });
        });
        
    }catch(err) {
        //console.log(err)
        dispatch ({
            type: SIGNUP_FAIL
        })

    }

}

export const verify = (uid, token) => async dispatch => {

    dispatch({
        type : LOADING_USER
    })

    function VerifyResponse(props) {
       //console.log(props)
       const data = props != '' ? JSON.parse(props) : ''
       
        if(!data ) {
            
            dispatch({
                type : ACTIVATION_SUCCESS,
                payload : 'Account Successfuly verified.'
            })

        }else {
            var obj = Object.keys(data)
            var response = obj[0]
            // console.log(...data[response])
            // console.log(typeof(data[response]))
            var feeds = data[response]
            //console.log(feeds)
            dispatch({
                type : ACTIVATION_FAIL,
                payload : String(  feeds)
            })
        }


    }

    try{
        const myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/json");

        const raw = JSON.stringify({
        "uid": String(uid),
        "token": String(token)
        });

        const requestOptions = {
        method: "POST",
        headers: myHeaders,
        body: raw,
        redirect: "follow"
        };

        fetch(`${import.meta.env.VITE_APP_API_URL}/auth/users/activation/`, requestOptions)
        .then((response) => response.text())
        .then((result) => VerifyResponse(result))
        .catch(error => {
            //console.error('There has been a problem with your fetch operation:', error);
            dispatch({
              type: ACTIVATION_FAIL,
            });
        });
        //.catch((error) => console.error(error));

    }catch(err) {
        //console.log(err)
        dispatch ({
            type: ACTIVATION_FAIL
        })

    }
}

export const FetchLogout = (refresh_token,access) => async dispatch =>  {
    
    function LoaderResponse(data){
    //logout()
}
const user = {
    'refresh_token' : refresh_token
}

var requestOptions = {
    method: 'POST',
    headers: {
                'Content-Type' : 'application/json',
                'Authorization' : `JWT ${access}`,
                'Accept' : 'application/json'
            },
    body : JSON.stringify(user),
    redirect: 'follow'
};
//const res = await axios.post(`${import.meta.env.VITE_APP_API_URL}/auth/jwt/create/`,config, body );
fetch(`${import.meta.env.VITE_APP_API_URL}/app/logout/`, requestOptions)
.then(response => response.text())
.then(result => LoaderResponse(result))
} 