import React, {  } from "react";
import '../App.css'
import { useForm } from "react-hook-form";
import { connect, useDispatch } from "react-redux";
import {useSelector} from 'react-redux'


// using argon2 pashing for both javascript and py
//const argon2 = require('argon2');
const SaveFilePage = ({}) => {
    
    return (
        <div className={` h-full w-full overflow-y-auto sticky  top-0 min-w-full max-w-[100%] flex flex-col justify-between  `} >
           
            <section className={`flex flex-col relative overflow-x-hidden overflow-y-visible w-full rounded-sm  md:mx-auto bg-transparent dark:text-slate-100 my-auto mt-20 h-fit`}>
                
               <p>file page upload</p>
            </section>
        </div>
    )
};

const mapStateToProps =  state => ({
    isAuthenticated:state.auth.isAuthenticated,
    
})    
export default connect(mapStateToProps,null)(SaveFilePage)
