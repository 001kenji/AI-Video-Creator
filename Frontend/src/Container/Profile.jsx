import React, { Profiler, useEffect, useLayoutEffect, useRef, useState } from "react";
import '../App.css'
import { BsUpload } from "react-icons/bs";
import { delete_user } from "../actions/auth";
import { connect, useDispatch } from "react-redux";
import {useSelector} from 'react-redux'
import { UpdateProfile,FetchUserProfile,UploadProfileFile } from "../actions/profile.jsx";
import Lottie,{useLottieInteractivity} from "lottie-react";  // from lottieflow
import { FaCamera } from "react-icons/fa6";
import { useForm } from "react-hook-form";
import { HiOutlineHome } from "react-icons/hi2";
import { IoLockOpenOutline } from "react-icons/io5";
import { MdOutlineAdd } from "react-icons/md";
import { TiTickOutline } from "react-icons/ti";
import Cookies from 'js-cookie'
import { MdOutlineModeEditOutline } from "react-icons/md";
import { IoIosAddCircleOutline } from "react-icons/io";
import {  toast } from 'react-toastify';
import { FaRegFolderOpen } from "react-icons/fa";
import { BsSearch } from "react-icons/bs";
import { FcOpenedFolder } from "react-icons/fc";
import { FcFolder } from "react-icons/fc";
import { FaFileUpload } from "react-icons/fa";
import { SlSizeActual } from "react-icons/sl";
import { GoEye } from "react-icons/go";
import { BsTrash3 } from "react-icons/bs";
import { MdOutlineFileDownload } from "react-icons/md";
import { FaFileLines } from "react-icons/fa6";
import { IoOpenOutline } from "react-icons/io5";
// lottieflow animated icons 
import EditIconLight from '../json/editIconlight.json'
import EditIcondark from '../json/editIcondark'
import CarouselTestImg from '../assets/images/lost.jpg'
import ProfileTestImg from '../assets/images/fallback.jpeg'

import { FAIL_EVENT, FolderListReducer, INTERCEPTER, LOADING_USER, SUCCESS_EVENT } from "../actions/types.jsx";
import { useNavigate, useParams } from "react-router-dom";

