import React, { useCallback, useEffect, useLayoutEffect, useState } from "react";
import {CheckAuthenticated, load_user,reset_password,signupAuth} from '../actions/auth'
import '../App.css'
import axios from 'axios'
import { Link, Navigate, useParams } from "react-router-dom";
import {connect, useDispatch, useSelector} from 'react-redux'
import { login } from "../actions/auth";
import bcrypt from 'bcryptjs'
import {useForm} from 'react-hook-form'
import LoginCover from '../assets/images/artwork.png'
import Logo from '../assets/images/hm3.jpeg'
import { toast, ToastContainer } from 'react-toastify';
import { TiVendorApple } from "react-icons/ti";
import { FaUnlock } from "react-icons/fa";
import { FaFacebookF } from "react-icons/fa";
import { TfiMicrosoftAlt } from "react-icons/tfi";
import { FcGoogle } from "react-icons/fc";
import { IoIosAdd } from "react-icons/io";
import { IoLockOpenOutline } from "react-icons/io5";
import { CiUser } from "react-icons/ci";
import { AiOutlineMail } from "react-icons/ai";
import { ShowLoginContainerReducer } from "../actions/types";
const Login = ({login,signupAuth, testFetch,reset_password,isAuthenticated}) => {
    const {register, formState, handleSubmit, getValues, setValue,watch,reset} = useForm({
        defaultValues :{
            'email': "",
            'resetemail' : '',
            'password' : '',
            'signupemail' :'',
            'name' :'',
            'signuppassword' : '',
            'signuprepassword' : ''
         },
         mode :'all'
    })
    const { page, extrainfo } = useParams();
    const [AuthData,SetAuthData] = useState({
        title : 'Login'
    })
    const dispatch = useDispatch()
    const Theme = useSelector((state) => state.auth.Theme)
    const {errors, isValid,isDirty, isSubmitting, isSubmitted} = formState
    const [islogedin,setislogedin] = useState(false)
    const [disableBtns, setDisableBtns] = useState(false)
    const LgEvent  = useSelector((state) => state.auth.notifierType)
    const [isChecked, setIsChecked] = useState(false);
    const LoginButtonValidity = errors.email || errors.password || watch('email') == '' || watch('password') == '' 
    const SignUpButtonValidity = errors.signupemail || errors.signuppassword || errors.signuprepassword || errors.name || watch('signupemail') == '' || watch('signuppassword') == '' || watch('signuprepassword') == '' || watch('name') == ''
    const ResetPasswordButtonValidity = errors.resetemail || watch('resetemail') == ''
    useEffect(() => {
        if(LgEvent != 'LOADING'){
          
            setDisableBtns(false)
        }else if(LgEvent == 'LOADING'){
            setDisableBtns(true)
            
        }
    },[LgEvent])
   
    
    function SubmitLogin(userdata){
        //console.log(getValues('email'))
        //login(getValues('email'), hashedpassword)
        
        login(getValues('email'), getValues('password'))
        reset()
        setislogedin(true) 

        if(isSubmitted){
            setDisableBtns(false)
        }
        if(page != 'post'){
            return <Navigate to="/home/AI" replace />;
        }
        
    }
    
    const RememberMe = (event) => {
       const {value,checked} = event.target 
       setIsChecked(checked);
       return
      if(checked) {
        if ('PasswordCredential' in window) {
            const cred = new PasswordCredential({
              id: getValues('email'),
              password: getValues('password')
            });
    
            navigator.credentials.store(cred)
              .then(() => {
                //console.log('Credentials stored successfully');
                // Redirect or handle successful login
              })
              .catch(error => {
                //console.error('Error storing credentials:', error);
              });
          } else {
            //console.warn('PasswordCredential API not supported');
          }
      }
    }
    function SubmitResetRequest(requestData){
        // e.preventDefault()
 
         //console.log(email[0])
         reset_password(getValues('resetemail'))
         
     }
     function SubmitSingup (signupData) {
        
        if(watch('signuppassword') == watch('signuprepassword')){
           
             signupAuth(getValues('name'),getValues('signupemail'),getValues('signuppassword'), getValues('signuprepassword'));
             
         }
     }
    // isauthenticated ? redirect to home page
    // if (isAuthenticated && localStorage.getItem('access') != 'undefined') {
    //    // console.log('your are authenticated in the login sect', isAuthenticated)

    //     return <Navigate to="/home" replace />;
    // }
    function ToogleAuth (props) {
        if(props == 'reset-password'){
            SetAuthData((e) => {
                return {
                    ...e,
                    title : 'Reset'
                }
            })
        }else if(props == 'signup'){
            SetAuthData((e) => {
                return {
                    ...e,
                    title : 'signUp'
                }
            })
        }else if(props == 'Login'){
            SetAuthData((e) => {
                return {
                    ...e,
                    title : 'Login'
                }
            })
        }
    }
    function ToogleLoginContainer (propsval) {
        if(propsval) {
            dispatch({
                type : ShowLoginContainerReducer,
                payload : false
            })
        }
    }
    return(
        <div className={` flex ${Theme} flex-col justify-start min-h-[500px] drk:text-slate-50 overflow-hidden  w-[300px] xs:w-[350px] md:w-[400px] transition-all duration-300 lg:w-[400px] mx-auto dark:bg-slate-900 bg-slate-100 text-slate-900 dark:text-slate-100 shadow-lg rounded-sm shadow-gray-400 `} >
            <div className=" w-full relative flex flex-row " >
                <big className=" font-sans text-2xl mx-auto mt-2" >{AuthData.title}</big>
                <IoIosAdd onClick={() => ToogleLoginContainer('close')} className=" mr-2 mt-2 absolute hover:text-rose-500  transition-all duration-300 rotate-45 text-2xl left-[90%] top-2 w-fit overflow-hidden text-slate-400 cursor-pointer" />
            </div>
            
            <div className=" flex flex-wrap flex-row justify-start align-middle gap-3 mt-2 py-2 w-full h-fit max-h-fit" >
                    <button className=" flex mx-auto flex-row gap-1 hover:text-opacity-100  text-opacity-80 dark:shadow-slate-400 dark:hover:shadow-slate-200 text-slate-700  dark:text-slate-400 dark:hover:text-slate-200 shadow-slate-500 px-4 py-2 my-auto rounded-2xl text-sm text-center shadow-[0px_0px_8px_1px_rgba(0,0,0,0.25)]  hover:shadow-slate-900  transition-all duration-300 hover:dark:shadow-slate-400 cursor-pointer w-fit min-w-fit " ><FcGoogle className=" mr-1 text-2xl" /> Google</button>
                    <button className=" flex mx-auto flex-row gap-1 hover:text-opacity-100  text-opacity-80  dark:shadow-slate-400 dark:hover:shadow-slate-200 text-slate-700  dark:text-slate-400 dark:hover:text-slate-200 shadow-slate-500 px-4 py-2 my-auto rounded-2xl text-sm text-center shadow-[0px_0px_8px_1px_rgba(0,0,0,0.25)]  hover:shadow-slate-900  transition-all duration-300 hover:dark:shadow-slate-400 cursor-pointer w-fit min-w-fit " ><TiVendorApple  className=" mr-1 text-2xl" /> Apple</button>
                    <button className="flex mx-auto flex-row gap-1 w-fit hover:text-opacity-100 hover:shadow-sky-800 text-opacity-80 transition-all duration-300 dark:shadow-slate-400 dark:hover:shadow-sky-400 text-slate-700  dark:text-slate-400 dark:hover:text-slate-200 shadow-slate-500 dark:shadow-slate-500'} px-4 py-2 my-auto rounded-2xl text-sm text-center shadow-[0px_0px_8px_1px_rgba(0,0,0,0.25)] transition-all duration-300 hover:dark:shadow-slate-400 cursor-pointer w-fit min-w-fit " ><FaFacebookF  className=" text-sky-500 mr-1 text-xl" /> Facebook</button>
                    <button className="flex mx-auto flex-row gap-1 w-fit hover:text-opacity-100 hover:shadow-sky-800 text-opacity-80 transition-all duration-300 dark:shadow-slate-400 dark:hover:shadow-sky-400 text-slate-700  dark:text-slate-400 dark:hover:text-slate-200 shadow-slate-500 dark:shadow-slate-500'} px-4 py-2 my-auto rounded-2xl text-sm text-center shadow-[0px_0px_8px_1px_rgba(0,0,0,0.25)] transition-all duration-300 hover:dark:shadow-slate-400 cursor-pointer w-fit min-w-fit " ><TfiMicrosoftAlt   className=" text-sky-500 mr-1 text-xl" /> Microsoft</button>

            </div>
            <hr className=" w-[90%] mx-auto mt-2 h-[1px] bg-slate-800 dark:bg-slate-300 opacity-60 " />
            <span className=" mx-auto w-fit max-w-fit mb-1 opacity-60" >or</span>
          
            <form name="loginform" noValidate className= {` ${AuthData.title == 'Login' ? 'flex flex-col ' : 'hidden'}   bg-transparent max-w-[800px] gap-4 min-h-fit justify-around w-full placeholder:text-center p-3 mx-auto align-middle `} >
                <label className="input  max-h-[40px] w-[90%] shadow-[0px_0px_8px_1px_rgba(0,0,0,0.25)] hover:shadow-slate-900  transition-all duration-300 hover:dark:shadow-slate-300 dark:shadow-slate-400 text-slate-700   shadow-slate-500  rounded-md mx-auto px-0 pl-4 max-w-[500px] bg-transparent flex items-center gap-2">
                    <AiOutlineMail className=" text-lg text-lime-500 opacity-100" />
                    <input id='LoginEmail' {...register('email',{
                        required : 'Email is Required!',
                        pattern: {
                            value: /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
                            message: 'Please enter a valid email',
                        },
                    })} name="email"  className='mx-auto text-slate-800 dark:text-slate-100 focus:outline-none ring-0 max-h-[35px] placeholder:text-slate-600 dark:placeholder:text-slate-300 bg-slate-100 bg-opacity-20 outline-1 outline-none focus-within:ring-0  border-[10px] placeholder:text-left   rounded-sm px-2 w-full'  placeholder="EMAIL" type="email"  />
                </label>
                {errors.email && <p className=" w-[90%] text-red-400 dark:text-red-500 font-sans bg-transparent mx-auto text-left rounded-sm italic text-sm sm:text-base" >{errors.email?.message}</p>}
                <label className="input max-h-[40px] w-[90%] shadow-[0px_0px_8px_1px_rgba(0,0,0,0.25)] hover:shadow-slate-900  transition-all duration-300 hover:dark:shadow-slate-300 dark:shadow-slate-400 text-slate-700   shadow-slate-500  rounded-md mx-auto px-0 pl-4 max-w-[500px] bg-transparent flex items-center gap-2">
                    <IoLockOpenOutline  className="text-lg text-rose-500  " />

                    <input {...register('password',{
                            required : 'Password is required!',
                            minLength : {
                                value : 5,
                                message :'Input more characters'
                            }
                        })}  id="password" className='mx-auto text-slate-800 dark:text-slate-100 focus:outline-none ring-0 max-h-[35px] placeholder:text-slate-600 dark:placeholder:text-slate-300 bg-slate-100 bg-opacity-20 outline-1 outline-none focus-within:ring-0  border-none placeholder:text-left border-slate-900  rounded-sm px-2 w-full'   placeholder="PASSWORD" type="password" />
                </label>
                {errors.password && <p className=" w-[90%] text-red-400 dark:text-red-500 font-sans bg-transparent mx-auto text-left rounded-sm italic text-sm sm:text-base" >{errors.password?.message}</p>}
                
                <div className="form-control w-[90%] mx-auto flex flex-row justify-between font-semibold">
                    <button id="submit" type="button" disabled={LoginButtonValidity}  onClick={SubmitLogin} className="  disabled:opacity-50 disabled:cursor-not-allowed gap-1 hover:text-opacity-100  text-opacity-80 dark:shadow-slate-500 hover:dark:shadow-amber-400 text-slate-700  dark:text-slate-400 dark:hover:text-slate-200 shadow-slate-500 px-4 min-w-[100px] py-2 my-auto rounded-2xl text-sm shadow-[0px_0px_8px_1px_rgba(0,0,0,0.25)]  hover:shadow-sky-700  transition-all duration-300 cursor-pointer w-fit ">Login</button>

                    <label className="label cursor-pointer">
                        <span className="label-text opacity-70 text-slate-800 dark:text-slate-200 font-semibold mx-3">Remember me</span>
                        <input checked={isChecked} onChange={RememberMe} type="checkbox"  className="checkbox rounded-md checkbox-info shadow-xs dark:checked:text-sky-500 shadow-slate-500 dark:shadow-slate-500" />
                    </label>
                </div>
            </form>
            <form noValidate className= {` ${AuthData.title == 'signUp' ? 'flex flex-col ' : 'hidden'}  bg-transparent max-w-[800px] gap-4 min-h-fit justify-around w-full placeholder:text-center placeholder:font-semibold border-slate-900 p-3 rounded-sm  mx-auto align-middle `} >
                <label className="input max-h-[40px] w-[90%] shadow-[0px_0px_8px_1px_rgba(0,0,0,0.25)] hover:shadow-slate-900  transition-all duration-300 hover:dark:shadow-slate-300 dark:shadow-slate-400 text-slate-700   shadow-slate-500  rounded-md mx-auto px-0 pl-4 max-w-[500px] bg-transparent flex items-center gap-2">
                    <AiOutlineMail className=" text-lg text-lime-500 opacity-100" />
                    <input id='signupemail' {...register('signupemail',{
                        required : 'Email is Required!',
                        pattern: {
                            value: /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
                            message: 'Please enter a valid email',
                        },
                    })} name="signupemail"  className='mx-auto text-slate-800 dark:text-slate-100 focus:outline-none ring-0 max-h-[35px] placeholder:text-slate-600 dark:placeholder:text-slate-300 bg-slate-100 bg-opacity-20 outline-1 outline-none focus-within:ring-0  border-none placeholder:text-left border-slate-900  rounded-sm px-2 w-full'  placeholder="EMAIL" type="email"  />
                </label>
                    
                {errors.signupemail && <p className=" w-[90%] text-red-400 dark:text-red-500 font-sans bg-transparent mx-auto text-left rounded-sm italic text-sm sm:text-base" >{errors.signupemail?.message}</p>}
                <label className="input max-h-[40px] w-[90%] shadow-[0px_0px_8px_1px_rgba(0,0,0,0.25)] hover:shadow-slate-900  transition-all duration-300 hover:dark:shadow-slate-300 dark:shadow-slate-400 text-slate-700   shadow-slate-500  rounded-md mx-auto px-0 pl-4 max-w-[500px] bg-transparent flex items-center gap-2">
                <   CiUser  className=" text-xl text-lime-500 opacity-100" />    
                    <input {...register('name',{
                        required :'Username is Required!'
                    })} name="name" className='mx-auto text-slate-800 dark:text-slate-100 focus:outline-none ring-0 max-h-[35px] placeholder:text-slate-600 dark:placeholder:text-slate-300 bg-slate-100 bg-opacity-20 outline-1 outline-none focus-within:ring-0  border-none placeholder:text-left border-slate-900  rounded-sm px-2 w-full'  placeholder="USERNAME" type="text"  />
                    
                </label>   
                    
                {errors.name && <p className=" w-[90%] text-red-400 dark:text-red-500 font-sans bg-transparent mx-auto text-left rounded-sm italic text-sm sm:text-base" >{errors.name?.message}</p>}
                <label className="input max-h-[40px] w-[90%] shadow-[0px_0px_8px_1px_rgba(0,0,0,0.25)] hover:shadow-slate-900  transition-all duration-300 hover:dark:shadow-slate-300 dark:shadow-slate-400 text-slate-700   shadow-slate-500  rounded-md mx-auto px-0 pl-4 max-w-[500px] bg-transparent flex items-center gap-2">
                    <FaUnlock className="h-4 w-4 text-green-500  opacity-100" />
                    <input {...register('signuppassword',{
                        required : 'Password is Required!',
                        minLength : {
                            value : 5,
                            message : 'Input more characters'
                        }
                    })}  name="signuppassword" className='mx-auto text-slate-800 dark:text-slate-100 focus:outline-none ring-0 max-h-[35px] placeholder:text-slate-600 dark:placeholder:text-slate-300 bg-slate-100 bg-opacity-20 outline-1 outline-none focus-within:ring-0  border-none placeholder:text-left border-slate-900  rounded-sm px-2 w-full'   placeholder="PASSWORD" type="password" />
                    
                </label>
                    
                {errors.signuppassword && <p className=" w-[90%] text-red-400 dark:text-red-500 font-sans bg-transparent mx-auto text-left rounded-sm italic text-sm sm:text-base" >{errors.signuppassword?.message}</p>}
                <label className="input max-h-[40px] w-[90%] shadow-[0px_0px_8px_1px_rgba(0,0,0,0.25)] hover:shadow-slate-900  transition-all duration-300 hover:dark:shadow-slate-300 dark:shadow-slate-400 text-slate-700   shadow-slate-500  rounded-md mx-auto px-0 pl-4 max-w-[500px] bg-transparent flex items-center gap-2">
                    <FaUnlock className="h-4 w-4 text-lime-600  opacity-100" />
                    <input {...register('signuprepassword',{
                        required : true,
                        validate: (val =   string) => {
                            if (watch('signuppassword') != val) {
                            return "Your passwords do no match";
                            }
                        },
                    })}  name="signuprepassword" className='mx-auto text-slate-800 dark:text-slate-100 focus:outline-none ring-0 max-h-[35px] placeholder:text-slate-600 dark:placeholder:text-slate-300 bg-slate-100 bg-opacity-20 outline-1 outline-none focus-within:ring-0  border-none placeholder:text-left border-slate-900  rounded-sm px-2 w-full'  placeholder="CONFIRM PASSWORD" type="password" />
                    
                </label>  
                {errors.signuprepassword && <p className=" w-[90%] text-red-400 dark:text-red-500 font-sans bg-transparent mx-auto text-left rounded-sm italic text-sm sm:text-base" >{errors.signuprepassword?.message}</p>}
                
                <button type="button" onClick={SubmitSingup} disabled={SignUpButtonValidity}   className="  disabled:opacity-50 disabled:cursor-not-allowed gap-1 ml-4 hover:text-opacity-100  text-opacity-80 dark:shadow-slate-500 dark:hover:shadow-amber-400 text-slate-700  dark:text-slate-400 dark:hover:text-slate-200 shadow-slate-500 px-4 min-w-[100px] py-2 my-auto rounded-2xl text-sm shadow-[0px_0px_8px_1px_rgba(0,0,0,0.25)]  hover:shadow-sky-700  transition-all duration-300 hover:dark:shadow-slate-400 cursor-pointer w-fit ">Sign Up</button>
            </form>
            <form  className= {`  ${AuthData.title == 'Reset' ? 'flex flex-col ' : 'hidden'}  bg-transparent max-w-[800px] gap-4 min-h-fit justify-around w-full placeholder:text-center placeholder:font-semibold border-slate-900 p-3 rounded-sm  mx-auto align-middle`} >
                    <label className="input max-h-[40px] w-[90%] shadow-[0px_0px_8px_1px_rgba(0,0,0,0.25)] hover:shadow-slate-900  transition-all duration-300 hover:dark:shadow-slate-300 dark:shadow-slate-400 text-slate-700   shadow-slate-500  rounded-md mx-auto px-0 pl-4 max-w-[500px] bg-transparent flex items-center gap-2">
                        <AiOutlineMail className=" text-lg text-lime-500 opacity-100" />
                        <input id='ForgotPasswordemail' {...register('resetemail',{
                            required : 'Email is Required!',
                            pattern: {
                                value: /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
                                message: 'Please enter a valid email',
                            },
                        })} name="resetemail"  className='mx-auto text-slate-800 dark:text-slate-100 focus:outline-none ring-0 max-h-[35px] placeholder:text-slate-600 dark:placeholder:text-slate-300 bg-slate-100 bg-opacity-20 outline-1 outline-none focus-within:ring-0  border-none placeholder:text-left border-slate-900  rounded-sm px-2 w-full'  placeholder="EMAIL" type="email"  />
                    </label>
                    {errors.resetemail && <p className=" w-[90%] text-red-400 dark:text-red-500 font-sans bg-transparent mx-auto text-left rounded-sm italic text-sm sm:text-base" >{errors.resetemail?.message}</p>}
                    <button disabled={ResetPasswordButtonValidity} type="button" onClick={SubmitResetRequest} className=" ml-4 disabled:opacity-50 disabled:cursor-not-allowed gap-1 hover:text-opacity-100  text-opacity-80 dark:shadow-slate-500 dark:hover:shadow-amber-400 text-slate-700  dark:text-slate-400 dark:hover:text-slate-200 shadow-slate-500 px-4 min-w-[100px] py-2 my-auto rounded-2xl text-sm shadow-[0px_0px_8px_1px_rgba(0,0,0,0.25)]  hover:shadow-sky-700  transition-all duration-300 hover:dark:shadow-slate-400 cursor-pointer w-fit ">Request</button>
            </form>   
            <div className=" flex flex-col mt-10  w-[90%] mx-auto px-2 align-middle gap-2 text-slate-700 dark:text-slate-500 justify-around">
                <p className= {` ${AuthData.title != 'Reset' ? 'flex flex-row  gap-2' : 'hidden'} font-semibold  opacity-70 hover:opacity-90 text-sm w-full `} >Forgot password: <span className=" hover:text-slate-300 transition-all duration-300 text-sky-500 font-semibold underline underline-offset-4 cursor-pointer" onClick={() => ToogleAuth('reset-password')} > Reset password</span></p>
                <p className= {` ${AuthData.title != 'signUp' && AuthData.title != 'Reset' ? 'flex flex-row  gap-2 ' : 'hidden'} font-semibold  opacity-70 hover:opacity-90 text-sm w-full my-3 `}>Dont have an account: <span className=" hover:text-slate-300 transition-all duration-300 text-sky-500 font-semibold underline underline-offset-4 cursor-pointer" onClick={() => ToogleAuth('signup')} >Sign up</span></p>
                <p className= {` ${AuthData.title != 'Login' ? 'flex flex-row  gap-2' : 'hidden'} font-semibold  opacity-70 hover:opacity-90 text-sm w-full `}>Have an account: <span className=" hover:text-slate-300 transition-all duration-300 text-sky-500 font-semibold underline underline-offset-4 cursor-pointer" onClick={() => ToogleAuth('Login')} >Log-in</span></p>
            </div>
            <small className=" mt-auto mb-1 ml-1 opacity-80 text-transparent bg-clip-text bg-gradient-to-br from-lime-400 to-sky-400 w-fit font-[Button] " >{import.meta.env.VITE_APP_NAME}</small>
        </div>
    )


};

const mapStateToProps =  state => ({
    isAuthenticated:state.auth.isAuthenticated
})    


export default connect(mapStateToProps, {reset_password,signupAuth, login})(Login);