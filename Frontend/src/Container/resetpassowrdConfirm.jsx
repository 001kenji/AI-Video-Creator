import React, { useLayoutEffect, useState } from "react";
import {CheckAuthenticated, load_user} from '../actions/auth'
import '../App.css'
import axios from 'axios'

import { useParams } from 'react-router-dom';
import {useForm} from 'react-hook-form'
import { Link, Navigate } from "react-router-dom";
import {connect, useSelector} from 'react-redux'
import { matchPath } from "react-router-dom";
import { reset_passoword_confirm } from "../actions/auth";
import { FaUnlock } from "react-icons/fa";
const ResetPasswordConfirm = ({ match,reset_passoword_confirm}) => {
    const [requestsent, setrequestsent] = useState(false)
    const {register, handleSubmit, watch, formState} = useForm({
        defaultValues :{
            'new_password':'',
            're_new_password': ''
        },
        mode : 'all'
    })

    const {errors, isValid, isDirty, isSubmitting} = formState
    const [disableBtns, setDisableBtns] = useState(false)
    const HmEvent  = useSelector((state) => state.auth.notifierType)
   
    useLayoutEffect(() => {
       
        if(HmEvent != 'LOADING'){
            
            setDisableBtns(false)
        }else if(HmEvent == 'LOADING'){
            setDisableBtns(true)
            
        }
    },[HmEvent])
    // const [formData, setFrormData] = useState({
    //     new_password: '',
    //     re_new_password : ''
    // })
    // const {new_password, re_new_password} = formData;
    // const Change = e => setFrormData({...formData, [e.target.name] : [e.target.value]})
    const { uid, token } = useParams();
    function SubmitResConfirm (dataval) {
        //e.preventDefault()

        // const uid = match.params.uid 
        // const token = match.params.token
        const uidval = uid
        const tokenval = token
        //console.log('dataval is:',dataval)
        //console.log(formData,'TOKEN:',token,'uid',uid, 'passowrd:', new_password, 'renew:', re_new_password)
        reset_passoword_confirm(uidval, tokenval, dataval.new_password, dataval.re_new_password)
        setrequestsent(true)
    }
    
    // isauthenticated ? redirect to home page
    if (requestsent) {
        console.log('your are authenticated in the login sect')

       return <Navigate to="/login" replace />;
    }

    
    
    
    return(
        <div className=" mb-5 w-full">
             
           <h1 className=" text-3xl mx-auto text-center font-semibold font-mono py-2"> Reset Your Password </h1>

            <form noValidate className="  md:mt-36 lg:mt-60 bg-transparent max-w-[800px] gap-4 min-h-fit shadow-lg shadow-red-700 flex flex-col  justify-around w-[90%] border-[1px] placeholder:text-center placeholder:font-semibold border-slate-900 p-3 rounded-sm  mx-auto align-middle" onSubmit={handleSubmit(SubmitResConfirm)}>
  

                <label className="input w-[90%] rounded-sm mx-auto max-w-[500px] input-bordered border-[1px] border-lime-600 bg-transparent flex items-center gap-2">
                    <FaUnlock className="h-4 w-4 text-red-500  opacity-100" />

                    <input {...register('new_password',{
                        required : 'Password is Required!',
                        minLength : {
                            value:5,
                            message :'Input more characters'
                        }
                    })} name="new_password"  id="password" className='outline-0  placeholder:text-slate-300 text-slate-100 bg-slate-100 bg-opacity-20 outline-none  mx-auto  border-none placeholder:text-left placeholder:font-bold  rounded-sm p-2 w-full'   placeholder="NEW PASSWORD" type="password" />
                </label>
               
                {errors.new_password && <p className=" my-2outline-1 min-w-fit w-[70%] my-2 max-w-[600px] bg-slate-900 text-red-500 font-semibold mx-auto text-center rounded-sm text-sm sm:text-base" >{errors.new_password?.message}</p>}
                <label className="input w-[90%] rounded-sm mx-auto max-w-[500px] input-bordered border-[1px] border-lime-600 bg-transparent flex items-center gap-2">
                    <FaUnlock className="h-4 w-4 text-red-500  opacity-100" />

                    <input {...register('re_new_password',{
                        required  :true,
                        validate: (val =   string) => {
                            if (watch('new_password') != val) {
                            return "Your passwords do no match";
                            }
                        },
                    })} name="re_new_password"   className='outline-0  placeholder:text-slate-300 text-slate-100 bg-slate-100 bg-opacity-20 outline-none  mx-auto  border-none placeholder:text-left placeholder:font-bold  rounded-sm p-2 w-full'   placeholder="CONFIRM NEW PASSWORD" type="password" />
                </label>
                 {errors.re_new_password && <p className=" my-2 max-w-[600px] min-w-fit w-[70%]  bg-slate-900 text-red-500 font-semibold mx-auto text-center rounded-sm text-sm sm:text-base" >{errors.re_new_password?.message}</p>}
                <button disabled={!isDirty || !isValid || isSubmitting || disableBtns} type="submit" className=" bg-transparent transition-all duration-500 disabled:cursor-not-allowed rounded-sm p-2 bg-blue-700 hover:border-blue-600 border-[1px] hover:shadow-slate-800 hover:shadow-md hover:bg-transparent min-w-[100px] font-bold disabled:border-gray-200 text-slate-200 w-fit mx-auto hover:text-blue-600 ">Reset Password</button>
            </form>

          

        </div>
    )


};

const mapStateToProps =  state => ({
    isAuthenticated:state.auth.isAuthenticated
})    


export default connect(mapStateToProps, {reset_passoword_confirm})(ResetPasswordConfirm);