// using argon2 pashing for both javascript and py
//const argon2 = require('argon2');
const ProfileJSX = ({UpdateProfile,FetchUserProfile,UploadProfileFile,delete_user}) => {
    const date = new Date()
    const { extrainfo } = useParams();
    const {register,formState,reset,getValues,setValue,watch} = useForm({
        defaultValues : {
            'UserName': 'Gest',
            'filterYear' : '',
            'filterPrivacy' : '',
            'EditedfolderName' : '',
            'password' : ''
        },
        mode : 'all'
    })
    const dispatch = useDispatch()
    const {errors,isSubmitSuccessful,isDirty,isValid} = formState
    const db = useSelector((state) => state.auth.user)  
    const navigate = useNavigate();
    const ProfileDB = useSelector((state) => state.ProfileReducer.ProfileAbout)
    const [ReLoad,SetReLoad] = useState(false)
    const StoreProfileAccount = useSelector((state) => state.ProfileReducer.ProfileAccount)
    const [FolderList,SetFolderList] = useState(useSelector((state) => state.ProfileReducer.FolderList))
    const FileListReducerVal = useSelector((state) => state.ProfileReducer.FileList)
    const [FileList,SetFileList] = useState(useSelector((state) => state.ProfileReducer.FileList))
    const UserEmail  = db != null ? db.email : 'gestuser@gmail.com'
    const UserID  = db != null ? db.id : ''
    const UserName = db != null ? db.name : 'null'
    const [IsEditingProfile,SetIsEditingProfile] = useState(false)
    const [IsAddingFolder,SetIsAddingFolder] = useState(false)
    const [IsFiltering,SetIsFiltering] = useState(false)
    const Theme = useSelector((state)=> state.auth.Theme)
    const [folderName,SetfolderName] = useState('')
    const [folderNameFilter,SetfolderNameFilter] = useState('')
    const [fileNameFilter,SetfileNameFilter] = useState('')
    const [IsFilteringFolders,SetIsFilteringFolders] = useState(false)
    const [IsFilteringFiles,SetIsFilteringFiles] = useState(false)
    const [SelectedProfileNav,SetSelectedProfileNav] = useState('About')
    const [SelectedRepository,SetSelectedRepository] = useState('folder')
    const [AboutMeSelectedTab,SetAboutMeSelectedTab] = useState('Overview')
    const [AccountSelectedTab,SetAccountSelectedTab] = useState('Delete')
    const [EditUsernameAccount,SetEditUsernameAccount] = useState(false)
    const [EditFolderName,SetEditFolderName] = useState({
        'id' : '',
        'action' : false,
        'name' : ''
    })
    const [MediaGallary,SetMediaGallary] = useState({
        'type' : '',
        'src' : '',
        'show' : false,
    })
    const [DeleteAccount,SetDeleteAccount] = useState({
        'password' : '',
        'show' : false,
    })
    const [ActiveFolder,SetActiveFolder] = useState(null)
    const [ShowUploadFilePreview,SetShowUploadFilePreview] = useState(false)
    const [ProfileAccount,SetProfileAccount] = useState({
        'AccountEmail' : '',
        'AccountID' : '',
        'AccountName' : 'Gest',
        'IsOwner' : false,
        'CoverPhoto' : '',
        'ProfilePic' : ''
    })
    const [Upload,SetUpload] = useState({
        file : null,
        filename : '',
        size : '',
        type : ''
    })
    const [OverviewUpload,SetOverviewUpload] = useState({
        'file' : null,
        'src' : null,
        'Name' : null,
        'LoadingVideoList' : '',
        'Scope' : ''
    })
    const [ProfileAboutContainer,SetProfileAboutContainer] = useState({
        'GoogleAPICredentialFile' : null
    })
    const [ProfileCoverPhoto,SetProfileCoverPhoto] = useState(CarouselTestImg)
    const [ProfilePicturePhoto,SetProfilePicturePhoto] = useState(ProfileTestImg)
    const UploadProfilePicture = useRef(null)
    const FolderListContainer = useRef(null)
    const FileListContainer = useRef(null)
    const RepositoryUploadFile = useRef(null)
    const GoogleAPICredentialFile = useRef(null)
    const WsDataStream = useRef(null)
    // Ref hook for animated icons
    const EditIconRef = useRef()
    function ShowToast(type,message){
            if(type != null && message != null){
                toast(message,{
                    type : type,
                    theme : Theme,
                    position : 'top-right'
                })
            }
    } 
    function SaveGoogleAPICredentialFile (val) {
        if (val == 'save' ) {
            SetOverviewUpload((e) => {
                return {
                    ...e,
                    'LoadingVideoList' : true,
                    'Scope' : 'GoogleAPICredentialFile'
                }
            })
            const formData = new FormData();
            formData.append('file',OverviewUpload.file);
            formData.append('scope','GoogleAPICredentialFileUpload')
            formData.append('email',UserEmail)
            formData.append('name',OverviewUpload.Name)
            UploadProfileFile(formData)

        }else if (UserEmail == 'gestuser@gmail.com'){
            ShowToast('warning','Login to manage this account')
        }
    }
    
    useLayoutEffect(()=> {
        //console.log(UserID,extrainfo,UserEmail,ProfileAccount.AccountEmail)
        
            //console.log('fetching')
            if(UserID == extrainfo){
                
                var data = {
                    'scope' : 'ReadProfile',
                    'AccountEmail' : UserEmail,
                    'AccountID' : extrainfo,
                    'IsOwner' : true,
                }
                setValue('UserName',UserName)
               var IsOwner = db == null ? false : UserEmail == ProfileAccount.AccountEmail ? true :false
                SetProfileAccount((e) => {
                    return {
                        ...e,
                        'AccountName' : UserName,
                        'AccountEmail' : UserEmail,
                        'AccountID' : UserID,
                        'IsOwner' : true,
                        'followers' : 0,
                        'following' : 0
                    }
                })
                FetchUserProfile(JSON.stringify([data]))
                setValue('filterYear',date.getFullYear())
                requestWsStream('open')
                
            }else{
                var data = {
                    'scope' : 'ReadProfile',
                    'AccountEmail' : UserEmail,
                    'AccountID' : extrainfo,
                    'IsOwner' : false,
                    'UserID' : UserID
                }
               var IsOwner = db == null ? false : UserEmail == ProfileAccount.AccountEmail ? true :false
                var IsStore = Object.keys(StoreProfileAccount).length != 0 ? true : false
                SetProfileAccount((e) => {
                    return {
                        ...e,
                        'AccountName' : IsStore ? StoreProfileAccount.AccountName : ProfileAccount.AccountName,
                        'AccountEmail' : IsStore ? StoreProfileAccount.AccountEmail : ProfileAccount.AccountEmail,
                        'AccountID' : IsStore ? StoreProfileAccount.AccountID : ProfileAccount.AccountID,
                        'IsOwner' : false,
                        'followers' : 0,
                        'following' : 0
                    }
                })
                FetchUserProfile(JSON.stringify([data]))
                
                setValue('filterYear',date.getFullYear())
                requestWsStream('open')
                
                
            }
            setInterval(() => {
                //console.log('cheking')
                SetReLoad((e) => !e)
            }, 60000);    
        
    },[db,extrainfo])
    
    useEffect(() => {
        if(ProfileDB != null){
            
            var GoogleAPICredentialFileval = ProfileDB.GoogleAPICredentialFile ? `${import.meta.env.VITE_APP_API_URL}/media/${UserEmail}/${ProfileDB.GoogleAPICredentialFile}` : null
           
            SetProfileAboutContainer((e) => {
                return {
                    ...e,
                    'GoogleAPICredentialFile' : GoogleAPICredentialFileval
                }
            })
            if(ProfileDB.Scope){
                if(ProfileDB.Scope != null && ProfileDB.Scope == OverviewUpload.Scope){
                    ClearGoogleAPICredentialFileUpload()
                }
            }

        }
       
    },[ProfileDB,extrainfo])
    
    useEffect(() => {
        //console.log('called',StoreProfileAccount)
        if(Object.keys(StoreProfileAccount).length != 0 && StoreProfileAccount != null){
            setValue('UserName',StoreProfileAccount.AccountName)
            var IsOwner = StoreProfileAccount.IsOwner != null ? StoreProfileAccount.IsOwner == 'True' ? true : false : false
             var ProfilePicurlpath = StoreProfileAccount.ProfilePic != null  ? StoreProfileAccount.ProfilePic : ProfileAccount.ProfilePic
            SetProfileAccount((e) => {
                return{
                    ...e,
                    'AccountEmail':StoreProfileAccount.AccountEmail != null ? StoreProfileAccount.AccountEmail : ProfileAccount.AccountEmail,
                    'IsOwner' :  IsOwner,
                    'AccountName' : StoreProfileAccount.AccountName != null ? StoreProfileAccount.AccountName : ProfileAccount.AccountName,
                    'AccountID' : StoreProfileAccount.AccountID  != null ? StoreProfileAccount.AccountID : ProfileAccount.AccountID,
                    'CoverPhoto' : ProfilePicurlpath,
                    'ProfilePic' : ProfilePicurlpath,
                }
            })          
           
            var profilepicval = `http://127.0.0.1:8000/media/${ProfilePicurlpath}`
            SetProfileCoverPhoto(profilepicval)
            SetProfilePicturePhoto(profilepicval)          
           
        }
    },[StoreProfileAccount])

    function ProfileNavigatorFetch(props){
        if(props != null){
            if(SelectedProfileNav == 'Repository'){
                requestWsStream('RequestFolderData')
            }
            ClearPostFilter('claerFilter')
        }
    }
    useEffect(() => {
        ProfileNavigatorFetch('fetch')
    },[SelectedProfileNav])
    useEffect(() => {
        if(FileListReducerVal[0]){
            SetFileList(FileListReducerVal)
        }   
    },[FileListReducerVal])
    
    function ClickProfilePictureInputTag(props) {
        if(props) {
      
            // document.getElementById('CoverPhotoInput').click()
            UploadProfilePicture.current.click()
        }        
    }
  
    const ToogleProfilePictureUpload = (val) => {
       
        var File =  UploadProfilePicture.current.files[0] ?  UploadProfilePicture.current.files[0] : val
       
        if(File && UserEmail != 'gestuser@gmail.com') {
            var CoverPhotoDis = document.getElementById('CoverPhotoDis')     
            const render = new FileReader()
            render.onload = function (e) {
                //CoverPhotoDis.style.backgroundImage = e.target.result                
                SetProfilePicturePhoto(e.target.result)  
                SetProfileCoverPhoto(e.target.result)                  
                }            
            render.readAsDataURL(File)            
            const formData = new FormData();
            formData.append('ProfilePicture',File);
            var profilepicturename = `${UserName}${File.name}`
            formData.append('scope','ProfilePictureUpdate')
            formData.append('email',UserEmail)
            var previous_profile_picture = db.ProfilePic != null ? db.ProfilePic : null
            formData.append('previous_profile_picture',previous_profile_picture)
            formData.append('name',profilepicturename)
            UploadProfileFile(formData)
            UploadProfilePicture.current.value = ''
            
        }else if (UserEmail == 'gestuser@gmail.com'){
            toast('SignUp to manage account',{
                position : 'top-right',
                type : 'warning',
                theme : Theme
            })
        }

    }  
    
    const OpenImage = (src,type) => {
        if(src != null) {
            SetMediaGallary((e) => {
                return {
                    ...e,
                    'show' : true,
                    'src' : src,
                    'type' : type
                }
            })
        }
        
    }
    function SubmitUsername(val) {
        if(val && UserEmail != 'gestuser@gmail.com') {
            var data = {
                'scope' : 'UsernameUpdate',
                'Username': getValues('UserName')
            }
            SetProfileAccount((e) => {
                return {
                    ...e,
                    'AccountName' : getValues('UserName')
                }
            })
            SetEditUsernameAccount(false)
           UpdateProfile(JSON.stringify([data,UserEmail]))
        }else if (UserEmail == 'gestuser@gmail.com'){
            toast('SignUp to manage account',{
                position : 'top-right',
                type : 'warning',
                theme : Theme
            })
        }
    }    
    
    // websocket for recieving data like posts
    const requestWsStream = (msg = null,body = null,continuetion = false,continuetionId = null) => {    
       
        if(msg =='open'){
            
            if(WsDataStream.current != null ){
                WsDataStream.current.close(1000,'Opening another socket for less ws jam')

            }
            WsDataStream.current =  new WebSocket(`ws:/${import.meta.env.VITE_WS_API}/ws/chatList/${UserEmail}/`);

        }
        
        WsDataStream.current.onmessage = function (e) {
          var data = JSON.parse(e.data)
            if(data.type == 'RequestFolderData') {
                var val = data.message
                if (val['type'] == 'success') {
                    SetFolderList(val['list'])
                    dispatch({
                        type : FolderListReducer,
                        payload : val['list']
                    })
                }else {
                    toast(val['result'], {
                        type: val['type'],
                        theme: Theme,
                        position: 'top-right',
                    })
                }
                
            }else if(data.type == 'RequestEditfolderName') {
                var val = data.message
                if (val['type'] == 'success') {
                    SetFolderList(val['list'])
                    dispatch({
                        type : FolderListReducer,
                        payload : val['list']
                    })
                    toast(val['result'], {
                        type: val['type'],
                        theme: Theme,
                        position: 'top-right',
                    })
                }else {
                    toast(val['result'], {
                        type: val['type'],
                        theme: Theme,
                        position: 'top-right',
                    })
                }
                
            }else if(data.type == 'RequestAddFolder') {
                var val = data.message
                if (val['type'] == 'success') {
                    SetfolderName('')
                    SetFolderList(val['list'])
                    dispatch({
                        type : FolderListReducer,
                        payload : val['list']
                    })
                    toast(val['result'], {
                        type: val['type'],
                        theme: Theme,
                        position: 'top-right',
                    })
                }else {
                    SetfolderName('')
                    toast(val['result'], {
                        type: val['type'],
                        theme: Theme,
                        position: 'top-right',
                    })
                }
                
            }else if(data.type == 'RequestFolderFiles') {
                var val = data.message
                if (val['type'] == 'success') {
                    SetFileList(val['list'])
                    SetSelectedRepository('file')
                }else {
                    toast(val['result'], {
                        type: val['type'],
                        theme: Theme,
                        position: 'top-right',
                    })
                }
                
            }else if(data.type == 'RequestDeleteRepositoryFile') {
                var val = data.message
                if (val['type'] == 'success') {
                    SetFileList(val['list'])
                    SetSelectedRepository('file')
                    toast(val['result'], {
                        type: val['type'],
                        theme: Theme,
                        position: 'top-right',
                    })
                }else {
                    toast(val['result'], {
                        type: val['type'],
                        theme: Theme,
                        position: 'top-right',
                    })
                }
                
            }else if(data.type == 'RequestDeleteFolder') {
                var val = data.message
                if (val['type'] == 'success') {
                    SetFolderList(val['list'])
                    dispatch({
                        type : FolderListReducer,
                        payload : val['list']
                    })
                    toast(val['result'], {
                        type: val['type'],
                        theme: Theme,
                        position: 'top-right',
                    })
                }else {
                    toast(val['result'], {
                        type: val['type'],
                        theme: Theme,
                        position: 'top-right',
                    })
                }
                
            }
        };
        WsDataStream.current.onopen = (e) => {
            // websocket is opened
        }
        // var Log = document.getElementById(`CommentContainer-${14}`)
        // console.log(Log.childNodes)
        WsDataStream.current.onclose = function (e) {
          //console.log('closing due to :',e)
        //   toast('Connection Closed', {
        //       type: 'error',
        //       theme: Theme,
        //       position: 'top-right',
        //   })
          
        }
        if(WsDataStream.current.readyState === WsDataStream.current.OPEN){
            if(msg == 'RequestFolderData') {
                WsDataStream.current.send(
                    JSON.stringify({
                        'message' : 'RequestFolderData',
                        'AccountEmail' : UserEmail
                    })
                )
            }else if(msg == 'RequestAddFolder') {
                WsDataStream.current.send(
                    JSON.stringify({
                        'message' : 'RequestAddFolder',
                        'AccountEmail' : UserEmail,
                        'folderName' : folderName
                    })
                )
            }else if(msg == 'RequestEditfolderName') {
                WsDataStream.current.send(
                    JSON.stringify({
                        'message' : 'RequestEditfolderName',
                        'data' : body,
                    })
                )
            }else if(msg == 'RequestFolderFiles') {
                WsDataStream.current.send(
                    JSON.stringify({
                        'message' : 'RequestFolderFiles',
                        'AccountEmail' : UserEmail,
                        'folderId' : body
                    })
                )
            }else if(msg == 'RequestDeleteFolder') {
                WsDataStream.current.send(
                    JSON.stringify({
                        'message' : 'RequestDeleteFolder',
                        'AccountEmail' : UserEmail,
                        'folderId' : body
                    })
                )
            }else if (msg == 'RequestDeleteRepositoryFile'){
                WsDataStream.current.send(
                    JSON.stringify({
                        'message' : 'RequestDeleteRepositoryFile',
                        'data' : body
                    })
                )
            }
            
        }
        
    }    
   
    function RequestFolderFilesFunc (props) {
        if(props != null) {
            SetFileList([])
            SetActiveFolder(props)

            requestWsStream('RequestFolderFiles',props)
        }
    }
    function RequestDeleteFolderFunc (props) {
        if(props != null) {
            SetFileList([])

            requestWsStream('RequestDeleteFolder',props)
        }
    }
    function RequestDeleteRepositoryFileFunc (fileId,filename) {
        if(fileId != null && filename != '' && UserEmail != 'gestuser@gmail.com'){
            var data = {
                'AccountEmail' : UserEmail,
                'fileId' : fileId,
                'filename' : filename,
                'FolderId' : ActiveFolder
            }
            toast('Deleting, please wait',{
                position : 'top-right',
                theme: Theme,
                type : 'info'
            })
            //console.log('RequestDeleteRepositoryFile',data)
            requestWsStream('RequestDeleteRepositoryFile',data)
        }else if (UserEmail == 'gestuser@gmail.com'){
            toast('SignUp to manage account',{
                position : 'top-right',
                type : 'warning',
                theme : Theme
            })
        }
    }
    const ToogleEditFolderName = (propsval,idval,name = null) => {
        if(propsval == 'cancel') {
            SetEditFolderName({
                'action' : false,
                'id' : '',
                'name' : ''
            })
        }else if(propsval == 'submit' && UserEmail != 'gestuser@gmail.com'){
            var data = {
                'name' : EditFolderName.name,
                'folderId' : EditFolderName.id,
                'AccountEmail' : UserEmail
            }
            toast('Editing, please wait', {
                type: 'info',
                theme: Theme,
                position: 'top-right'
            })
            requestWsStream('RequestEditfolderName',data)
            SetEditFolderName({
                'action' : false,
                'id' : '',
                'name' : ''
            })
        }else if(propsval == 'open' && UserEmail != 'gestuser@gmail.com'){
            SetEditFolderName({
                'action' : true,
                'id' : idval,
                'name' : name
            })
        }else if (UserEmail == 'gestuser@gmail.com'){
            toast('SignUp to manage account',{
                position : 'top-right',
                type : 'warning',
                theme : Theme
            })
        }
    }
    const EditfolderNameChange = (event) => {
        const {value} = event.target 
        SetEditFolderName((e) => {
            return {
                ...e,
                'name' : value
            }
        })
    }
   
    function OpenUserProfile (useridval) {
        if(useridval != null){
            navigate(`/home/profile/${useridval}`)
            SetSelectedProfileNav('About')           
        }
    }
    
    const MapFolderList = FolderList.map((items,i) => {
        var titleval = String(items.title).toLocaleLowerCase()
        var filterval = String(folderNameFilter).toLocaleLowerCase()
        var IsMatch = String(titleval).match(filterval)
        var Show =  IsMatch ? true : false
        return (
            <div key={i}  className={`  ${ IsFilteringFolders == true && Show == true ?'flex flex-col ' : IsFilteringFolders == false ? 'flex flex-col' : 'hidden'} text-center group w-[90%] hover:shadow-lg transition-all duration-300 hover:shadow-yellow-300 mx-auto bg-slate-300 bg-opacity-40 dark:bg-slate-600 min-h-[150px] xs:min-h-[200px] max-w-[200px] xs:max-w-[300px] border-[1px] border-slate-300 cursor-pointer dark:border-slate-600 justify-around rounded-md p-2 `} >
                <div className=" flex flex-row justify-around gap-4 w-full" >
                    <button onClick={() => ToogleEditFolderName('open',items.id,items.title)}  data-tip="Edit folder name"  className={` tooltip tooltip-right mr-auto w-fit text-right h-fit bg-transparent `} >
                        <MdOutlineModeEditOutline  className=" my-auto  text-lg dark:text-slate-200 hover:text-purple-500 dark:hover:text-sky-500  transition-all duration-300 "  role="button" />
                    </button> 
                    <button onClick={() => RequestFolderFilesFunc(items.id)}  data-tip="Open folder"  className={` tooltip tooltip-left w-fit text-right h-fit bg-transparent `} >
                        <IoOpenOutline    className=" my-auto text-lg dark:text-slate-200 hover:text-purple-500 dark:hover:text-sky-500  transition-all duration-300 "  role="button" />
                    </button> 
                    <button onClick={() => RequestDeleteFolderFunc(items.id)}  data-tip="Delete folder"  className={` tooltip tooltip-left w-fit text-right h-fit bg-transparent `} >
                        <BsTrash3   className=" my-auto text-lg text-rose-600 dark:text-rose-500 hover:text-pink-500 dark:hover:text-pink-500  transition-all duration-300 "  role="button" />
                    </button> 
                </div> 
                <label className="swap group-hover:swap-active swap-off ">
                    {/* this hidden checkbox controls the state */}
                    <input className=" hidden" type="checkbox" />
                    <FcOpenedFolder className="swap-on h-24 w-24 fill-current" />
                    <FcFolder className="swap-off h-24 w-24 fill-current" />
                </label>
                <div className=" w-full flex flex-row flex-wrap xs:flex-row justify-around" >
                    <big className= {` ${EditFolderName.action == false || EditFolderName.id != items.id ? 'flex' : 'hidden'} w-fit font-semibold text-xl xs:text-2xl mx-auto `} >{items.title}</big>
                    <input value={EditFolderName.name} onChange={EditfolderNameChange}  className= {` ${EditFolderName.action == true && EditFolderName.id == items.id ? 'flex' : 'hidden'} text-xl xs:text-2xl ml-0 bg-transparent border-none rounded-sm text-ellipsis w-[100%] xs:max-w-[70%] `} placeholder="Username" type="text" />
                    <MdOutlineAdd onClick={() => ToogleEditFolderName('cancel')}    title="Cancel changes" className={`tooltip ${EditFolderName.action == true && EditFolderName.id == items.id ? 'flex' : 'hidden'} rotate-45 cursor-pointer sm:text-lg my-auto mx-auto xs:mx-0 text-slate-600  dark:text-slate-400 hover:text-slate-950 dark:hover:text-slate-200 z-30 transition-all duration-30  lg:text-2xl `} />
                    <TiTickOutline onClick={() => ToogleEditFolderName('submit')}    title="Submit changes" className={`tooltip ${EditFolderName.action == true && EditFolderName.id == items.id ? 'flex' : 'hidden'} cursor-pointer sm:text-lg my-auto mx-auto xs:mx-0 text-slate-600  dark:text-slate-400 hover:text-slate-950 dark:hover:text-slate-200 z-30 transition-all duration-30  lg:text-2xl `} />
                </div>

                <time className=" mt-auto text-sm md:text-base" >{items.dateCreated}</time>
            </div>
        )
    })

    const MapFileList = FileList.map((items,i) => {
        var titleval = String(items.name).toLocaleLowerCase()
        var filterval = String(fileNameFilter).toLocaleLowerCase()
        var IsMatch = String(titleval).match(filterval)
        var Show =  IsMatch ? true : false
        //console.log(items)
        return (
            <tr key={i} className= {` ${ IsFilteringFiles == true && Show == true ?'' : IsFilteringFiles == false ? '' : 'hidden'} bg-slate-300 border-b text-sm md:text-base text-gray-900 dark:bg-slate-700 *:dark:text-slate-100 border-gray-600 dark:border-gray-500 `}>
                <th scope="row" className="px-2 py-4 font-medium inline-flex gap-2 whitespace-nowrap ">
                <FaFileLines className="text-base text-blue-600 dark:text-blue-500 my-auto transition-all duration-300 "  />
                    <input readOnly className=" outline-none border-none input-disabled bg-transparent w-fit min-w-fit cursor-default text-inherit text-ellipsis my-auto" value={items.name} type="text" />
                </th>
                <td className="px-1 py-4">
                    {items.dateCreated}
                </td>
                <td className="px-1 py-4">
                    {items.size}
                </td>
                <td className="px-1 flex flex-row  gap-3 my-auto py-4 justify-start align-middle h-fit">
                    <button data-tip="View file"  className={` ${items.type == 'image' ? 'flex' : 'hidden'} tooltip tooltip-left w-fit h-fit bg-transparent `} >
                        <a target="_blank" href={`${import.meta.env.VITE_APP_API_URL}/media${items.fileUrl}`}>
                          <GoEye  className=" m-auto text-lg text-blue-600 dark:text-blue-500 hover:text-purple-500 dark:hover:text-purple-500 transition-all duration-300 "  role="button" />
                        </a>
                    </button>
                    <button onClick={() => DownloadRepositoryFile(items.fileUrl)} data-tip="Download file"  className={` tooltip tooltip-left w-fit h-fit bg-transparent `} >
                            <MdOutlineFileDownload   className=" m-auto text-lg text-blue-600 dark:text-blue-500 hover:text-purple-500 dark:hover:text-purple-500  transition-all duration-300 "  role="button" />
                    </button>

                    <button onClick={() => RequestDeleteRepositoryFileFunc(items.id,items.name)} data-tip="Delete file"  className={` tooltip tooltip-left w-fit h-fit bg-transparent `} >
                        <BsTrash3   className=" m-auto text-lg text-rose-600 dark:text-rose-500 hover:text-pink-500 dark:hover:text-pink-500  transition-all duration-300 "  role="button" />
                    </button>                    
                </td>
            </tr>
        )
    })
    const downloadFile = async (fileUrl) => {
        if(fileUrl != null){
            `${import.meta.env.VITE_APP_API_URL}/media/${UserEmail}/${ProfileDB.GoogleAPICredentialFile}`
            const response = await fetch(fileUrl, {
                method: 'GET',
                headers: {
                  "x-CSRFToken": `${Cookies.get('Inject')}`,
                  "Cookie": `Inject=${Cookies.get('Inject')}`
                  // Add any headers if required, e.g., Authorization
                },
              });
            
              if (!response.ok) {
                  ShowToast('warning','Seams like there was a problem when downloading. Try again later')
                  throw new Error('Network response was not ok');
              }
            
              const blob = await response.blob();
              const url = window.URL.createObjectURL(blob);
              
              const a = document.createElement('a');
              a.href = url;
              a.download = fileUrl.split('/').pop(); // Extract the file name from the URL
              document.body.appendChild(a);
              a.click();
              a.remove();
              window.URL.revokeObjectURL(url); // Clean up the URL object
              
              ShowToast('warning','Successfully Downloaded')
        }else {
            ShowToast('warning','No file found')
        }
        
    };
      
    function DownloadRepositoryFile (fileUrl) {
        var link = `${import.meta.env.VITE_APP_API_URL}/media${fileUrl}`;
        downloadFile(link)
        
    }
   
    function ClearPostFilter(props) {
        if (props) {
            setValue('filterPrivacy','all')
            setValue('filterYear',date.getFullYear())
            SetIsFiltering(false)
        }
    }   
   
    const folderNameChange = (event) => {
        const {value} = event.target 
        SetfolderName(value)
    }
    
    const FolderFilterChange = (event) => {
        const {value} = event.target 
        SetfolderNameFilter(value)
        SetfileNameFilter(value)
        if(value == ''){
            SetIsFilteringFolders(false)
            SetIsFilteringFiles(false)
        }else{
            SetIsFilteringFolders(true)
            SetIsFilteringFiles(true)
        }
    }
    function CreateFolderFunc (propsval) {
        if(propsval && UserEmail != 'gestuser@gmail.com') {
            SetIsAddingFolder(false)
            requestWsStream('RequestAddFolder')
        }else if (propsval && UserEmail == 'gestuser@gmail.com'){
            toast('SignUp to manage account',{
                position : 'top-right',
                type : 'warning',
                theme : Theme
            })
        }
    }
    function ClickUploadRepository (props) {
        if(props){
            RepositoryUploadFile.current.click()
        }
    }
    const formatFileSize = (size) => {
        const units = ["bytes", "KB", "MB", "GB", "TB"];
        let unitIndex = 0;
      
        while (size >= 1024 && unitIndex < units.length - 1) {
          size /= 1024;
          unitIndex++;
        }
      
        return `${size.toFixed(2)} ${units[unitIndex]}`;
    };
      
    const ToogleRepositoryUpload = (props) => {
        var File =  RepositoryUploadFile.current.files[0] ?  RepositoryUploadFile.current.files[0] : props
        if(File ){
            const maxSize = 50 * 1024 * 1024; // 50MB in bytes for file size limit
            var Types = String(File.type).split('/')
            if (File.size > maxSize) {
                toast('File to large, upload file up to 50mb ',{
                    position : 'top-right',
                    theme: Theme,
                    type : 'warning'
                })
                RepositoryUploadFile.current.value = ''
                SetShowUploadFilePreview(false)
              return
            }else {
                const render = new FileReader()
                var sizeval = formatFileSize(File.size)
                render.onload = function (e) {
                        SetUpload({
                            filename : File.name,
                            file : File,
                            size : sizeval,
                            type : Types[0]
                        })
                    }                        
                render.readAsDataURL(File) 
                SetShowUploadFilePreview(true)
            }
              

                       
        }       
    }
    function UploadRepositoryFile (propsval){
        if (propsval && Upload.file != null && UserEmail != 'gestuser@gmail.com') {    
            const formData = new FormData();
            formData.append('file',Upload.file);
            formData.append('scope','UploadRepositoryFile')
            formData.append('email',UserEmail)
            formData.append('size',Upload.size)
            formData.append('name',Upload.filename)
            formData.append('folderId',ActiveFolder)
            formData.append('fileType',Upload.type)
            toast('Uploading, please wait',{
                position : 'top-right',
                theme: Theme,
                type : 'info'
            })
            dispatch({type : INTERCEPTER})
            UploadProfileFile(formData)
            SetShowUploadFilePreview(false)
        }else if (UserEmail == 'gestuser@gmail.com'){
            toast('SignUp to manage account',{
                position : 'top-right',
                type : 'warning',
                theme : Theme
            })
        }
    }
    function RepositoryNavigator (propsval) {
        if(propsval == 'folder'){
            SetSelectedRepository('folder')
            SetFileList([])
        }
    }
    const HandleCoverPhotoError = (event) => {
        SetProfileCoverPhoto(`${import.meta.env.VITE_WS_API}/media/media unavailable ${Theme}.jpg`)
    }
    const HandleProfilePhotoError = (event) => {
        SetProfilePicturePhoto(`${import.meta.env.VITE_WS_API}/media/media unavailable ${Theme}.jpg`)
    }
    function ToongleSelectedProfileNav(props) {
        if(props != null) {
            SetSelectedProfileNav(props)
           
           
        }
    }
    function CloseMediaGallary (props) {
        if(props != null){
            SetMediaGallary((e) => {
                return {
                    'src' : '',
                    'show' : false,
                    'type' : ''
                }
            })
        }
    }
    function ToongleAccountManager (propsval) {
        if(propsval == 'show'){
            SetDeleteAccount((e) => {
                return {
                    ...e,
                    'show' : true
                }
            })
            setValue('password','')
        }else if(propsval == 'hide'){
            SetDeleteAccount((e) => {
                return {
                    ...e,
                    'show' : false
                }
            })
            setValue('password','')
        }else if(propsval == 'delete'){
            var pass = getValues('password')
            delete_user(UserEmail,pass)
            setValue('password','')
        }
    }
    const ToongleGoogleAPICredentialFileUpload = (val) => {
       
        var File =  GoogleAPICredentialFile.current.files[0] ?  GoogleAPICredentialFile.current.files[0] : val
        
        if(File) {
            var Types = String(File.type).split('/')
            //console.log(Types)
            if(Types[1] == 'json'){
                const render = new FileReader()
                render.onload = function (e) {
                    SetOverviewUpload((val) => {
                        return {
                            ...val,
                            'file' : File,
                            'src' : e.target.result,
                            'Name' : File.name,
                            'Scope' : 'GoogleAPICredentialFile'
                        }
                    })               
                                        
                }
                render.readAsDataURL(File) 
                SetIsEditingProfile(true)
                GoogleAPICredentialFile.current.value == ''
            }                   
        }

    }  
    function ClickGoogleAPICredentialFileUpload (props) {
        if(props){
            GoogleAPICredentialFile.current.click()
        }
    }
    function ClearGoogleAPICredentialFileUpload () {
            SetOverviewUpload((e) => {
                return {
                    ...e,
                    'file' : null,
                    'src' : null,
                    'Name' : null,
                    'Scope' : '',
                    'LoadingVideoList' : false
                }
            })
            GoogleAPICredentialFile.current.value = ''
    }

    return (
        <div className={` h-full w-full min-w-full relative max-w-[100%] flex flex-col justify-start `} >
            {/* cover container */}
            <div   id="CoverPhotoDis" className=" avatar flex bg-slate-800 w-full md:w-[98%] md:mt-3 md:mx-auto md:rounded-lg h-[200px] min-h-[200px] sm:h-[300px] sm:min-h-[300px] lg:h-[300px] lg:min-h-[300px] bg-cover bg-no-repeat lg:bg-center bg-center" >
                <div onClick={() =>OpenImage(ProfileCoverPhoto,'image')} className="w-full cursor-pointer md:rounded-lg h-full absolute">
                    <img loading="lazy" src={ProfileCoverPhoto} onError={HandleCoverPhotoError} />
                </div>
               
            </div>
            {/*media galary displayer */}
            <div className={` ${MediaGallary.show ? 'absolute flex flex-row' : 'hidden'}  z-40 w-full h-full dark:bg-slate-800/30 bg-slate-300/30 `} >
                <div className={` flex flex-col px-2 py-4 w-fit max-w-[95%] justify-start mx-auto mt-10 dark:bg-slate-800 bg-slate-300 bg-opacity-70 border-slate-500 dark:border-slate-500 border-[1px] dark:bg-opacity-70 h-fit max-h-[80vh]  sm:w-[90%] lg:max-w-[600px] rounded-md pt-2  `} >
                    <button onClick={() => CloseMediaGallary('close')} data-tip='close' className=" tooltip tooltip-bottom my-auto ml-auto mr-2 mt-1 w-fit " >
                        <MdOutlineAdd className={`rotate-45 cursor-pointer text-lg xs:text-2xl  text-slate-600  dark:text-slate-400 hover:text-slate-950 dark:hover:text-slate-200 z-30 transition-all duration-30  lg:text-2xl `} />
                    </button>
                    {/* container for image */}
                    <div className={` ${MediaGallary.type == 'image' ? '' : 'hidden'} m-auto w-full min-w-full h-full min-h-full `} >
                        <img loading="lazy"
                            className= {` ${MediaGallary.type == 'image' ? ' h-fit m-auto max-h-[500px]  mask-square rounded-b-md ' : ' hidden'} `}
                            src={MediaGallary.src} 
                        />
                    </div>
                    {/* container for video */}
                    <div className={` ${MediaGallary.type == 'video' ? '' : 'hidden'} m-auto w-full min-w-full h-fit`} >
                        <video 
                            loading="lazy" 
                            preload="auto" 
                            controlsList="nodownload" data-no-fullscreen="true" 
                            src={MediaGallary.src} 
                            className={` ${MediaGallary.type == 'video' ? 'flex' : 'hidden'} w-full m-auto h-fit p-0 border-none rounded-b-md min-h-[400px] `} width="320" height="240" type="video/*" controls>
                                Your browser does not support the video tag.
                        </video>
                    </div>
                    
                </div>
            </div>

            {/* username, profile picture,followers,following container */}
            <div className="z-30 bg-transparent dark:text-slate-50 lg:pt-2 lg:pl-4 align-middle text-slate-950 transition-all duration-300 w-full -translate-y-16 lg:translate-y-0 lg:flex-row h-fit flex flex-col gap-0 " >
                <img loading="lazy" onClick={() =>OpenImage(ProfilePicturePhoto,'image')}               
                    className="mask mask-decagon overflow-hidden cursor-pointer mx-auto lg:ml-0 mt-auto h-32 xs:h-36"
                    src={ProfilePicturePhoto} 
                    onError={HandleProfilePhotoError}
                />   
                <input ref={UploadProfilePicture} onChange={ToogleProfilePictureUpload} className=" hidden" accept="image/*" type="file" />
                <FaCamera onClick={()=> ClickProfilePictureInputTag('click')} data-tip="Change profile picture" className={` ${ProfileAccount.IsOwner ? ' ' : 'hidden'} tooltip cursor-pointer text-slate-600 mx-auto dark:text-slate-400 hover:text-slate-950 dark:hover:text-slate-200 z-30 transition-all duration-30 lg:translate-y-32 lg:-translate-x-12 lg:text-2xl -translate-y-4 translate-x-10 `} title="Change cover photo" />

                <div className=" flex flex-col w-full gap-4 -translate-y-3 lg:translate-y-0 transition-all duration-300 lg:ml-2  lg:my-auto" >
                    <div className=" w-full h-fit min-w-full flex flex-row lg:ml-0 lg:justify-start  gap-4 justify-center" >
                        <big className= {` ${!EditUsernameAccount ? 'flex' : 'hidden'} font-semibold text-2xl lg:text-4xl ml-4 my-auto lg:ml-0 pt-2 w-fit xs:text-3xl `} >{ProfileAccount.AccountName}</big>
                        <input {...register('UserName',{required : false})}  className= {` ${EditUsernameAccount ? 'flex' : 'hidden'} text-2xl lg:text-4xl ml-4 lg:ml-0 bg-transparent border-none rounded-sm text-ellipsis w-[200px] xs:text-3xl `} placeholder="Username" type="text" />
                        {/* <MdEdit onChange={OnChangeUsername} onClick={() => SetEditUsernameAccount(true)}   title="Edit username" className={`tooltip ${!EditUsernameAccount ? 'hidden' : 'hidden'} cursor-pointer mt-auto sm:text-lg text-slate-600  dark:text-slate-400 hover:text-slate-950 dark:hover:text-slate-200 z-30 transition-all duration-30  lg:text-2xl `} /> */}
                        <Lottie onClick={() => SetEditUsernameAccount(true)}  lottieRef={EditIconRef} onMouseEnter={() => EditIconRef.current.play()}   onMouseLeave={() => EditIconRef.current.stop()} className={` tooltip ${!EditUsernameAccount && ProfileAccount.IsOwner ? 'flex' : 'hidden'} h-14 cursor-pointer transition-all bg-transparent  duration-300  `}  animationData={Theme == 'light' ?EditIconLight : EditIcondark} loop={false} />
                        
                        <MdOutlineAdd  onClick={() => SetEditUsernameAccount(false)}   title="Cancel changes" className={`tooltip ${EditUsernameAccount ? 'flex' : 'hidden'} rotate-45 cursor-pointer sm:text-lg mt-auto text-slate-600  dark:text-slate-400 hover:text-slate-950 dark:hover:text-slate-200 z-30 transition-all duration-30  lg:text-2xl `} />
                        <TiTickOutline onClick={() => SubmitUsername('submit')}   title="Submit changes" className={`tooltip ${EditUsernameAccount ? 'flex' : 'hidden'} cursor-pointer sm:text-lg mt-auto text-slate-600  dark:text-slate-400 hover:text-slate-950 dark:hover:text-slate-200 z-30 transition-all duration-30  lg:text-2xl `} />
                    </div>
                   
                    <div className=" flex lg:text-lg flex-col sm:flex-row lg:flex-col xl:flex-row justify-start sm:justify-around lg:max-w-[90%] md:mx-auto lg:ml-0 flex-wrap w-full h-fit" >
                        
                        <div className={` ${ProfileAccount.IsOwner ? 'flex' : 'hidden'}   text-sm py-4 sm:py-0 lg:ml-auto xl:mx-auto  xs:text-base w-full sm:w-[40%]  md:gap-4 justify-around flex-row `}   >
                            <button onClick={()=> SetIsEditingProfile(true)} data-tip="Edit Profile"    className={`  ${IsEditingProfile ? 'hidden' : 'flex '} tooltip    rounded-sm py-2 px-4 text-sm font-[PoppinsN] text-slate-950 border-[1px] hover:text-slate-50 dark:hover:text-slate-50 cursor-pointer z-30 bg-transparent bg-opacity-35 hover:bg-sky-700 transition-all duration-500 dark:text-slate-300 my-auto  border-sky-500 `}>Edit Profile</button>
                            <button onClick={()=> SetIsEditingProfile(false)} data-tip="Edit Profile"   className={`  ${IsEditingProfile ? 'flex ' : 'hidden'} tooltip    rounded-sm py-2 px-4 text-sm font-[PoppinsN] text-slate-950 border-[1px] hover:text-slate-50 dark:hover:text-slate-50 cursor-pointer z-30 bg-transparent bg-opacity-35 hover:bg-sky-700 transition-all duration-500 dark:text-slate-300 my-auto  border-sky-500 `}>View Profile</button>

                            {/* <button data-tip="button" className=" tooltip    rounded-sm py-2 px-4 text-sm font-[PoppinsN] text-slate-950 border-[1px] hover:text-slate-50 dark:hover:text-slate-50 cursor-pointer z-30 bg-transparent bg-opacity-35 hover:bg-sky-700 transition-all duration-500 dark:text-slate-300 my-auto  border-sky-500"  >Button</button> */}
                        </div>
                        <div className={` ${!ProfileAccount.IsOwner && db != null ? 'flex' : 'hidden'}   text-sm py-4 sm:py-0 lg:ml-auto xl:mx-auto  xs:text-base w-full sm:w-[40%]  md:gap-4 justify-around flex-row `}   >
                            <button onClick={() => OpenUserProfile(UserID)} data-tip='Home' className={`my-auto tooltip tooltip-top text-slate-600 hover:text-slate-900 dark:hover:text-slate-100 transition-all font-semibold dark:text-slate-400 `} ><HiOutlineHome className=" text-xl cursor-pointer " /></button>
                            {/* <button data-tip="button" className=" tooltip    rounded-sm py-2 px-4 text-sm font-[PoppinsN] text-slate-950 border-[1px] hover:text-slate-50 dark:hover:text-slate-50 cursor-pointer z-30 bg-transparent bg-opacity-35 hover:bg-sky-700 transition-all duration-500 dark:text-slate-300 my-auto  border-sky-500"  >Button</button> */}
                        </div>
                        
                    </div>
                    <hr className=" h-[1px] bg-slate-400 lg:hidden dark:bg-slate-700 border-none w-[95%] mx-auto " />
                </div>
            </div>

            {/* nav bar container */}
            <div className="z-30 w-[90%] mx-auto h-fit min-h-fit -translate-y-10 gap-4 lg:mt-4 lg:translate-y-0 transition-all duration-300 overflow-auto flex flex-row px-4 py-1 bg-transparent " >
                <button onClick={() => ToongleSelectedProfileNav('About')} className={` ${SelectedProfileNav == 'About' ? 'text-sky-400 dark:text-sky-500 bg-slate-700 ring-[2px] dark:bg-opacity-40' : 'dark:text-slate-100 text-slate-100'}  hover:text-lime-400 dark:hover:text-lime-400 dark:hover:ring-slate-600 transition-all duration-300 hover:ring-[2px] hover:ring-slate-600 font-sans font-semibold bg-slate-500 py-2 px-4 rounded-sm`} >About</button>
                <button onClick={() => ToongleSelectedProfileNav('Repository')} className={`${SelectedProfileNav == 'Repository' ? 'text-sky-400 dark:text-sky-500 ring-[2px] bg-slate-700 dark:bg-opacity-40' : 'dark:text-slate-300 text-slate-100'} ${ProfileAccount.IsOwner ? '' : 'hidden'}  hover:text-lime-400 dark:hover:text-lime-400 dark:hover:ring-slate-600 transition-all duration-300 hover:ring-[2px] hover:ring-slate-600 font-sans font-semibold bg-slate-500 py-2 px-4 rounded-sm `} >Repository</button>
                <button onClick={() => ToongleSelectedProfileNav('Account')} className={`${SelectedProfileNav == 'Account' ? 'text-sky-400 dark:text-sky-500 ring-[2px] bg-slate-700 dark:bg-opacity-40' : 'dark:text-slate-300 text-slate-100'} ${ProfileAccount.IsOwner ? '' : 'hidden'}  hover:text-lime-400 dark:hover:text-lime-400 dark:hover:ring-slate-600 transition-all duration-300 hover:ring-[2px] hover:ring-slate-600 font-sans font-semibold bg-slate-500 py-2 px-4 rounded-sm `} >Account</button>
            
            </div>

            {/* about section */}
            <div className=  {`z-30 pb-[150px] ${SelectedProfileNav == 'About' ?  'flex flex-col lg:flex-row' : 'hidden'}  md:mt-4 gap-2 h-full justify-start overflow-y-auto max-h-[90vh] bg-slate-400 dark:bg-slate-500 w-full px-2 `} >
                {/* selection tab */}
                <div className=" w-full flex flex-col border-b-[1px] lg:border-none lg:max-w-[400px] border-b-slate-600 gap-2 justify-start p-2" >
                    <button onClick={() => SetAboutMeSelectedTab('Overview')} className= {` ${AboutMeSelectedTab == 'Overview' ? ' text-sky-400 dark:text-slate-200 dark:bg-opacity-60 bg-slate-700  ' : 'bg-slate-600 dark:bg-slate-800 dark:text-slate-400 text-slate-950'} w-full text-left  rounded-md transition-all hover:text-slate-200 duration-300  p-2 font-semibold hover:bg-slate-700 `} >Overview</button>
                </div>
                {/* selected overview tab info EDITING */}
                <div className={`${AboutMeSelectedTab == 'Overview' && IsEditingProfile ? 'flex flex-col gap-2' : ' hidden'} text-slate-950  dark:text-slate-100 w-full h-fit p-2 `} >
                    <p className=" text-sm py-1 text-slate-800 dark:text-slate-200 " >Upload Google API Credentials file</p>
                    <div className="flex flex-col justify-start gap-3 w-full h-fit" >
                        <input onChange={ToongleGoogleAPICredentialFileUpload} ref={GoogleAPICredentialFile} className=" hidden" accept=".json"  type="file" />
                        <div className="flex flex-col sm:flex-row gap-2 justify-between w-full" >
                            <div className={`flex flex-row w-full justify-start sm:w-fit gap-3`}>
                                <button onClick={() => ClickGoogleAPICredentialFileUpload('click')} data-tip="Upload audio"  className={` cursor-pointer tooltip tooltip-right w-10 min-w-14 h-10 shadow-xs rounded-md shadow-slate-200 hover:shadow-slate-500 dark:hover:shadow-slate-200 transition-all duration-300 dark:shadow-slate-500 bg-transparent `} >
                                    <BsUpload  className=" my-auto text-sm mx-auto text-slate-200 transition-all duration-300 "  role="button" />
                                </button>
                                <input className={`${OverviewUpload.file == null ? 'invisible' : 'visible'} text-sm w-fit min-w-fit max-w-[200px] dark:text-slate-300 text-slate-600  text-ellipsis `} readOnly value={`name: ${OverviewUpload.Name}`} />
                            </div>
                            <p disabled={OverviewUpload.file == null} onClick={ClearGoogleAPICredentialFileUpload} className={` ${OverviewUpload.file == null ? 'invisible' : 'visible'} dark:text-slate-400 text-slate-500 hover:text-red-200/60 dark:hover:text-red-300/80 transition-all duration-200 underline underline-offset-2 cursor-pointer w-fit ml-auto mr-2 `} >clear</p>
                            <div className= {` ${OverviewUpload.Scope == 'GoogleAPICredentialFile' ? 'visible' : 'invisible'} flex flex-row flex-wrap gap-2 w-full mx-auto mt-auto justify-around `}>
                                    {
                                        OverviewUpload.LoadingVideoList == true && OverviewUpload.Scope == 'GoogleAPICredentialFile' ? 
                                            <span className="loading ml-auto mr-1 dark:bg-slate-400 bg-slate-700 loading-spinner loading-md"></span>
                                        :
                                            <button onClick={() => SaveGoogleAPICredentialFile('save')} disabled={OverviewUpload.file == null || OverviewUpload.Scope != 'GoogleAPICredentialFile'} data-tip="save file" className={` tooltip py-2 cursor-pointer  disabled:cursor-not-allowed  disabled:bg-gray-600 disabled:opacity-60 px-3 min-w-[80px] disabled:shadow-transparent ml-auto mr-1 mb-auto text-sm text-gray-900 rounded-md bg-transparent transition-all duration-300 shadow-slate-600/90 dark:shadow-slate-600/90 border-opacity-80 hover:border-opacity-100 shadow-xs hover:py-3 dark:text-white `}>save</button>
                                    }
                            </div>
                        </div>
                    </div>

                </div>
                {/* selected overview tab info view */}
                <div className={`${AboutMeSelectedTab == 'Overview' && !IsEditingProfile ? 'flex flex-col gap-2' : ' hidden'} text-slate-950  dark:text-slate-100 w-full h-fit p-2 `} >
                    <p className=" text-sm py-1 text-slate-800 dark:text-slate-200 " >Google API Credentials file</p>
                    <div className="flex flex-col justify-start gap-3 w-full h-fit" >
                        {ProfileAboutContainer.GoogleAPICredentialFile == null ?
                            <p className=" text-sm py-1 text-slate-800 dark:text-slate-200 " >No file uploaded yet</p>
                            :
                            <p onClick={() => downloadFile(ProfileAboutContainer.GoogleAPICredentialFile)} className=" text-sm py-1 cursor-pointer dark:decoration-sky-400/60 ml-8 flex flex-row group gap-2 text-slate-800 dark:text-slate-200 " >
                                <MdOutlineFileDownload   className=" my-auto text-lg text-blue-600 cursor-pointer dark:text-sky-400 group-hover:text-purple-500 dark:group-hover:text-purple-500  transition-all duration-300 "  role="button" />
                                <span className=" opacity-80 group-hover:underline group-hover:underline-offset-2 cursor-pointer " >download file</span>
                            </p>
                        }
                    </div>

                </div>
            </div>

            {/* repository section  */}
            <div className=  {`z-30 ${SelectedProfileNav == 'Repository' && ProfileAccount.IsOwner == true   ?  'flex flex-col lg:flex-row' : 'hidden'}   sticky top-0 md:mt-4 gap-2 h-full justify-start overflow-y-auto min-h-fit bg-slate-400 dark:bg-slate-500 w-full px-2 `} >
                {/* selection tab */}
                <button onClick={() => SetIsAddingFolder(true)} data-tip="Add Folder"  className={` ${!IsAddingFolder && SelectedRepository != 'file' ? 'flex ' : 'hidden'} tooltip tooltip-left w-10 min-w-12 h-10 border-[1px] mr-3 ml-auto mt-3 rounded-md border-slate-200 dark:border-slate-600 bg-transparent `} >
                    <IoIosAddCircleOutline className=" my-auto text-xl mx-auto hover:text-slate-200 text-slate-900 transition-all duration-300 "  role="button" />
                </button>

                {/* adding folder container */}
                <div className={` ${IsAddingFolder ? 'flex flex-col' : 'hidden'} w-[90%] my-4 rounded-md min-h-[350px] max-w-[600px] mx-auto h-fit border-[1px] border-slate-600 dark:border-slate-400 `} >
                    <MdOutlineAdd onClick={() => SetIsAddingFolder(false)} className=" text-xl ml-auto mr-4 mt-3 rotate-45 cursor-pointer hover:text-rose-300 text-slate-900 transition-all duration-300 "  />
                    <h1 className=" mx-auto text-slate-100 font-semibold text-base " >Fill in the input bellow</h1>        
                    {/* first step */}
                    <div className={`  my-auto flex flex-col p-4 `} >
                        <label className=" font-semibold dark:text-slate-300 text-sm" htmlFor="Folder Name">Folder Name</label>
                        <label className="input max-h-[40px] w-[80%] rounded-sm mx-auto px-0 pl-4 max-w-[500px] border-[1px] border-slate-600 bg-transparent dark:bg-transparent flex items-center gap-10">
                            <FaRegFolderOpen   className=" text-2xl text-slate-800 dark:text-slate-800" />
                            <input id='Folder Name' 
                            onChange={folderNameChange}
                            name="Folder Name"  className='mx-auto text-slate-100 focus:outline-none ring-0 max-h-[35px] placeholder:text-slate-300 bg-slate-100 bg-opacity-20 outline-1 outline-none   border-none placeholder:text-left border-slate-900  rounded-sm px-2 w-full'  placeholder="my folder name" type="text"  />
                        </label>
                        {errors.postTitle && <p className=" my-2 max-w-[600px] bg-slate-600 p-1 mt-3 text-rose-400 font-semibold mx-auto text-center w-[80%] rounded-sm text-sm sm:text-base" >{errors.postTitle?.message}</p>}

                    </div>
                    
                    {/* back,next steps */}
                    <div className=" w-full mt-auto mb-3 max-w-[400px] mx-auto flex flex-row justify-around" >
                        <button onClick={() => SetIsAddingFolder(false)}  data-tip="Cancel" className= {`tooltip  w-fit mx-auto bg-transparent  rounded-sm py-2 px-4 text-sm font-[PoppinsN] text-slate-950 dark:hover:border-transparent hover:border-transparent border-[1px] hover:text-slate-50 dark:hover:text-slate-50 cursor-pointer z-30 dark:hover:bg-sky-700 hover:bg-sky-700 transition-all duration-500 dark:text-slate-300 my-auto border-slate-100  dark:border-purple-400 `}  >Cancel</button>
                        <button onClick={()=> CreateFolderFunc('create')} disabled={folderName == '' ? true : false}  data-tip="Next" className= {`tooltip  w-fit mx-auto bg-transparent  rounded-sm py-2 px-4 text-sm font-[PoppinsN] text-slate-950 disabled:opacity-15 disabled:cursor-not-allowed dark:hover:border-transparent hover:border-transparent border-[1px] hover:text-slate-50 dark:hover:text-slate-50 cursor-pointer z-30 dark:hover:bg-sky-700 hover:bg-sky-700 transition-all duration-500 dark:text-slate-300 my-auto  border-slate-100  dark:border-purple-400`}  >Create</button>
                    </div>        
                </div>
                {/* filter folder container */}
                <div className= {` ${!IsAddingFolder ? 'flex flex-col' : 'hidden'}  w-full lg:max-w-[300px]  border-b-[1px] dark:text-slate-100 text-slate-950 lg:border-none  border-b-slate-600 gap-2 justify-start p-2 `}  >
                    <label className="input input-bordered bg-transparent  transition-all duration-300 border-slate-200 dark:border-slate-700 mx-auto w-full max-w-sm flex items-center gap-2">
                        <input type="text" value={folderNameFilter} onChange={FolderFilterChange} className="grow border-none outline-none transition-all duration-300 rounded-md  " placeholder="Search" />
                        <BsSearch
                            className="h-4 w-4 cursor-pointer hover:opacity-100 focus:opacity-100 opacity-70"
                        />  
                    </label>
                </div>
                {/* repository folder card map container */}
                <div className={` ${SelectedRepository == 'folder' ? 'flex flex-col justify-start' : 'hidden'} text-slate-950  dark:text-slate-100 w-full max-h-[90vh] sm:max-h-screen  overflow-y-auto h-fit p-2 `} >
                    {/* post container */}
                    <div ref={FolderListContainer} className={` ${FolderList[0] ? 'flex flex-row flex-wrap' : 'hidden'} scroll-smooth  gap-4 justify-around text-slate-950  dark:text-slate-100 w-full max-h-[90vh] sm:max-h-screen  overflow-y-auto h-fit p-2 `}  >
                        {MapFolderList}
                    </div>
                    
                    <div className= {` ${!FolderList[0] ? 'card' : 'hidden'}  mx-auto bg-base-100 image-full w-[90%] max-w-[700px] shadow-xl `}>
                        <figure className=" opacity-100 "  >
                            <img loading="lazy"
                            className=" opacity-100"
                            src={ProfilePicturePhoto}
                            alt="Shoes" />
                        </figure>
                        <div className="card-body align-middle">
                            <h1 className=" font-[button] text-2xl m-auto " >No folders</h1>                            
                        </div>
                    </div>                   
                    
                </div>
                {/*repository file map container  */}
                <div className={` ${SelectedRepository == 'file' ? 'flex flex-col justify-start' : 'hidden'} text-slate-950  dark:text-slate-100 w-full max-h-[90vh] sm:max-h-screen  overflow-y-auto h-fit p-2 `} >
                    
                    <div className= {` ${ShowUploadFilePreview == false ? 'flex flex-row':'hidden'} sticky left-0 justify-around w-full `} >
                            <button onClick={() => RepositoryNavigator('folder')} className=" py-2 px-4 rounded-sm text-sm mb-3 border-[1px] border-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600 transition-all duration-300 dark:border-slate-600 " >Back</button>
                            <input onChange={ToogleRepositoryUpload} ref={RepositoryUploadFile} className=" hidden"  type="file" />
                            <button onClick={() => ClickUploadRepository('click')} data-tip="Upload file"  className={` tooltip tooltip-left w-10 min-w-14 h-10 border-[1px] rounded-md border-slate-200 dark:border-slate-600 bg-transparent `} >
                                <FaFileUpload className=" my-auto text-xl mx-auto text-slate-200 transition-all duration-300 "  role="button" />
                            </button>
                    </div>
                    {/* file upload review */}
                    <div className={`  ${SelectedRepository == 'file' && ShowUploadFilePreview == true ?'flex flex-row flex-wrap': 'hidden'} scroll-smooth gap-1 justify-around border-[1px] text-slate-950 border-slate-200 dark:border-slate-600  dark:text-slate-100 w-full max-w-sm mx-auto my-2 max-h-[90vh] sm:max-h-screen  overflow-y-auto h-fit p-2 `} >
                        <h1 className=" mx-auto text-slate-100 font-semibold text-base " >File Review</h1>        

                        <div className={`  my-auto flex flex-col p-4 `} >
                            <label className=" font-semibold dark:text-slate-300 text-sm" htmlFor="File Name">File Name</label>
                            <label className="input max-h-[40px] w-[80%] rounded-sm mx-auto px-0 pl-4 max-w-[500px] border-[1px] border-slate-600 bg-transparent dark:bg-transparent flex items-center gap-10">
                                <FaFileUpload   className=" text-2xl text-slate-800 dark:text-slate-800" />
                                <input id='File Name' 
                                value={Upload.filename}
                                name="File Name"  className='mx-auto text-slate-100 focus:outline-none ring-0 max-h-[35px] placeholder:text-slate-300 bg-slate-100 bg-opacity-20 outline-1 outline-none   border-none placeholder:text-left border-slate-900  rounded-sm px-2 w-full'  placeholder="my folder name" type="text"  />
                            </label>
                            <label className=" font-semibold dark:text-slate-300 text-sm" htmlFor="File size">File size</label>
                            <label className="input max-h-[40px] w-[80%] rounded-sm mx-auto px-0 pl-4 max-w-[500px] border-[1px] border-slate-600 bg-transparent dark:bg-transparent flex items-center gap-10">
                                <SlSizeActual    className=" text-2xl text-slate-800 dark:text-slate-800" />
                                <input id='File size' 
                                value={Upload.size}
                                name="File size"  className='mx-auto text-slate-100 focus:outline-none ring-0 max-h-[35px] placeholder:text-slate-300 bg-slate-100 bg-opacity-20 outline-1 outline-none   border-none placeholder:text-left border-slate-900  rounded-sm px-2 w-full'  placeholder="my folder name" type="text"  />
                            </label>
                        </div>                        
                        {/* back,next steps */}
                        <div className=" w-full mt-auto mb-3 max-w-[400px] mx-auto flex flex-row justify-around" >
                            <button onClick={() => SetShowUploadFilePreview(false)}  data-tip="Cancel" className= {`tooltip  w-fit mx-auto bg-transparent  rounded-sm py-2 px-4 text-sm font-[PoppinsN] text-slate-950 dark:hover:border-transparent hover:border-transparent border-[1px] hover:text-slate-50 dark:hover:text-slate-50 cursor-pointer z-30 dark:hover:bg-sky-700 hover:bg-sky-700 transition-all duration-500 dark:text-slate-300 my-auto border-slate-100  dark:border-purple-400 `}  >Cancel</button>
                            <button onClick={()=> UploadRepositoryFile('upload')} disabled={RepositoryUploadFile.current == null ? true : false}  data-tip="Next" className= {`tooltip  w-fit mx-auto bg-transparent  rounded-sm py-2 px-4 text-sm font-[PoppinsN] text-slate-950 disabled:opacity-15 disabled:cursor-not-allowed dark:hover:border-transparent hover:border-transparent border-[1px] hover:text-slate-50 dark:hover:text-slate-50 cursor-pointer z-30 dark:hover:bg-sky-700 hover:bg-sky-700 transition-all duration-500 dark:text-slate-300 my-auto  border-slate-100  dark:border-purple-400`}  >Upload</button>
                        </div> 
                    </div>
                    {/* file map container */}
                    <div ref={FileListContainer} className= {`${FileList[0] ? 'flex ' : 'hidden'} mx-auto relative rounded-md overflow-auto shadow-md w-[90%] min-w-[600px] max-h-[90vh] `}>
                        <table className="text-sm table-auto text-left rtl:text-right w-full min-w-full  text-gray-500 dark:text-gray-400">
                            <thead className="text-xs text-gray-700 uppercase bg-gray-50 rounded-md dark:bg-gray-800 dark:text-gray-300">
                                <tr>
                                    <th scope="col" className="px-2 py-3">File Name</th>
                                    <th scope="col" className="px-2 py-3">Date Crated</th>
                                    <th scope="col" className="px-2 py-3">Size</th>
                                    <th scope="col" className="px-2 py-3">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {MapFileList}
                            </tbody>
                            <tfoot className="text-xs text-gray-700 uppercase bg-gray-50 rounded-md dark:bg-gray-800 dark:text-gray-300" >
                                <tr>
                                    <th scope="col" className="px-2 py-3">File Name</th>
                                    <th scope="col" className="px-2 py-3">Date Crated</th>
                                    <th scope="col" className="px-2 py-3">Size</th>
                                    <th scope="col" className="px-2 py-3">Action</th>
                                </tr>
                            </tfoot>
                        </table>
                    </div>                       
                    {/* no file available card */}
                    <div className= {` ${!FileList[0] ? 'card' : 'hidden'}  mx-auto bg-base-100 image-full w-[90%] max-w-[700px] shadow-xl `}>
                        <figure className=" opacity-100 "  >
                            <img loading="lazy"
                            className=" opacity-100"
                            src={ProfilePicturePhoto}
                            alt="Shoes" />
                        </figure>
                        <div className="card-body align-middle">
                            <h1 className=" font-[button] text-2xl m-auto " >No files</h1>                            
                        </div>
                    </div> 
                </div>
                
            </div>
            {/* account section */}
            <div className=  {`z-30 pb-[150px] ${SelectedProfileNav == 'Account' ?  'flex flex-col lg:flex-row' : 'hidden'}  md:mt-4 gap-2 h-full md:min-h-fit max-h-[90vh] justify-start overflow-y-auto min-h-fit bg-slate-400 dark:bg-slate-500 w-full px-2 `} >
                {/* selection tab */}
                <div className=" w-full flex flex-col border-b-[1px] lg:border-none lg:max-w-[400px] border-b-slate-600 gap-2 justify-start p-2" >
                    <button onClick={() => SetAccountSelectedTab('Delete')} className= {` ${AccountSelectedTab == 'Delete' ? ' text-sky-400 dark:text-slate-200 dark:bg-opacity-60 bg-slate-700  ' : 'bg-slate-600 dark:bg-slate-800 dark:text-slate-400 text-slate-950'} w-full text-left  rounded-md transition-all hover:text-slate-200 duration-300  p-2 font-semibold hover:bg-slate-700 `} >Delete Account</button>
                </div>
                {/* selected overview tab info */}
                <div className={`${AccountSelectedTab == 'Delete' ? 'flex flex-col gap-2' : ' hidden'} pl-4 text-slate-950  dark:text-slate-100 w-full h-fit p-2 `} >
                    <p>Deleting your account will remove all of your data from our database. This cannot be reversed.</p>
                    <button onClick={() => ToongleAccountManager('show')} data-tip="Delete Account"   className={`  ${!DeleteAccount.show ? 'flex ' : 'hidden'} tooltip    rounded-sm py-2 px-4 text-sm w-fit  font-[PoppinsN] text-slate-950 border-[1px] hover:text-slate-50 dark:hover:text-slate-50 cursor-pointer z-30 bg-transparent bg-opacity-30 hover:bg-red-500 transition-all duration-500 dark:text-slate-300 my-auto border-opacity-90  border-red-300 `}>Delete</button>
                    <div className={` ${DeleteAccount.show ? 'flex flex-col gap-2 justify-start ' : 'hidden'} w-full `} >
                        <div className=" flex flex-col gap-2 pl-2 w-[90%] max-w-[600px] mr-auto">
                            <big id="BigProppin" className=" text-red-300 ">Deleting Account</big>
                            <p >Input your account Password</p>
                            <label className="input max-h-[40px] w-[90%] rounded-sm mx-auto px-0 pl-4 max-w-[500px] input-bordered border-[1px] border-slate-700 dark:border-slate-600 border-opacity-90  bg-transparent flex items-center gap-2">
                                <IoLockOpenOutline  className="text-lg text-rose-500  " />
                                <input {...register('password',{
                                        required : 'Password is required!',
                                        minLength : {
                                            value : 5,
                                            message :'Input more characters'
                                        }
                                    })}  id="password" className='outline-0  placeholder:text-slate-600 text-slate-900 dark:text-slate-100 dark:placeholder:text-slate-300 bg-slate-100 bg-opacity-20 outline-none  mx-auto  border-none placeholder:text-left  rounded-sm p- w-full'   placeholder="password" type="password" />
                            </label>
                            {errors.password && <p className=" my-2 max-w-[600px] bg-gray-800 text-red-500 text-left p-1 ml-4 bg-opacity-70 w-[80%] rounded-sm text-sm sm:text-base" >{errors.password?.message}</p>}
                    
                        </div>
                        <div className=" flex  gap-3 flex-row flex-wrap w-full justify-around px-8">
                        <button onClick={() => ToongleAccountManager('hide')} data-tip="Cancel"   className={` tooltip mx-auto  rounded-sm py-2 px-4 text-sm w-fit  font-[PoppinsN] text-slate-950 border-[1px] hover:text-slate-50 dark:hover:text-slate-50 cursor-pointer z-30 bg-transparent bg-opacity-30 hover:bg-sky-500 transition-all duration-500 dark:text-slate-300 my-auto border-opacity-90  border-sky-300 `}>Back</button>
                        <button onClick={() => ToongleAccountManager('delete')} data-tip="Delete Account"   className={` tooltip mx-auto rounded-sm py-2 px-4 text-sm w-fit  font-[PoppinsN] text-slate-950 border-[1px] hover:text-slate-50 dark:hover:text-slate-50 cursor-pointer z-30 bg-transparent bg-opacity-30 hover:bg-red-500 transition-all duration-500 dark:text-slate-300 my-auto border-opacity-90  border-red-300 dark:border-red-400 `}>Confirm Delete</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
};

const mapStateToProps =  state => ({
    isAuthenticated:state.auth.isAuthenticated,
    
})    
export default connect(mapStateToProps,{UpdateProfile,FetchUserProfile,UploadProfileFile,delete_user})(ProfileJSX)


