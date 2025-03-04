import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { connect, useDispatch, useSelector } from "react-redux";
import { CheckAuthenticated, logout, load_user } from "../actions/auth";
import { CLEAR_EVENT, INTERCEPTER, NOTIFIER_STATUS } from "../actions/types";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Notifier =  ({isAuthenticated}) =>{
    const [type, setType] = useState('FAIL')
    const [payload, setPayload] = useState('null')
    const dbEvent  = useSelector((state) => state.auth)
    const ThemeVal = useSelector((state) => state.auth.Theme)    

    useLayoutEffect(() => {
        if(type == 'null') {
            
        }else if(type == 'INTERCEPT' && payload != 'null'){
                //console.log('intersepting',dispNotify,payload)
             

        }else if (type == 'FAIL' && payload != 'null'){
            //console.log('dispatching fail')
            toast(String(payload),{
                theme : ThemeVal,
                position : 'top-right',
                type : 'error'
            }
            )
            
        }else if (type == 'LOADING' && payload != 'null'){
            toast(String(payload),{
                theme : ThemeVal,
                position : 'top-right',
                type : 'info'
            }
            )
           
        }else if (type == 'SUCCESS' && payload != 'null'){           
            toast(String(payload),{
                theme : ThemeVal,
                position : 'top-right',
                type : 'success'
            }
            )
        }
    },[type, payload])
    useLayoutEffect(() => {
        
        if(dbEvent.notifierType != 'null' && dbEvent.notifierType != 'INTERCEPT' && dbEvent.notifierMessage != 'null' ){
            //console.log('am not null',dbEvent.notifierType, dbEvent.notifierMessage)
            
            setType(dbEvent.notifierType)
            setPayload(dbEvent.notifierMessage)         
            //ToogleNotifier()
        }    
    },[dbEvent]) 
   
  
    return (
        <>
            <ToastContainer/>
        </>
    )
}
const mapStateToProps = state => ({
    isAuthenticated : state.auth.isAuthenticated
})
export default connect(mapStateToProps,{CheckAuthenticated})(Notifier)