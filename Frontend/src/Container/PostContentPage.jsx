import React, { Profiler, useEffect, useLayoutEffect, useRef, useState } from "react";
import '../App.css'
import { FetchUserProfile } from "../actions/profile.jsx";
import { useForm } from "react-hook-form";
import { PromptMergeVideos } from "../actions/ai";
import { oneDark } from "@codemirror/theme-one-dark";
import CodeMirror from '@uiw/react-codemirror';
import { BsUpload } from "react-icons/bs";
import { MdContentCopy } from "react-icons/md";
import { json } from "@codemirror/lang-json";
import { linter, lintGutter } from "@codemirror/lint";
import { LuCornerUpLeft } from "react-icons/lu";
import { LuCornerUpRight, LuGithub } from "react-icons/lu";
import { lineNumbers } from "@codemirror/view";
import { connect, useDispatch } from "react-redux";
import {useSelector} from 'react-redux'
import "react-quill/dist/quill.snow.css";
import {  toast } from 'react-toastify';
import 'react-quill/dist/quill.snow.css';
import { MdOutlineAdd } from "react-icons/md";
import 'react-quill/dist/quill.snow.css';
import Select from "react-select";
// lottieflow animated icons 
import ProfileTestImg from '../assets/images/fallback.jpeg'
import { useParams } from "react-router-dom";
import { AiVideoMergeUrlReducer } from "../actions/types";
// using argon2 pashing for both javascript and py
//const argon2 = require('argon2');
const PostContentPage = ({isAuthenticated,PromptMergeVideos,FetchUserProfile}) => {
    const {register,formState,reset,getValues,setValue,watch} = useForm({
        defaultValues : {
            'AIprompt' : '',         
        },
        mode : 'all'
    })
    const { extrainfo } = useParams();
    const dispatch = useDispatch()
    const db = useSelector((state) => state.auth.user)  
    const UserEmail  = db != null ? db.email : 'gestuser@gmail.com'
    const UserID  = db != null ? db.id : ''
    const [AudioUpload,SetAudioUpload] = useState({
        'file' : null,
        'src' : null,
        'Name' : null,
    })
    const ProfileDB = useSelector((state) => state.ProfileReducer.ProfileAbout)
    const [ProfilePicturePhoto,SetProfilePicturePhoto] = useState( db != null ? db.ProfilePic : ProfileTestImg)
    const AiVideoMergeUrl = useSelector((state) => state.AiReducer.AiVideoMergeUrl)
    const [MediaGallary,SetMediaGallary] = useState({
        'type' : '',
        'src' : '',
        'show' : false,
    })
    const AiVoiceRef = useRef(null)
    const [PostContentContainer,SetPostContentContainer] = useState({
        'FirstStepLevel' : 1,
        'SecondStepLevel' : 1,
        'ThirdStepLevel' : 1,
        'progressLevel' : 3,
        'LoadingVideoList' : false,
        'CustomAiAdioScript' : '',
        'SelectedSocialMediaType' : 'youtube',
        'MaximumSocialMediaSelected' : 1,
        'ModeValue' : 'AI',
        'SocialMediaNumberVideosOptions' : [],
        'VideoListDetails' : '',
        'VideoListDetailsWithImages' : [],
        'UploadedVideoId' : ''
    })
    const SocialMediaNumberVideosOptions = [
        { value: "1", label: "1 video",name : 'SocialMediaNumberVideosOptions' },
        { value: "2", label: "2 videos",name : 'SocialMediaNumberVideosOptions' },
        { value: "3", label: "3 videos",name : 'SocialMediaNumberVideosOptions' },
        { value: "4", label: "4 videos",name : 'SocialMediaNumberVideosOptions' },
        { value: "5", label: "5 videos",name : 'SocialMediaNumberVideosOptions' },
        { value: "6", label: "6 videos",name : 'SocialMediaNumberVideosOptions' },
        { value: "7", label: "7 videos",name : 'SocialMediaNumberVideosOptions' },
        { value: "8", label: "8 videos",name : 'SocialMediaNumberVideosOptions' },
        { value: "9", label: "9 videos",name : 'SocialMediaNumberVideosOptions' },
        { value: "10", label: "10 videos",name : 'SocialMediaNumberVideosOptions' },
    ];
    const [ProfileAboutContainer,SetProfileAboutContainer] = useState({
            'GoogleAPICredentialFile' : null
    })
   
    const [SelectedVideoImageCarousel,SetSelectedVideoImageCarousel] = useState(0)
    const UploadProfilePost = useRef(null)
    const WsDataStream = useRef(null)
    const Theme = useSelector((state)=> state.auth.Theme)  

    useLayoutEffect(()=> {
        requestWsStream('open')
        if(db != null){
            SetProfilePicturePhoto(db.ProfilePic)
            var data = {
                'scope' : 'ReadProfile',
                'AccountEmail' : UserEmail,
                'AccountID' : extrainfo,
                'IsOwner' : true,
            }
            FetchUserProfile(JSON.stringify([data]))
        }      
    },[db,extrainfo])
    
    useEffect(() => {
        if (AiVideoMergeUrl != null && AiVideoMergeUrl != false &&  AiVideoMergeUrl != 'error'){
            SetPostContentContainer((e)=> {
                return {
                    ...e,
                    'SecondStepLevel' : 2,
                    'progressLevel' : 3,
                    'ThirdStepLevel' : 1,
                    'LoadingVideoList' : false
                }
            })
            
        }else if (AiVideoMergeUrl == 'error'){
            
            dispatch({
                type : AiVideoMergeUrlReducer,
                payload : null
            })
            ShowToast('warning','Failed to fetch AI-generated image')
            setTimeout(() => {
                SetPostContentContainer((e)=> {
                    return {
                        ...e,
                        'SecondStepLevel' : 1,
                        'progressLevel' : 1,
                        'ThirdStepLevel' : 1,
                        'LoadingVideoList' : false
                    }
                })
            }, 1000);
        }
    },[AiVideoMergeUrl])

    useEffect(() => {
            if(ProfileDB != null){
                //console.log('called',ProfileDB)
                SetProfileAboutContainer((e) => {
                    return {
                        ...e,
                        'GoogleAPICredentialFile' : ProfileDB.GoogleAPICredentialFile
                    }
                })  
            }
           
    },[ProfileDB])

    const customTagSelectorTheme = (theme, mode = "light") => ({
        ...theme,
        colors: {
            ...theme.colors,
            primary25: mode == "dark" ? "#333" : "#e0e0e0", // Softer hover background
            primary: mode == "dark" ? "#009f99" : "#0056b3", // Darker green & blue
            neutral0: mode == "dark" ? "#222" : "#fff", // Background color
            neutral90: mode == "dark" ? "#fff" : "#222", // Text color
            neutral80: mode == "dark" ? "#ddd" : "#444", // Placeholder color
        },
    });
    
    const customStyles = (mode) => ({
        control: (base) => ({
            ...base,
            backgroundColor: mode === "dark" ? "#222" : "#fff",
            borderColor: mode === "dark" ? "#009f99" : "#0056b3",
            color: mode === "dark" ? "#fff" : "#222",
            fontSize: "16px",
            padding: "5px",
        }),
        menu: (base) => ({
            ...base,
            backgroundColor: mode === "dark" ? "#222" : "#fff",
        }),
        menuList: (base) => ({
            ...base,
            maxHeight: "100px", // Set the maximum height
            overflowY: "auto",  // Enable scrolling if items exceed maxHeight
        }),
        option: (base, { isFocused, isSelected }) => ({
            ...base,
            backgroundColor: isSelected
                ? mode === "dark"
                    ? "#009f99"
                    : "#0056b3"
                : isFocused
                ? mode === "dark"
                    ? "#444"
                    : "#ddd"
                : mode === "dark"
                ? "#222"
                : "#fff",
            color: isSelected ? (mode === "dark" ? "#222" : "#fff") : mode === "dark" ? "#fff" : "#222",
        }),
        multiValue: (base) => ({
            ...base,
            backgroundColor: mode === "dark" ? "#009f99" : "#0056b3",
            borderRadius: "5px",
            padding: "3px 8px",
        }),
        multiValueLabel: (base) => ({
            ...base,
            color: mode === "dark" ? "#222" : "#fff",
        }),
        multiValueRemove: (base) => ({
            ...base,
            color: mode === "dark" ? "#222" : "#fff",
            ":hover": {
                backgroundColor: mode === "dark" ? "#b30000" : "#990000", // Darker red on hover
                color: "#fff",
            },
        }),
    });
        
    const ToogleAudioUpload = (val) => {
       
        var File =  AiVoiceRef.current.files[0] ?  AiVoiceRef.current.files[0] : val
       
        if(File) {
            var Types = String(File.type).split('/')
            
            if(Types[0] == 'image'){
                
            }else if(Types[0] == 'audio'){
                const render = new FileReader()
                render.onload = function (e) {
                    SetAudioUpload((val) => {
                        return {
                            ...val,
                            'file' : File,
                            'src' : e.target.result,
                            'Name' : File.name
                        }
                    })               
                                        
                }
                render.readAsDataURL(File) 
            }

                   
        }

    }    
    function ShowToast(type,message){
            if(type != null && message != null){
                toast(message,{
                    type : type,
                    theme : Theme,
                    position : 'top-right'
                })
            }
    } 
    //console.log(PostContentContainer.VideoListDetailsWithImages)
    const requestWsStream = (msg = null,body = null) => {    
       
        if(msg =='open'){
            
            if(WsDataStream.current != null ){
                WsDataStream.current.close(1000,'Opening another socket for less ws jam')

            }
            WsDataStream.current =  new WebSocket(`ws:/${import.meta.env.VITE_WS_API}/ws/ai/${UserEmail}/`);

        }
         if(msg == 'close'){
            
            if(WsDataStream.current != null ){
                WsDataStream.current.close(1000,'usefull eminent')

            }
        }
        
        WsDataStream.current.onmessage = function (e) {
          var data = JSON.parse(e.data)
          if(data.type == 'RequestAIResponse') {
                var val = data.message
                if (val['type'] == 'success') {
                    var Listval = val['result']
                    var customScript = Listval[Listval.length -1].script ? Listval[Listval.length -1].script : 'no script generated'
                    Listval[Listval.length -1].script ? Listval.pop() : ''
                    var videoList = JSON.stringify(Listval , null, 2);
                    SetPostContentContainer((e) => {
                        return {
                            ...e,
                            'VideoListDetails' : videoList,
                            'LoadingVideoList' : false,
                            'CustomAiAdioScript' : customScript,
                            'FirstStepLevel' : 2,
                            'progressLevel' : 1,
                        }
                    })
                    
                }else {
                    SetPostContentContainer((e) => {
                        return {
                            ...e,
                            'LoadingVideoList' : false,
                            'FirstStepLevel' : 1,
                            'progressLevel' : 1,
                        }
                    })
                    ShowToast(val['type'],val['result'])
                }
            
           }else if(data.type == 'RequestCreateImages'){
                var val = data.message
                if (val['type'] == 'success') {
                  
                 // console.log(typeof(videoList),videoList)
                    SetPostContentContainer((e) => {
                        return {
                            ...e,
                            'VideoListDetailsWithImages' : val['data'],
                            'LoadingVideoList' : false,
                            'SecondStepLevel' : 2,
                            'progressLevel' : 2,
                        }
                    })
                    ShowToast(val['type'],val['result'])
                }else {
                    SetPostContentContainer((e) => {
                        return {
                            ...e,
                            'LoadingVideoList' : false,
                            'SecondStepLevel' : 1,
                            'progressLevel' : 2,
                        }
                    })
                    ShowToast(val['type'],val['result'])
                }
           }else if(data.type == 'RequestUploadVideos'){
            var val = data.message
            if (val['type'] == 'success') {
                //console.log(val)
                // console.log(typeof(videoList),videoList)
                SetPostContentContainer((e) => {
                    return {
                        ...e,
                        'ThirdStepLevel' : 2,
                        'progressLevel' : 3,
                        'LoadingVideoList' : false,
                        'UploadedVideoId' : val.video_id
                    }
                })
                dispatch({
                    type : AiVideoMergeUrlReducer,
                    payload : null
                })
                ShowToast(val['type'],val['result'])
            }else {
                SetPostContentContainer((e) => {
                    return {
                        ...e,
                        'ThirdStepLevel' : 1,
                        'progressLevel' : 3,
                        'LoadingVideoList' : false
                    }
                })
                ShowToast(val['type'],val['result'])
            }
       }
        };
        WsDataStream.current.onopen = (e) => {
            // websocket is opened
            SetPostContentContainer((e) => {
                return {
                    ...e,
                    'LoadingVideoList' : false
                }
            })
        }
        WsDataStream.current.onclose = function (e) {
          
        }
        if(WsDataStream.current.readyState === WsDataStream.current.OPEN){
            if(msg == 'RequestAIResponse') {
                
                WsDataStream.current.send(
                    JSON.stringify({
                        'message' : 'RequestAIResponse',
                        'email' : UserEmail,
                        'prompt' : body
                    })
                )
            }else if(msg == 'RequestCreateImages') {
                
                WsDataStream.current.send(
                    JSON.stringify({
                        'message' : 'RequestCreateImages',
                        'email' : UserEmail,
                        'prompt' : PostContentContainer.VideoListDetails,
                        'SocialMediaType' : PostContentContainer.SelectedSocialMediaType
                    })
                )
            }else if(msg == 'RequestUploadVideos') {
                
                WsDataStream.current.send(
                    JSON.stringify({
                        'message' : 'RequestUploadVideos',
                        'email' : UserEmail,
                        'prompt' : PostContentContainer.VideoListDetailsWithImages,
                        'VideoUrl' : AiVideoMergeUrl,
                        'SocialMediaType' : body,
                        'GoogleAPICredentialFile' : ProfileAboutContainer.GoogleAPICredentialFile
                    })
                )
            }
        }
        
    } 
    
    function ToongleFirstStepLevel(props) {
        if(UserEmail == 'gestuser@gmail.com' || UserEmail == null){
            ShowToast('warning','Login to proceed')
            return
        }
        if(props == 'next'){
            
            if(PostContentContainer.ModeValue == 'AI'){
                if(WsDataStream.current.readyState === WsDataStream.current.OPEN){
                    SetPostContentContainer((e)=> {
                        return {
                            ...e,
                            'progressLevel' : 1,
                            'LoadingVideoList' : true
                        }
                    })
                    var promptConstructed = {
                        'socialMedia' : PostContentContainer.SelectedSocialMediaType,
                        'prompt' : ` Generate an array of ${PostContentContainer.SocialMediaNumberVideosOptions[0].value} objects based on this idea '${getValues('AIprompt')} ' `
                    }
                    requestWsStream('RequestAIResponse',promptConstructed)
                }else {
                    ShowToast('warning','Unstable internet connection.Check your network')
                }
                
            }else {
                var NextStep = PostContentContainer.FirstStepLevel != 3 ? PostContentContainer.FirstStepLevel + 1 : 3 
                SetPostContentContainer((e)=> {
                    return {
                        ...e,
                        'FirstStepLevel' : NextStep,
                        'progressLevel' : 1,
                        'LoadingVideoList' : false
                    }
                })
            }
        }else if(props == 'back'){
            var PreviousStep = PostContentContainer.FirstStepLevel != 1 ? PostContentContainer.FirstStepLevel - 1 : 3 
            SetPostContentContainer((e)=> {
                return {
                    ...e,
                    'FirstStepLevel' : PreviousStep,
                    'progressLevel' : 1,
                    'LoadingVideoList' : false
                }
            })
        }
    }
    function ToongleFirstStepLeve2(props) {
        if(props == 'next'){
            SetPostContentContainer((e)=> {
                return {
                    ...e,
                    'SecondStepLevel' : 1,
                    'progressLevel' : 2,
                    'LoadingVideoList' : false
                }
            })
            
        }else if(props == 'back'){
            SetPostContentContainer((e)=> {
                return {
                    ...e,
                    'FirstStepLevel' : 1,
                    'progressLevel' : 1,
                    'LoadingVideoList' : false
                }
            })
        }
    }
  
    function ToongleSecondProgressLevel(props) {
        if(props == 'Create'){
            SetPostContentContainer((e)=> {
                return {
                    ...e,
                    'SecondStepLevel' : 1,
                    'progressLevel' : 2,
                    'LoadingVideoList' : true,
                    'VideoListDetailsWithImages' : []
                }
            })
            requestWsStream('RequestCreateImages')
        }else if(props == 'Merge'){
          
            SetPostContentContainer((e)=> {
                return {
                    ...e,
                    'SecondStepLevel' : 2,
                    'progressLevel' : 2,
                    'ThirdStepLevel' : 1,
                    'LoadingVideoList' : true
                }
            })
            const formData = new FormData()
            formData.append('data',JSON.stringify(PostContentContainer.VideoListDetailsWithImages))
            formData.append('audio',AudioUpload.file)
            formData.append('email',UserEmail)
            formData.append('SocialMediaType',PostContentContainer.SelectedSocialMediaType)
            formData.append('audioName',AudioUpload.Name)
            PromptMergeVideos(formData)
        }else if(props == 'back'){
            SetPostContentContainer((e)=> {
                return {
                    ...e,
                    'SecondStepLevel' : 1,
                    'progressLevel' : 2,
                    'LoadingVideoList' : false
                }
            })
        }
    }
    function ToongleThirdProgressLevel(props) {
        if(props == 'Upload'){
            if(AiVideoMergeUrl == null){
                ShowToast('warning','Your video url seams to be empty')
                return
            }else if(ProfileAboutContainer.GoogleAPICredentialFile == null){
                ShowToast('warning','You haven\'t uploaded your Google Cloud client_secrets file. Navigate to Profile upage and upload the file')
                return
            }else {
                SetPostContentContainer((e)=> {
                    return {
                        ...e,
                        'ThirdStepLevel' : 1,
                        'progressLevel' : 3,
                        'LoadingVideoList' : true
                    }
                })
                var mediaType = PostContentContainer.SelectedSocialMediaType
                requestWsStream('RequestUploadVideos',mediaType)
            }
            
        }else if (props == 'Reset'){
            dispatch({
                type : AiVideoMergeUrlReducer,
                payload : null
            })
            SetPostContentContainer({
                'FirstStepLevel' : 1,
                'SecondStepLevel' : 1,
                'ThirdStepLevel' : 1,
                'progressLevel' : 1,
                'LoadingVideoList' : false,
                'CustomAiAdioScript' : '',
                'MaximumSocialMediaSelected' : 1,
                'ModeValue' : '',
                'SocialMediaNumberVideosOptions' : [],
                'VideoListDetails' : '',
                'VideoListDetailsWithImages' : [],
                'UploadedVideoId' : ''
                
            })
        }
    }
    const handleSocialMediaOptionsChange = (selected,val) => {
        //var name = selected[0] ? selected[0].name : selected[0]
        var MaxNumber = 1  
        if (selected.length <= MaxNumber) {
           
            SetPostContentContainer((e) => {
                return {
                    ...e,
                    [val.name] : (selected)
                }
                })
            
          
        }
    };
    const HandleCodeEditorChange = (value) => {
        SetPostContentContainer((e) => {
            return {
                ...e,
                'VideoListDetails' : value
            }
        })
    };
    function ChangeMediaGallary (props,typeval) {
        if(props != null){
            SetMediaGallary((e) => {
                return {
                    'src' : props,
                    'show' : true,
                    'type' : typeval
                }
            })
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

    let startImageX = 0;
    let endImageX = 0;
    
    const handleTouchImageStart = (event) => {
       startImageX = event.touches[0].clientX; // Get the initial touch position
    };
    const handleTouchImageEnd = (event) => {
        endImageX = event.changedTouches[0].clientX; // Get the final touch position
        
        if (startImageX > endImageX + 50) {
            // User swiped left (Next item)
            
            if (SelectedVideoImageCarousel >= PostContentContainer.VideoListDetailsWithImages.length - 1) {
                SetSelectedVideoImageCarousel(0);
            } else {
                SetSelectedVideoImageCarousel((e) => e + 1);
            }
        } else if (startImageX < endImageX - 50) {
            // User swiped right (Previous item)
            if (SelectedVideoImageCarousel === 0) {
                SetSelectedVideoImageCarousel(PostContentContainer.VideoListDetailsWithImages.length - 1)
            } else {
                SetSelectedVideoImageCarousel((e) => e - 1);
            }
        }
    };
    function ScrollVideoImage (props){
        if(props == 'back') {
            if (SelectedVideoImageCarousel === 0) {
                SetSelectedVideoImageCarousel(PostContentContainer.VideoListDetailsWithImages.length - 1)
            } else {
                SetSelectedVideoImageCarousel((e) => e - 1);
            }
        }else if(props == 'next'){
            if (SelectedVideoImageCarousel >= PostContentContainer.VideoListDetailsWithImages.length - 1) {
                SetSelectedVideoImageCarousel(0);
            } else {
                SetSelectedVideoImageCarousel((e) => e + 1);
            }
        }
    }
    //images of birds, others are flying others are on the nest.also provide short title
    // const MapImageCarousels = 'sd'
    
    const MapImageCarousels = PostContentContainer.VideoListDetailsWithImages.map((items,i) => {
        
        var imageurl = `${import.meta.env.VITE_APP_API_URL}/media/${items.ImageUrl}`
      
        return (
            <img loading="lazy" onClick={()=>ChangeMediaGallary(imageurl,'image')} className= {`mask-square h-fit m-auto min-h-fit  max-w-[250px] rounded-md cursor-pointer max-h-[250px] xs:max-h-[320px] xs:max-w-xs rounded-b-md   `} src={imageurl}  alt="media not found"/>        
        )
    })
    function ClickUploadRepository (props) {
        if(props){
            AiVoiceRef.current.click()
        }
    }
    function ClearUplaodedAudio () {
        SetAudioUpload((e) => {
            return {
                ...e,
                'file' : null,
                'src' : null,
                'Name' : null
            }
        })
        document.getElementById('AudioPreviewTag').src = ''
        AiVoiceRef.current.src = ''
    }
    function copyToClipboard(text) {
        navigator.clipboard.writeText(text)
            .then(() => ShowToast('info','Copied'))
            .catch(err => {
                ShowToast('warning','Seams like there is an issue with your request. Try again later') 
                console.error("Failed to copy:", err)
            });
    }
    const HandleAiVideoUrlError = (event) => {
        dispatch({
            type : AiVideoMergeUrlReducer,
            payload : null
        })
    }
    return (
        <div className={` h-full  bg-transparent min-h-[100vh] py-4 overflow-x-hidden w-full overflow-y-auto relative min-w-full max-w-[100%] flex flex-col justify-between  `} >
            {/*media galary displayer */}
            <div className={` ${MediaGallary.show ? 'absolute flex flex-row' : 'hidden'}  z-40 w-full pt-2 cursor-not-allowed bg-slate-700/60 min-h-full `} >
                <div className={` flex flex-col px-2 py-4 w-fit max-w-[95%] xl:max-w-[70vw] justify-start mx-auto cursor-pointer bg-slate-800 bg-opacity-70 border-slate-500 border-[1px] h-fit min-h-fit max-h-[80vh]  sm:w-[90%] rounded-md pt-2  `} >
                    <button onClick={() => CloseMediaGallary('close')} data-tip='close' className=" tooltip tooltip-bottom my-auto ml-auto mr-2 mt-1 w-fit " >
                        <MdOutlineAdd className={`rotate-45 cursor-pointer text-lg xs:text-2xl  text-slate-600  dark:text-slate-400 hover:text-slate-950 dark:hover:text-slate-200 z-30 transition-all duration-30  lg:text-2xl `} />
                    </button>
                    {/* container for image */}
                    <div className={` ${MediaGallary.type == 'image' ? '' : 'hidden'} m-auto w-full min-w-full h-full min-h-fit `} >
                        <img loading="lazy"
                            className= {` ${MediaGallary.type == 'image' ? 'mask-square h-fit m-auto max-h-[500px] min-h-fit rounded-b-md ' : ' hidden'} `}
                            src={MediaGallary.src} 
                        />
                    </div>
                    
                </div>
            </div>
            <section className={`  md:w-full  justify-between flex flex-col relative overflow-x-hidden overflow-y-visible w-full rounded-sm  md:mx-auto bg-transparent dark:text-slate-100 mb-auto   h-full`}>
                <small className=" text-slate-600 dark:text-slate-500 text-center" >It just takes three steps</small>
                <div className={`flex flex-col gap-3 w-[95%] max-w-[1000px] text-black dark:text-slate-100 mx-auto mt-4 `} >
                    
                    <div className={`${PostContentContainer.progressLevel == 1  ? 'collapse-open collapse' : ' collapse-arrow collapse'}  rounded-xl dark:bg-slate-500/40 bg-slate-400 `}  >
                        <input type="radio" name="my-accordion-2" defaultChecked />
                        <div className="collapse-title text-xl font-medium flex flex-row justify-between ">
                            Content Details 
                            <small className=" text-xs my-auto opacity-70 dark:opacity-60" >
                                <sup>1</sup>/ <sub>3</sub> 
                            </small>
                        </div>
                        <div className={` collapse-content flex transition-all  duration-200 flex-col gap-5 `} >
                            {/* steps display container */}
                            <ul className= {`steps transition-all w-full gap-4 text-slate-700 dark:text-slate-400 duration-300 mx-auto `}>
                                <li className={`step ${PostContentContainer.FirstStepLevel == 1 ?'step-primary' : PostContentContainer.FirstStepLevel > 1 ? ' step-success' : 'step-neutral' } `}>Details</li>
                                <li className={`step ${PostContentContainer.FirstStepLevel == 2 ?'step-primary' : PostContentContainer.FirstStepLevel > 2 ? ' step-success' : 'step-neutral'}  `}>Verification</li>
                            
                            </ul>
                            {/* information gathare container */}
                            <div className={` ${PostContentContainer.FirstStepLevel == 1 ? 'flex flex-col' : 'hidden'} h-[300px] justify-around min-h-fit  gap-3 `} >
                                <p className=" text-sm py-1 text-slate-800 dark:text-slate-400 " >Number of images</p>
                                <Select
                                    isMulti
                                    options={SocialMediaNumberVideosOptions}
                                    value={PostContentContainer.SocialMediaNumberVideosOptions}
                                    onChange={handleSocialMediaOptionsChange}
                                    name="SocialMediaNumberVideosOptions"
                                    placeholder="..."
                                    theme={(theme) => customTagSelectorTheme(theme, Theme)}
                                    styles={customStyles(Theme)}
                                    className="max-h-[200px] "
                                />
                                <div className={` ${PostContentContainer.ModeValue == 'AI' ? 'flex flex-col gap-3' : 'hidden'} `} >
                                    <p className=" text-sm py-1 text-slate-800 dark:text-slate-400 " >Write a short description of your videos to be generated</p>
                                    {/* chat component */}
                                    <textarea  
                                        className={` w-full bg-transparent max-h-[120px] resize-y outline-none text-slate-950   dark:text-slate-200 shadow-xs border-none focus-within:ring-0 focus-within:shadow-2Sxl ring-0 placeholder:text-slate-700 dark:placeholder:text-slate-400 focus:outline-transparent rounded-xl focus:border-transparent textarea   min-h-fit  h-[70px] overflow-y-auto`}  
                                        {...register('AIprompt',{required : false})}
                                        placeholder={'general description'} 
                                    ></textarea>                                            
                                </div>

                                {/* progressLevel buttons */}
                                <div className=" flex flex-row flex-wrap gap-2 w-[90%] max-w-[600px] mx-auto justify-around">
                                    {
                                        PostContentContainer.LoadingVideoList == true ? 
                                            <span className="loading mx-auto dark:bg-slate-400 bg-slate-700 loading-spinner loading-md"></span>
                                        :
                                            <button disabled={watch('AIprompt') == '' || PostContentContainer.SocialMediaNumberVideosOptions.length == 0} onClick={() => ToongleFirstStepLevel('next')} className={` py-2 cursor-pointer  disabled:cursor-not-allowed  disabled:bg-gray-600 disabled:opacity-60 px-3 min-w-[80px] disabled:shadow-transparent mx-auto mb-auto text-sm text-gray-900 rounded-md bg-transparent transition-all duration-300 shadow-blue-600/90 dark:shadow-sky-600/90 border-opacity-80 hover:border-opacity-100 shadow-xs hover:py-3 dark:text-white `}>Next</button>
                                    }

                                </div>
                            
                            </div>
                            {/* video generation */}
                            <div className={` w-full ${PostContentContainer.FirstStepLevel == 2 ? 'flex flex-col' : 'hidden'} h-[350px] min-h-fit  gap-3 `}  >
                                <p className=" text-sm py-1 text-slate-800 dark:text-slate-400 " >Verify credibility. Edit if desired</p>
                                <CodeMirror
                                    value={PostContentContainer.VideoListDetails}
                                    extensions={[
                                        lineNumbers(), // Enable line numbers
                                        lintGutter(), // Show gutter for linter
                                        json(), // JSON syntax highlighting
                                    ]}
                                    onChange={HandleCodeEditorChange}
                                    height="550px"
                                    theme={Theme == 'dark' ? oneDark : 'light'} // Optional: Set a dark theme
                                    className=" text-slate-800 dark:text-slate-300 overflow-y-auto w-full max-w-[270px] min-w-full xs:max-w-[300px] "
                                />

                                {/* progressLevel buttons */}
                                <div className=" flex flex-row flex-wrap gap-2 w-[90%] max-w-[600px] mx-auto justify-around">
                                    <button onClick={() => ToongleFirstStepLeve2('back')} className={`  py-2 cursor-pointer  disabled:cursor-not-allowed  disabled:bg-gray-600 disabled:opacity-60 px-3 min-w-[80px] disabled:shadow-transparent mx-auto mb-auto text-sm text-gray-900 rounded-md bg-transparent transition-all duration-300 shadow-slate-600/90 dark:shadow-gray-400/90 border-opacity-80 hover:border-opacity-100 shadow-xs hover:py-3 dark:text-white`}>Back</button>
                                    {
                                        PostContentContainer.LoadingVideoList == true ? 
                                            <span className="loading mx-auto dark:bg-slate-400 bg-slate-700 loading-spinner loading-md"></span>
                                        :
                                            <button disabled={false} onClick={() => ToongleFirstStepLeve2('next')} className={` py-2 cursor-pointer  disabled:cursor-not-allowed  disabled:bg-gray-600 disabled:opacity-60 px-3 min-w-[80px] disabled:shadow-transparent mx-auto mb-auto text-sm text-gray-900 rounded-md bg-transparent transition-all duration-300 shadow-blue-600/90 dark:shadow-sky-600/90 border-opacity-80 hover:border-opacity-100 shadow-xs hover:py-3 dark:text-white `}>Verified</button>
                                    }

                                </div>
                            </div>
                            
                        </div>
                    </div>
                    <div className={` ${PostContentContainer.progressLevel > 1  ? ' collapse-arrow collapse' : ' hidden'}  transition-all duration-300  rounded-xl dark:bg-slate-500/40 bg-slate-400 `}>
                        <input type="radio" name="my-accordion-2" />
                        <div className="collapse-title text-xl font-medium flex flex-row justify-between ">
                            Content Creation 
                            <small className=" text-xs my-auto opacity-70 dark:opacity-60" >
                                <sup>2</sup>/ <sub>3</sub> 
                            </small>
                        </div>  
                        {/*Content*/}
                        <div className="collapse-content ">
                             {/* steps display container */}
                            <ul className= {`steps transition-all w-full gap-4 text-slate-700 dark:text-slate-400 duration-300 mx-auto `}>
                                    <li className={`step ${PostContentContainer.SecondStepLevel == 1 ?'step-primary' : PostContentContainer.SecondStepLevel > 1 ? ' step-success' : 'step-neutral' } `}>Imaging</li>
                                    <li className={`step ${PostContentContainer.SecondStepLevel == 2 ?'step-primary' : PostContentContainer.SecondStepLevel > 2 ? ' step-success' : 'step-neutral'}  `}>voicing</li>
                                
                            </ul>
                            {/* imaging */}
                            <div className={` w-full ${PostContentContainer.SecondStepLevel == 1 ? 'flex flex-col' : 'hidden'} justify-around h-[200px] min-h-fit  gap-3 `}  >
                                <p className=" text-sm py-1 text-slate-800 dark:text-slate-400 " >Create images</p>
                                {/* progressLevel buttons */}
                                <div className=" flex flex-row flex-wrap gap-2  w-[90%] max-w-[600px] mx-auto justify-around">
                                    {
                                        PostContentContainer.LoadingVideoList == true ? 
                                            <span className="loading mx-auto dark:bg-slate-400 bg-slate-700 loading-spinner loading-md"></span>
                                        :
                                            <button disabled={false} onClick={() => ToongleSecondProgressLevel('Create')} className={` py-2 cursor-pointer  disabled:cursor-not-allowed  disabled:bg-gray-600 disabled:opacity-60 px-3 min-w-[80px] disabled:shadow-transparent mx-auto mb-auto text-sm text-gray-900 rounded-md bg-transparent transition-all duration-300 shadow-blue-600/90 dark:shadow-sky-600/90 border-opacity-80 hover:border-opacity-100 shadow-xs hover:py-3 dark:text-white `}>Create</button>
                                    }
                                </div>
                            </div>
                            {/* voicing */}
                            <div className={` w-full ${PostContentContainer.SecondStepLevel == 2 ? 'flex flex-col justify-start' : 'hidden'} h-[200px] min-h-fit  gap-3 `}  >
                                {/*image carousels */}
                                <p className=" text-sm py-1 text-slate-800 dark:text-slate-400 " >Image previews</p>
                                <div className="flex flex-col sm:flex-row gap-1 justify-center w-full">
                                    <div className=" w-fit h-fit overflow-hidden sm:mx-0 mx-auto" >
                                        <div onTouchStart={handleTouchImageStart } onTouchEnd={handleTouchImageEnd } style={{transform: `translateX(-${SelectedVideoImageCarousel * 100}%)`}}  className=" rounded-sm flex flex-row h-fit mx-auto  transition-all ease-in-out m-auto duration-300 bg-transparent w-full max-w-[250px] xs:max-w-xs overflow-visible " >{MapImageCarousels}</div>
                                    </div>
                                    {/* arrow div */}
                                    <div className=" flex flex-row sm:text-2xl w-[80%] sm:w-fit sm:min-w-fit md:justify-end mx-auto  sm:my-auto justify-center dark:text-gray-400 text-slate-700 text-base gap-10 py-3 mb-auto " >
                                        <LuCornerUpLeft  onClick={() => ScrollVideoImage('back')} className=" cursor-pointer  hover:text-white bg-transparent transition-all duration-300" />
                                        <LuCornerUpRight  onClick={() => ScrollVideoImage('next')} className=" cursor-pointer  hover:text-white bg-transparent transition-all duration-300" />
                                        
                                    </div>
                                </div>
                                {/* custom scripting */}
                                <p className=" text-sm py-1 text-slate-800 dark:text-slate-400 " >Bellow is a custom 60 sec script you can use to generate your audio</p>
                                <div className={` ${PostContentContainer.LoadingVideoList == true ? 'invisible' : 'visible'} flex flex-row w-full justify-start sm:w-fit gap-3`}>
                                    <button onClick={() => copyToClipboard(PostContentContainer.CustomAiAdioScript)} data-tip="Copy script"  className={` cursor-pointer tooltip tooltip-right w-10 min-w-5 h-6 shadow-xs rounded-md shadow-slate-200 hover:shadow-slate-500 dark:hover:shadow-slate-200 transition-all duration-300 dark:shadow-slate-500 bg-transparent `} >
                                        <MdContentCopy   className=" my-auto text-sm mx-auto text-slate-200 transition-all duration-300 "  role="button" />
                                    </button>
                                    <textarea className=" text-sm w-full resize-none min-h-[80px] shadow-xs p-1 rounded-sm dark:text-slate-300 text-slate-600  text-ellipsis " readOnly value={PostContentContainer.CustomAiAdioScript}></textarea>
                                </div>
                                {/* upload */}
                                <p className=" text-sm py-1 text-slate-800 dark:text-slate-400 " >Upload audio to be merged with images created</p>
                                <div className="flex flex-col justify-start gap-3 w-full h-fit" >
                                    <input onChange={ToogleAudioUpload} ref={AiVoiceRef} className=" hidden" accept="audio/*"  type="file" />
                                    <div className="flex flex-col sm:flex-row gap-2 justify-between w-full" >
                                        <div className={` ${PostContentContainer.LoadingVideoList == true ? 'invisible' : 'visible'} flex flex-row w-full justify-start sm:w-fit gap-3`}>
                                            <button onClick={() => ClickUploadRepository('click')} data-tip="Upload audio"  className={` cursor-pointer tooltip tooltip-right w-10 min-w-14 h-10 shadow-xs rounded-md shadow-slate-200 hover:shadow-slate-500 dark:hover:shadow-slate-200 transition-all duration-300 dark:shadow-slate-500 bg-transparent `} >
                                                <BsUpload  className=" my-auto text-sm mx-auto text-slate-200 transition-all duration-300 "  role="button" />
                                            </button>
                                            <input className=" text-sm w-fit min-w-fit max-w-[200px] dark:text-slate-300 text-slate-600  text-ellipsis " readOnly value={`name: ${AudioUpload.Name}`} />
                                        </div>

                                        <audio controlsList="nodownload"  className=" w-full sm:mx-auto max-w-xs py-2 px-1 " id="AudioPreviewTag" controls src={AudioUpload.src}></audio>
                                        <p disabled={PostContentContainer.LoadingVideoList == true} onClick={ClearUplaodedAudio} className={` ${PostContentContainer.LoadingVideoList == true ? 'invisible' : 'visible'} dark:text-slate-400 text-slate-500 hover:text-red-200/60 dark:hover:text-red-300/80 transition-all duration-200 underline underline-offset-2 cursor-pointer w-fit ml-auto mr-2 `} >clear</p>
                                    </div>
                                </div>
                                <div className=" flex flex-row flex-wrap gap-2 w-[90%] max-w-[600px] mx-auto mt-auto justify-around">
                                    <button onClick={() => ToongleSecondProgressLevel('back')} className={`  py-2 cursor-pointer  disabled:cursor-not-allowed  disabled:bg-gray-600 disabled:opacity-60 px-3 min-w-[80px] disabled:shadow-transparent mx-auto mb-auto text-sm text-gray-900 rounded-md bg-transparent transition-all duration-300 shadow-slate-600/90 dark:shadow-gray-400/90 border-opacity-80 hover:border-opacity-100 shadow-xs hover:py-3 dark:text-white`}>Back</button>

                                    {
                                        PostContentContainer.LoadingVideoList == true ? 
                                            <span className="loading mx-auto dark:bg-slate-400 bg-slate-700 loading-spinner loading-md"></span>
                                        :
                                            <button disabled={AudioUpload.file == null} onClick={() => ToongleSecondProgressLevel('Merge')} className={` py-2 cursor-pointer  disabled:cursor-not-allowed  disabled:bg-gray-600 disabled:opacity-60 px-3 min-w-[80px] disabled:shadow-transparent mx-auto mb-auto text-sm text-gray-900 rounded-md bg-transparent transition-all duration-300 shadow-blue-600/90 dark:shadow-sky-600/90 border-opacity-80 hover:border-opacity-100 shadow-xs hover:py-3 dark:text-white `}>Merge</button>
                                    }
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className={` ${PostContentContainer.progressLevel > 2  ? ' collapse-arrow collapse' : 'hidden'} rounded-xl dark:bg-slate-500/40 bg-slate-400 `} >
                        <input type="radio" name="my-accordion-2" />
                        <div className="collapse-title text-xl font-medium flex flex-row justify-between ">
                            Post 
                            <small className=" text-xs my-auto opacity-70 dark:opacity-60" >
                                <sup>3</sup>/ <sub>3</sub> 
                            </small>
                        </div>                        
                        <div className="collapse-content">
                            {/* steps display container */}
                            <ul className= {`steps transition-all w-full gap-4 text-slate-700 dark:text-slate-400 duration-300 mx-auto `}>
                                <li className={`step ${PostContentContainer.ThirdStepLevel == 1 ?'step-primary' : PostContentContainer.ThirdStepLevel > 1 ? ' step-success' : 'step-neutral' } `}>Confirm</li>
                                <li className={`step ${PostContentContainer.ThirdStepLevel == 2 ?'step-primary' : PostContentContainer.ThirdStepLevel > 2 ? ' step-success' : 'step-neutral'}  `}>Logs</li>
                            
                            </ul>
                            {/* confirm upload submission */}
                            <div className={` w-full ${PostContentContainer.ThirdStepLevel == 1 ? 'flex flex-col' : 'hidden'} h-[200px] min-h-fit mt-4  gap-3 `}  >
                                <p className=" text-sm py-1 text-slate-800 dark:text-slate-400 " >Review your video</p>
                                <video controls className={`${AiVideoMergeUrl == null || AiVideoMergeUrl == false || AiVideoMergeUrl == '' ? 'hidden' : 'flex'}`} src={`${import.meta.env.VITE_APP_API_URL}/media/${AiVideoMergeUrl}`} onError={HandleAiVideoUrlError}></video>
                                <img className={`${AiVideoMergeUrl == null || AiVideoMergeUrl == false || AiVideoMergeUrl == '' ? 'flex mask mask-squircle max-h-80 max-w-80 mx-auto lg:mr-auto lg:ml-0 ' : 'hidden'}`} src={`${import.meta.env.VITE_APP_API_URL}/media/${`media unavailable ${Theme}.jpg`}`}  />
                                {/* progressLevel buttons */}
                                <p className=" text-sm py-1 text-slate-800 dark:text-slate-400 " >Upload to {PostContentContainer.SelectedSocialMediaType}</p>
                                <div className=" flex flex-row flex-wrap gap-2 mt-auto w-[90%] max-w-[600px] mx-auto justify-around">
                                    {
                                        PostContentContainer.LoadingVideoList == true ? 
                                            <span className="loading mx-auto dark:bg-slate-400 bg-slate-700 loading-spinner loading-md"></span>
                                        :
                                            <button disabled={false} onClick={() => ToongleThirdProgressLevel('Upload')} className={` py-2 cursor-pointer  disabled:cursor-not-allowed  disabled:bg-gray-600 disabled:opacity-60 px-3 min-w-[80px] disabled:shadow-transparent mx-auto mb-auto text-sm text-gray-900 rounded-md bg-transparent transition-all duration-300 shadow-blue-600/90 dark:shadow-sky-600/90 border-opacity-80 hover:border-opacity-100 shadow-xs hover:py-3 dark:text-white `}>Upload</button>
                                    }
                                </div>

                            </div>
                            {/* logs from submission */}
                            <div className={` w-full ${PostContentContainer.ThirdStepLevel == 2 ? 'flex flex-col' : 'hidden'} h-[200px] min-h-fit mt-4  gap-3 `}  >
                                <p className=" text-sm py-1 my-auto text-slate-800 dark:text-slate-400 " >Video successfuly uploaded</p>
                                <p className=" text-sm py-1 text-slate-800 dark:text-slate-400 " >Your uploaded video id</p>
                                <div className={` ${PostContentContainer.LoadingVideoList == true ? 'invisible' : 'visible'} flex flex-row w-full justify-start sm:w-fit gap-3`}>
                                    <button onClick={() => copyToClipboard(PostContentContainer.UploadedVideoId)} data-tip="Copy script"  className={` cursor-pointer tooltip tooltip-right w-10 min-w-5 h-6 shadow-xs rounded-md shadow-slate-200 hover:shadow-slate-500 dark:hover:shadow-slate-200 transition-all duration-300 dark:shadow-slate-500 bg-transparent `} >
                                        <MdContentCopy   className=" my-auto text-sm mx-auto text-slate-200 transition-all duration-300 "  role="button" />
                                    </button>
                                    <input className=" text-sm w-full min-h-fit shadow-xs p-2 rounded-sm dark:text-slate-300 text-slate-600  text-ellipsis " readOnly value={PostContentContainer.UploadedVideoId} />
                                </div>
                                {/* progressLevel buttons */}
                                <div className=" flex flex-row flex-wrap gap-2 mt-auto w-[90%] max-w-[600px] mx-auto justify-around">
                                    <button disabled={false} onClick={() => ToongleThirdProgressLevel('Reset')} className={` py-2 cursor-pointer  disabled:cursor-not-allowed  disabled:bg-gray-600 disabled:opacity-60 px-3 min-w-[80px] disabled:shadow-transparent mx-auto mb-auto text-sm text-gray-900 rounded-md bg-transparent transition-all duration-300 shadow-blue-600/90 dark:shadow-sky-600/90 border-opacity-80 hover:border-opacity-100 shadow-xs hover:py-3 dark:text-white `}>Restart</button>
                                </div>

                            </div>
                        </div>
                    </div>

                </div>
            </section>
        </div>
    )
};

const mapStateToProps =  state => ({
    isAuthenticated:state.auth.isAuthenticated,
    
})    
export default connect(mapStateToProps,{PromptMergeVideos,FetchUserProfile})(PostContentPage)
