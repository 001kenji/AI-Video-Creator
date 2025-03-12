import React, { Profiler, useEffect, useLayoutEffect, useRef, useState } from "react";
import '../App.css'
import { FetchUserProfile } from "../actions/profile.jsx";
import { useForm } from "react-hook-form";
import { PromptMergeVideos,UploadAudioToVideoAudios,PromptMergeAudioToVideo } from "../actions/ai";
import { oneDark } from "@codemirror/theme-one-dark";
import CodeMirror from '@uiw/react-codemirror';
import { BsUpload } from "react-icons/bs";
import { MdContentCopy } from "react-icons/md";
import { json } from "@codemirror/lang-json";
import { linter, lintGutter } from "@codemirror/lint";
import { LuCornerUpLeft } from "react-icons/lu";
import Typist from 'react-typist';
import { IoChevronUpOutline, IoChevronDownOutline } from "react-icons/io5";
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
import { AiVideoMergeUrlReducer, ProgressInformationReducer, RetryNumberOfRequestMadeReducer, RetryRequestScopeReducer, RetryRequestThrottledReducer } from "../actions/types";
// using argon2 pashing for both javascript and py
//const argon2 = require('argon2');
const PostContentPage = ({isAuthenticated,PromptMergeVideos,FetchUserProfile,UploadAudioToVideoAudios,PromptMergeAudioToVideo}) => {
    const {register,formState,reset,getValues,setValue,watch} = useForm({
        defaultValues : {
            'AIprompt' : '',
            'ClearServer' : false         
        },
        mode : 'all'
    })
    const { extrainfo } = useParams();
    const dispatch = useDispatch()
    const db = useSelector((state) => state.auth.user)  
    const UserEmail  = db != null ? db.email : 'gestuser@gmail.com'
    const UserID  = db != null ? db.id : ''
    const [AudioUpload,SetAudioUpload] = useState([])
    const [OneForAllAudioUpload,SetOneForAllAudioUpload] = useState({
        'file' : null,
        'Name' : '',
        'src' : ''
    })
    const ProfileDB = useSelector((state) => state.ProfileReducer.ProfileAbout)
    const ProfileYoutubeChannels = useSelector((state) => state.ProfileReducer.ProfileYoutubeChannels)
    const [SelectedtokenPathName,SetSelectedtokenPathName] = useState('token.json')
    const [ProfilePicturePhoto,SetProfilePicturePhoto] = useState( db != null ? db.ProfilePic : ProfileTestImg)
    const AiVideoMergeUrl = useSelector((state) => state.AiReducer.AiVideoMergeUrl)
    const AudioToVideoTranscription = useSelector((state) => state.AiReducer.AudioToVideoTranscription)
    const FullAudioToVideoTranscription = useSelector((state) => state.AiReducer.FullAudioToVideoTranscription)
    const AudioToVideoTranscriptionStatus = useSelector((state) => state.AiReducer.AudioToVideoTranscriptionStatus)
    const RetryRequestScope = useSelector((state) => state.AiReducer.RetryRequestScope)
    const ProgressInformation = useSelector((state) => state.AiReducer.ProgressInformation)
    const RetryNumberOfRequestMade = useSelector((state) => state.AiReducer.RetryNumberOfRequestMade)
    const RetryRequestThrottled = useSelector((state) => state.AiReducer.RetryRequestThrottled)
    const [MaximumRetryNumber,SetMaximumRetryNumber] = useState(3)
    const [MediaGallary,SetMediaGallary] = useState({
        'type' : '',
        'src' : '',
        'show' : false,
    })
    const AiVoiceRef = useRef(null)
    const AiAudioToVoiceRef = useRef(null)
    const [AudioToVideoContainer,SetAudioToVideoContainer] = useState({
        'audioFiles' : [],
        'ShowAudioToVideoContainer' : false
    })
    const [PostContentContainer,SetPostContentContainer] = useState({
        'FirstStepLevel' : 1,
        'SecondStepLevel' : 1,
        'ThirdStepLevel' : 1,
        'progressLevel' : 1,
        'LoadingVideoList' : false,
        'CustomAiAdioScript' : '',
        'SelectedSocialMediaType' : 'youtube',
        'MaximumSocialMediaSelected' : 1,
        'ModeValue' : 'AI',
        'SocialMediaNumberVideosOptions' : [],
        'SocialMediaNumberImagesOptions' : [],
        'VideoAudioModeOptions' : [],
        'VideoAudioModeSelectedOptions' : [],
        'VideoListDetails' : ``,
        'SelectedAudioClassificationOptions' : [],
        'VideoListDetailsWithImages' : [],
        'UploadedVideoId' : [],
        'ClearServer' : true
    })
    const [AiPageSelected,SetAiPageSelected] = useState('VoiceToVideo')  //VoiceToVideo //ImageToVideo
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
    const SocialMediaNumberImagesOptions = [
        { value: "1", label: "1 image",name : 'SocialMediaNumberImagesOptions' },
        { value: "2", label: "2 images",name : 'SocialMediaNumberImagesOptions' },
        { value: "3", label: "3 images",name : 'SocialMediaNumberImagesOptions' },
        { value: "4", label: "4 images",name : 'SocialMediaNumberImagesOptions' },
        { value: "5", label: "5 images",name : 'SocialMediaNumberImagesOptions' },
        { value: "6", label: "6 images",name : 'SocialMediaNumberImagesOptions' },
        { value: "7", label: "7 images",name : 'SocialMediaNumberImagesOptions' },
        { value: "8", label: "8 images",name : 'SocialMediaNumberImagesOptions' },
        { value: "9", label: "9 images",name : 'SocialMediaNumberImagesOptions' },
        { value: "10", label: "10 images",name : 'SocialMediaNumberImagesOptions' },
    ];
    const VideoAudioModeOptions = [
        { value: "OneForAll", label: "One audio for all videos",name : 'VideoAudioModeOptions' },
        { value: "AllForAll", label: "Each audio for videos",name : 'VideoAudioModeOptions' },
    ];
    
   const [DisableMergeButton,SetDisableMergeButton] = useState(true)
    const [SelectedVideoImageCarousel,SetSelectedVideoImageCarousel] = useState(0)
    const [SelectedVideoScriptCarousel,SetSelectedVideoScriptCarousel] = useState(0)
    const [SelectedVideoYoutubeIdCarousel,SetSelectedVideoYoutubeIdCarousel] = useState(0)
    const [SelectedVideoAudioUploadContainer,SetSelectedVideoAudioUploadContainer] = useState(0)
    const [SelectedAudioToVideoContainer,SetSelectedAudioToVideoContainer] = useState(0)
    const [SelectedAiVideoMergeUrl,SetSelectedAiVideoMergeUrl] = useState(0)
    const [SelectedVideoImage,SetSelectedVideoImage] = useState(0)
    
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
        
        if (AiVideoMergeUrl.length != 0){
            dispatch({
                type :ProgressInformationReducer,
                payload : 'Videos crated successfuly'
            })
            setTimeout(() => {
                SetPostContentContainer((e)=> {
                    return {
                        ...e,
                        'SecondStepLevel' : 2,
                        'progressLevel' : 3,
                        'ThirdStepLevel' : 1,
                        'LoadingVideoList' : false
                    }
                })
            }, 2000);
            
        }else if((RetryRequestScope == 'MergeAudioToVideoThrottled' || RetryRequestScope == 'failedMergeAudioToVideoRetry') && AiVideoMergeUrl.length == 0 ){
            console.log('trigger request throttled')
            setTimeout(() => {
                SetPostContentContainer((e)=> {
                    return {
                        ...e,
                        'SecondStepLevel' : 2,
                        'progressLevel' : 2,
                        'ThirdStepLevel' : 1,
                        'LoadingVideoList' : false
                    }
                })
                dispatch({
                    type : RetryRequestThrottledReducer,
                    payload : false
                })
                dispatch({
                    type : RetryRequestScopeReducer,
                    payload : null
                })
            }, 4000);
        }else if(RetryRequestScope == 'MergeAudioToVideoRetry' && AiVideoMergeUrl.length == 0 ){
            if(RetryNumberOfRequestMade < 3) {
                console.log('trigger request throttled')
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
                formData.append('email',UserEmail)
                formData.append('SocialMediaType',PostContentContainer.SelectedSocialMediaType)
                var num = Number(RetryNumberOfRequestMade)
                dispatch({
                    type :ProgressInformationReducer,
                    payload : `${ProgressInformation}. No of retries ${num}/${MaximumRetryNumber}`
                })
                console.log('retrying',num)
                formData.append('NumberOfRequestRetry',num)
                setTimeout(() => {
                    PromptMergeAudioToVideo(formData)
                }, 2000);
            }            

        }
    },[AiVideoMergeUrl,RetryRequestScope])

    useEffect(() => {
        
        if(RetryRequestScope == 'MergeVideo'){
            if(RetryNumberOfRequestMade >= 3){
                dispatch({
                    type : RetryRequestScopeReducer,
                    payload : null
                })
                dispatch({
                    type :ProgressInformationReducer,
                    payload : 'Maximum number of retries reached 🥺. Try again later'
                })
                setTimeout(() => {
                    SetPostContentContainer((e)=> {
                        return {
                            ...e,
                            'SecondStepLevel' : 2,
                            'progressLevel' : 2,
                            'ThirdStepLevel' : 1,
                            'LoadingVideoList' : false
                        }
                    })
                }, 4000);
                dispatch({
                    type :RetryNumberOfRequestMadeReducer,
                    payload : 0
                })
                
            }else if(RetryNumberOfRequestMade < 3) {
                console.log('current streak request: ',RetryNumberOfRequestMade)
                if(PostContentContainer.VideoAudioModeSelectedOptions == ''){
                    ShowToast('warning','Seams like you haven\'t selected audio mode')
                    return
                }
                
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
                if(PostContentContainer.VideoAudioModeSelectedOptions == 'OneForAll'){
                    formData.append('AudioScope', PostContentContainer.VideoAudioModeSelectedOptions)
                    formData.append('audio',OneForAllAudioUpload.file)
                    formData.append('audioName',OneForAllAudioUpload.Name)
                }else if(PostContentContainer.VideoAudioModeSelectedOptions == 'AllForAll'){
                    formData.append('AudioScope', PostContentContainer.VideoAudioModeSelectedOptions)
                    AudioUpload.forEach((audio, index) => {
                        formData.append(`audio`, audio.file);
                    });
                }
                formData.append('data',JSON.stringify(PostContentContainer.VideoListDetailsWithImages))
                formData.append('email',UserEmail)
                formData.append('SocialMediaType',PostContentContainer.SelectedSocialMediaType)
                var num = Number(RetryNumberOfRequestMade) + 1
                formData.append('NumberOfRequestRetry',num)
                dispatch({
                    type :ProgressInformationReducer,
                    payload : `${ProgressInformation}. No of retries ${num}/${MaximumRetryNumber}`
                })
                console.log('retrying',num)
                setTimeout(() => {
                    PromptMergeVideos(formData)
                }, 2000);
            }
            
        }
    },[RetryRequestScope,RetryNumberOfRequestMade])

    useEffect(() => {
        //console.log('changes detected: ',AudioToVideoTranscription.length)
        if (AudioToVideoTranscription.length != 0){
            // send request for ai body data
            // ShowToast('info','Transcipt are generated. Generating videos body')
            var lengthval = AudioToVideoContainer.audioFiles.length
            var promptConstructed = {
                'socialMedia' : PostContentContainer.SelectedSocialMediaType,
                'prompt' : ` Generate an array of strictly ${lengthval} object. each ${lengthval} object should get its description idea on the following array at the same index position '${FullAudioToVideoTranscription}  ' `,
               
            }
            dispatch({
                type :ProgressInformationReducer,
                payload : 'Transcribe complited. Generating video data. Please hold... '
            })
            requestWsStream('RequestAITranscriptResponse',promptConstructed)
            // SetPostContentContainer((e)=> {
            //     return {
            //         ...e,
            //         'FirstStepLevel' : 2,
            //         'progressLevel' : 1,
            //         'LoadingVideoList' : false
            //     }
            // })
            
        }
        if(AudioToVideoTranscriptionStatus == 'failed'){
            SetPostContentContainer((e)=> {
                return {
                    ...e,
                    'FirstStepLevel' : 1,
                    'progressLevel' : 1,
                    'LoadingVideoList' : false
                }
            })
        }else if(AudioToVideoTranscriptionStatus == 'failedRetry'){
            dispatch({
                type :ProgressInformationReducer,
                payload : 'Maximum number of retries reached 🥺. Try again later'
            })
            setTimeout(() => {
                dispatch({
                    type :RetryNumberOfRequestMadeReducer,
                    payload : null
                })
                SetPostContentContainer((e)=> {
                    return {
                        ...e,
                        'FirstStepLevel' : 1,
                        'progressLevel' : 1,
                        'LoadingVideoList' : false
                    }
                })
            }, 4000);
            
            
        }else if(AudioToVideoTranscriptionStatus == 'failedThrottled'){
            
            setTimeout(() => {
                dispatch({
                    type :RetryNumberOfRequestMadeReducer,
                    payload : null
                })
                SetPostContentContainer((e)=> {
                    return {
                        ...e,
                        'FirstStepLevel' : 1,
                        'progressLevel' : 1,
                        'LoadingVideoList' : false
                    }
                })
            }, 6000);
            
            
        }else if(AudioToVideoTranscriptionStatus == 'retry' && RetryRequestThrottled == false && RetryNumberOfRequestMade != null){
            if(Number(RetryNumberOfRequestMade) <= 3 ){
                SetPostContentContainer((e)=> {
                    return {
                        ...e,
                        'FirstStepLevel' : 1,
                        'progressLevel' :  1,
                        'LoadingVideoList' : true
                    }
                })
                const formData = new FormData()
                AudioToVideoContainer.audioFiles.forEach((audio, index) => {
                    formData.append(`audio`, audio.file);
                });
                formData.append('email',UserEmail)
                formData.append('SocialMediaType',PostContentContainer.SelectedSocialMediaType)
                formData.append('NumberOfImages',PostContentContainer.SocialMediaNumberImagesOptions[0].value)

                var num = Number(RetryNumberOfRequestMade)
                //console.log('invoking: ',num)
                formData.append('NumberOfRequestRetry',num)
                dispatch({
                    type :ProgressInformationReducer,
                    payload : `${ProgressInformation}. No of retries ${num}/${MaximumRetryNumber}`
                })
                setTimeout(() => {
                  UploadAudioToVideoAudios(formData)  
                }, 3000);
                
            }
        }
    },[AudioToVideoTranscription,FullAudioToVideoTranscription])

    useEffect(() => {
        // console.log('called')
        if(PostContentContainer.VideoAudioModeSelectedOptions == 'OneForAll'){
            if(OneForAllAudioUpload.file == null){
                SetDisableMergeButton(true)
            }else {
                SetDisableMergeButton(false)
            }
        }else if(PostContentContainer.VideoAudioModeSelectedOptions == 'AllForAll'){
            var disable = false
            
            for (let i = 0; i < AudioUpload.length; i++) {
                if(AudioUpload[i]){
                    // console.log(AudioUpload[i].file)
                    if(AudioUpload[i].file == null){
                        disable = true
                        break
                    }
                    
                }                
            }
            if(AudioUpload.length != PostContentContainer.VideoListDetailsWithImages.length){
                disable = true
            }
            SetDisableMergeButton(disable)
        }else {
            SetDisableMergeButton(true)
        }
    },[PostContentContainer.VideoAudioModeOptions,AudioUpload,OneForAllAudioUpload])

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
        
    const ToogleAudioUpload = (idval,position,AudioPreviewTag,AudioUploadName,event) => {
        if (!event || !event.target || !event.target.files) {
            ShowToast('warning','Seams like your upload is misbehaving')
            console.log("Invalid event");
            return;
        }

        const file = event.target.files[0];
        if (!file) {
            ShowToast('warning','Seams like your haven\'t selected any file. Try again')
            console.log("No file selected");
            return;
        }
        const Types = String(file.type).split("/");
        if (Types[0] === "audio") {
            const reader = new FileReader();
            reader.onload = function (e) {
                const newObject = {
                    'file': file,
                    'Name': file.name,
                    'VideoReference': position
                };

                SetAudioUpload((e) => {
                    const updatedArray = [...e];
                    if (updatedArray.length >= position) {
                        updatedArray[position] = newObject;
                    } else {
                        updatedArray[position] = newObject;
                        // updatedArray.push(newObject);
                    }
                    return updatedArray;
                });
                document.getElementById(AudioUploadName).value = file.name
                document.getElementById(AudioPreviewTag).src = e.target.result;
            };
            reader.readAsDataURL(file);
            document.getElementById(idval).src = ''
        }

    }    
    const ToogleOneForAllAudioUpload = (val) => {
       
        var File =  AiVoiceRef.current.files[0] ?  AiVoiceRef.current.files[0] : val
       
        if(File) {
            var Types = String(File.type).split('/')
            if(Types[0] == 'audio'){
                const render = new FileReader()
                render.onload = function (e) {
                    SetOneForAllAudioUpload((val) => {
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
    const ToogleAiAudioToVoiceRefUpload = () => {
       
        var File =  AiAudioToVoiceRef.current.files
       
        if(File) {
            const newAudioFiles = Array.from(File).map((file) => ({
                name: file.name,
                src: URL.createObjectURL(file),
                file : file
            }));
            
                SetAudioToVideoContainer((e) => {
                return {
                    ...e,
                    'audioFiles' : newAudioFiles,
                    'ShowAudioToVideoContainer' : true
                }
                });
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
   
    const requestWsStream = (msg = null,body = null,NumberOfRequestRetry = 0) => {    
       
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
                    
                    var videoList = JSON.stringify(Listval , null, 2);
                    dispatch({
                        type :ProgressInformationReducer,
                        payload : 'Successfuly generated'
                    })
                    setTimeout(() => {
                        SetPostContentContainer((e) => {
                            return {
                                ...e,
                                'VideoListDetails' : videoList,
                                'LoadingVideoList' : false,
                                'FirstStepLevel' : 2,
                                'progressLevel' : 1,
                            }
                        })
                        dispatch({
                            type :ProgressInformationReducer,
                            payload : ''
                        })
                    }, 2000);
                    
                }else if (val['type'] == 'retry'){
                    var NumberOfRequestRetry =  val['NumberOfRequestRetry']
                    var nextNum = Number(NumberOfRequestRetry) + 1
                    if(NumberOfRequestRetry < MaximumRetryNumber){
                        console.log(NumberOfRequestRetry)
                        dispatch({
                            type :ProgressInformationReducer,
                            payload : `${val['result']}. Retrying your request ${NumberOfRequestRetry}/${MaximumRetryNumber}`
                        })
                        var promptConstructed = {
                            'socialMedia' : PostContentContainer.SelectedSocialMediaType,
                            'prompt' : ` Generate an array of ${PostContentContainer.SocialMediaNumberVideosOptions[0].value} objects based on this idea '${getValues('AIprompt')} ' `,
                           
                        }
                        
                        setTimeout(() => {
                            requestWsStream('RequestAIResponse',promptConstructed,nextNum)
                        }, 4000);
                    }else {
                        console.log(NumberOfRequestRetry)
                        dispatch({
                            type :ProgressInformationReducer,
                            payload : 'Maximum number of retry reached. Try again later'
                        })
                        setTimeout(() => {
                            SetPostContentContainer((e) => {
                                return {
                                    ...e,
                                    'LoadingVideoList' : false,
                                    'FirstStepLevel' : 1,
                                    'progressLevel' : 1,
                                }
                            })
                        }, 4000);
                    }
                    
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
            
            }else if(data.type == 'RequestAITranscriptResponse') {
            var val = data.message
            if (val['type'] == 'success') {
                var Listval = val['result']
                if(Listval.length != AudioToVideoTranscription.length){
                    SetPostContentContainer((e) => {
                        return {
                            ...e,
                            'LoadingVideoList' : false,
                            'FirstStepLevel' : 1,
                            'progressLevel' : 1,
                        }
                    })
                    console.log('mismatch',Listval,AudioToVideoTranscription)
                    ShowToast('warning',"Seams there is no cosistensy between transcripts and videos")
                    return
                }
                for (let i = 0; i < Listval.length; i++) {
                    Listval[i]['ImageList'] = AudioToVideoTranscription[i]
                    Listval[i]['audio'] = AudioToVideoContainer.audioFiles[i].name
                    
                }
                var videoList = JSON.stringify(Listval , null, 2);
                dispatch({
                    type :ProgressInformationReducer,
                    payload : 'Data generated. '
                })
                setTimeout(() => {
                    SetPostContentContainer((e) => {
                        return {
                            ...e,
                            'VideoListDetails' : videoList,
                            'LoadingVideoList' : false,
                            'FirstStepLevel' : 2,
                            'progressLevel' : 1,
                        }
                    })
                }, 2000);
                
            }else if (val['type'] == 'retry'){
                var NumberOfRequestRetry =  val['NumberOfRequestRetry']
                var nextNum = Number(NumberOfRequestRetry) + 1
                if(NumberOfRequestRetry < MaximumRetryNumber){
                    console.log(NumberOfRequestRetry)
                    dispatch({
                        type :ProgressInformationReducer,
                        payload : `${val['result']}. Retrying your request ${NumberOfRequestRetry}/${MaximumRetryNumber}`
                    })
                    
                    var promptConstructed = {
                        'socialMedia' : PostContentContainer.SelectedSocialMediaType,
                        'prompt' : ` Generate an array of strictly ${lengthval} object. each ${lengthval} object should get its description idea on the following array at the same index position '${FullAudioToVideoTranscription}  ' `,
                       
                    }
                    setTimeout(() => {
                        requestWsStream('RequestAITranscriptResponse',promptConstructed,nextNum)
                    }, 4000);
                }else {
                    console.log(NumberOfRequestRetry)
                    dispatch({
                        type :ProgressInformationReducer,
                        payload : 'Maximum number of retry reached. Try again later'
                    })
                    setTimeout(() => {
                        SetPostContentContainer((e) => {
                            return {
                                ...e,
                                'LoadingVideoList' : false,
                                'FirstStepLevel' : 1,
                                'progressLevel' : 1,
                            }
                        })
                    }, 4000);
                }
                
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
                    dispatch({
                        type :ProgressInformationReducer,
                        payload : 'Images created successfuly'
                    })
                    setTimeout(() => {
                        SetPostContentContainer((e) => {
                            return {
                                ...e,
                                'VideoListDetailsWithImages' : val['data'],
                                'LoadingVideoList' : false,
                                'SecondStepLevel' : 2,
                                'progressLevel' : 2,
                            }
                        })
                    }, 2000);
                    
                    // ShowToast(val['type'],val['result'])
                }else if (val['type'] == 'retry'){
                    var NumberOfRequestRetry =  val['NumberOfRequestRetry']
                    var nextNum = Number(NumberOfRequestRetry) + 1
                    if(NumberOfRequestRetry < MaximumRetryNumber){
                        console.log(NumberOfRequestRetry)
                        dispatch({
                            type :ProgressInformationReducer,
                            payload : `${val['result']}. Retrying your request ${NumberOfRequestRetry}/${MaximumRetryNumber}`
                        })
                        
                        
                        setTimeout(() => {
                            requestWsStream('RequestCreateImages',null,nextNum)
                        }, 4000);
                    }else {
                        console.log(NumberOfRequestRetry)
                        dispatch({
                            type :ProgressInformationReducer,
                            payload : 'Maximum number of retry reached. Try again later'
                        })
                        setTimeout(() => {
                            SetPostContentContainer((e) => {
                                return {
                                    ...e,
                                    'LoadingVideoList' : false,
                                    'SecondStepLevel' : 1,
                                    'progressLevel' : 2,
                                }
                            })
                        }, 4000);
                    }
                    
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
            }else if(data.type == 'RequestCreateImagesTranscript'){
                var val = data.message
                if (val['type'] == 'success') {

                // console.log(typeof(videoList),videoList)
                dispatch({
                    type :ProgressInformationReducer,
                    payload : 'Images created successfuly'
                })
                setTimeout(() => {
                    SetPostContentContainer((e) => {
                        return {
                            ...e,
                            'VideoListDetailsWithImages' : val['data'],
                            'LoadingVideoList' : false,
                            'SecondStepLevel' : 2,
                            'progressLevel' : 2,
                        }
                    })
                }, 2000);
                // ShowToast(val['type'],val['result'])
                }else if (val['type'] == 'retry'){
                    var NumberOfRequestRetry =  val['NumberOfRequestRetry']
                    var nextNum = Number(NumberOfRequestRetry) + 1
                    if(NumberOfRequestRetry < MaximumRetryNumber){
                        console.log(NumberOfRequestRetry)
                        dispatch({
                            type :ProgressInformationReducer,
                            payload : `${val['result']}. Retrying your request ${NumberOfRequestRetry}/${MaximumRetryNumber}`
                        })
                        
                        
                        setTimeout(() => {
                            requestWsStream('RequestCreateImagesTranscript',null,nextNum)
                        }, 4000);
                    }else {
                        console.log(NumberOfRequestRetry)
                        dispatch({
                            type :ProgressInformationReducer,
                            payload : 'Maximum number of retry reached. Try again later'
                        })
                        setTimeout(() => {
                            SetPostContentContainer((e) => {
                                return {
                                    ...e,
                                    'LoadingVideoList' : false,
                                    'SecondStepLevel' : 1,
                                    'progressLevel' : 2,
                                }
                            })
                        }, 4000);
                    }
                    
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
                dispatch({
                    type :ProgressInformationReducer,
                    payload : 'Videos uploaded successfuly.✅'
                })
                setTimeout(() => {
                    SetPostContentContainer((e) => {
                        return {
                            ...e,
                            'ThirdStepLevel' : 2,
                            'progressLevel' : 3,
                            'LoadingVideoList' : false,
                            'UploadedVideoId' : val.video_id
                        }
                    })
                }, 2000);
               
                dispatch({
                    type : AiVideoMergeUrlReducer,
                    payload : []
                })
                ShowToast(val['type'],val['result'])
                if(db != null){
                    var data = {
                        'scope' : 'ReadProfile',
                        'AccountEmail' : UserEmail,
                        'AccountID' : extrainfo,
                        'IsOwner' : true,
                    }
                    FetchUserProfile(JSON.stringify([data]))
                }  
            }else if (val['type'] == 'retry'){
                var NumberOfRequestRetry =  val['NumberOfRequestRetry']
                var nextNum = Number(NumberOfRequestRetry) + 1
                if(NumberOfRequestRetry < MaximumRetryNumber){
                    console.log(NumberOfRequestRetry)
                    dispatch({
                        type :ProgressInformationReducer,
                        payload : `${val['result']}. Retrying your request ${NumberOfRequestRetry}/${MaximumRetryNumber}`
                    })
                    
                    var mediaType = PostContentContainer.SelectedSocialMediaType
                    setTimeout(() => {
                        requestWsStream('RequestUploadVideos',mediaType,nextNum)
                    }, 4000);
                }else {
                    console.log(NumberOfRequestRetry)
                    dispatch({
                        type :ProgressInformationReducer,
                        payload : 'Maximum number of retry reached. Try again later'
                    })
                    setTimeout(() => {
                        SetPostContentContainer((e) => {
                            return {
                                ...e,
                                'LoadingVideoList' : false,
                                'ThirdStepLevel' : 1,
                                'progressLevel' : 3,
                            }
                        })
                    }, 4000);
                }
                
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
            }else if(data.type == 'RequestClearServer'){
                var val = data.message
                ShowToast(val['type'],val['result'])
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
                        'prompt' : body,
                        'images' : PostContentContainer.SocialMediaNumberImagesOptions[0].value,
                        'NumberOfRequestRetry' : NumberOfRequestRetry
                    })
                )
            }else if(msg == 'RequestAITranscriptResponse') {
                
                WsDataStream.current.send(
                    JSON.stringify({
                        'message' : 'RequestAITranscriptResponse',
                        'email' : UserEmail,
                        'prompt' : body,
                        'images' : PostContentContainer.SocialMediaNumberImagesOptions[0].value,
                        'NumberOfRequestRetry' : NumberOfRequestRetry
                    })
                )
            }else if(msg == 'RequestCreateImages') {
                
                WsDataStream.current.send(
                    JSON.stringify({
                        'message' : 'RequestCreateImages',
                        'email' : UserEmail,
                        'prompt' : PostContentContainer.VideoListDetails,
                        'SocialMediaType' : PostContentContainer.SelectedSocialMediaType,
                        'NumberOfRequestRetry' : NumberOfRequestRetry
                    })
                )
            }else if(msg == 'RequestCreateImagesTranscript') {
                
                WsDataStream.current.send(
                    JSON.stringify({
                        'message' : 'RequestCreateImagesTranscript',
                        'email' : UserEmail,
                        'prompt' : PostContentContainer.VideoListDetails,
                        'SocialMediaType' : PostContentContainer.SelectedSocialMediaType,
                        'NumberOfRequestRetry' : NumberOfRequestRetry
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
                        'NumberOfRequestRetry' : NumberOfRequestRetry,
                        'tokenPathName' : SelectedtokenPathName
                    })
                )
            }else if(msg == 'RequestClearServer') {
                
                WsDataStream.current.send(
                    JSON.stringify({
                        'message' : 'RequestClearServer',
                        'email' : UserEmail,
                        'NumberOfRequestRetry' : NumberOfRequestRetry
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
                        'prompt' : ` Generate an array of ${PostContentContainer.SocialMediaNumberVideosOptions[0].value} objects based on this idea '${getValues('AIprompt')} ' `,
                       
                    }
                    dispatch({
                        type :ProgressInformationReducer,
                        payload : 'Generating your data'
                    })
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
    function ResetPostContentContainer (props){
        if(props != null){
            SetPostContentContainer({
                'FirstStepLevel' : 1,
                'SecondStepLevel' : 1,
                'ThirdStepLevel' : 1,
                'progressLevel' : 1,
                'LoadingVideoList' : false,
                'CustomAiAdioScript' : '',
                'SelectedSocialMediaType' : 'youtube',
                'MaximumSocialMediaSelected' : 1,
                'ModeValue' : 'AI',
                'SocialMediaNumberVideosOptions' : [],
                'SocialMediaNumberImagesOptions' : [],
                'VideoAudioModeOptions' : [],
                'VideoAudioModeSelectedOptions' : [],
                'VideoListDetails' : '',
                'SelectedAudioClassificationOptions' : [],
                'VideoListDetailsWithImages' : [],
                'UploadedVideoId' : [],
                'ClearServer' : true
                
            })
            reset()
            if(AiPageSelected == 'VoiceToVideo'){
                SetAudioToVideoContainer((e) => {
                    return  {
                        ...e,
                        'audioFiles' : [],
                        'ShowAudioToVideoContainer' : false               
                    }
                })
                    
            }

        }
    }
    function ToongleAiPageSelected (props) {
        if(props != null){
            if(AiPageSelected != props){
                SetAiPageSelected(props)
                ResetPostContentContainer('reset')
            }
            
        }
    }
  
    function ToongleSecondProgressLevel(props) {
        dispatch({
            type :RetryNumberOfRequestMadeReducer,
            payload : 0
        })
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
            dispatch({
                type :ProgressInformationReducer,
                payload : 'Creating your images. Once created they will be saved. Please hold '
            })
            requestWsStream('RequestCreateImages',null,0)
        }if(props == 'CreateTranscript'){
            SetPostContentContainer((e)=> {
                return {
                    ...e,
                    'SecondStepLevel' : 1,
                    'progressLevel' : 2,
                    'LoadingVideoList' : true,
                    'VideoListDetailsWithImages' : []
                }
            })
            dispatch({
                type :ProgressInformationReducer,
                payload : 'Creating your images. Once created they will be saved. Please hold '
            })
            requestWsStream('RequestCreateImagesTranscript')
        }else if(props == 'Merge'){
            if(PostContentContainer.VideoAudioModeSelectedOptions == ''){
                ShowToast('warning','Seams like you haven\'t selected audio mode')
                return
            }
          
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
            if(PostContentContainer.VideoAudioModeSelectedOptions == 'OneForAll'){
                formData.append('AudioScope', PostContentContainer.VideoAudioModeSelectedOptions)
                formData.append('audio',OneForAllAudioUpload.file)
                formData.append('audioName',OneForAllAudioUpload.Name)
            }else if(PostContentContainer.VideoAudioModeSelectedOptions == 'AllForAll'){
                formData.append('AudioScope', PostContentContainer.VideoAudioModeSelectedOptions)
                AudioUpload.forEach((audio, index) => {
                    formData.append(`audio`, audio.file);
                });
            }
            formData.append('data',JSON.stringify(PostContentContainer.VideoListDetailsWithImages))
            formData.append('email',UserEmail)
            formData.append('SocialMediaType',PostContentContainer.SelectedSocialMediaType)
            formData.append('NumberOfRequestRetry',0)
            dispatch({
                type :ProgressInformationReducer,
                payload : 'Merging data to video(s). Once created they will be saved'
            })
            PromptMergeVideos(formData)
        }else if(props == 'MergeTranscript'){
            
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
            formData.append('email',UserEmail)
            formData.append('SocialMediaType',PostContentContainer.SelectedSocialMediaType)
            formData.append('NumberOfRequestRetry',0)
            dispatch({
                type :ProgressInformationReducer,
                payload : 'Merging data to video(s). Once created they will be saved'
            })
            PromptMergeAudioToVideo(formData)
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
            if(AiVideoMergeUrl.length == 0){
                ShowToast('warning','Your video url seams to be empty')
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
                dispatch({
                    type :ProgressInformationReducer,
                    payload : 'Uploading videos to youtube. You will be notified shotly. Please hold'
                })
                requestWsStream('RequestUploadVideos',mediaType,0)
            }
            
        }else if (props == 'Reset'){
            if(UserEmail == 'gestuser@gmail.com' || UserEmail == null){
                if(PostContentContainer.ClearServer == true){
                    ShowToast('warning','Unless you login you can\'t clear your server. Uncheck \'Clear\' checkbox to proceed ')    
                    return 
                }
                               
            }
            dispatch({
                type : AiVideoMergeUrlReducer,
                payload : []
            })
            ResetPostContentContainer('reset')
            if(PostContentContainer.ClearServer){
                
                requestWsStream('RequestClearServer')
                
            }
            
        }
    }
    const handleSocialMediaOptionsChange = (selected,val) => {
        //var name = selected[0] ? selected[0].name : selected[0]
        var MaxNumber = 1  
        if (selected.length <= MaxNumber) {
           //console.log((selected))
           if(val.name == 'VideoAudioModeOptions'){
                var value = selected[0] ? selected[0].value : ''
                SetPostContentContainer((e) => {
                    return {
                        ...e,
                        [val.name] : (selected),
                        'VideoAudioModeSelectedOptions' : value
                    }
                })
           }else {
                var value = selected[0] ? selected[0].value : ''
                SetPostContentContainer((e) => {
                    return {
                        ...e,
                        [val.name] : (selected),
                    }
                })
           }
           
            
          
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
            if(PostContentContainer.VideoListDetailsWithImages[SelectedVideoImageCarousel].ImageList){
                if (SelectedVideoImage >= PostContentContainer.VideoListDetailsWithImages[SelectedVideoImageCarousel].ImageList.length - 1) {
                    SetSelectedVideoImage(0);
                } else {
                    SetSelectedVideoImage((e) => e + 1);
                }
            }
            
        } else if (startImageX < endImageX - 50) {
            // User swiped right (Previous item)
            if(PostContentContainer.VideoListDetailsWithImages[SelectedVideoImageCarousel].ImageList){
                if (SelectedVideoImage === 0) {
                    SetSelectedVideoImage(PostContentContainer.VideoListDetailsWithImages[SelectedVideoImageCarousel].ImageList.length - 1)
                } else {
                    SetSelectedVideoImage((e) => e - 1);
                }
            }
            
        }
    };
    function ScrollVideoImage (props){
        if(props == 'back') {
            //console.log(PostContentContainer.VideoListDetailsWithImages[SelectedVideoImageCarousel])
            if(PostContentContainer.VideoListDetailsWithImages[SelectedVideoImageCarousel].ImageList){
                if (SelectedVideoImage === 0) {
                SetSelectedVideoImage(PostContentContainer.VideoListDetailsWithImages[SelectedVideoImageCarousel].ImageList.length - 1)
                } else {
                    SetSelectedVideoImage((e) => e - 1);
                }
            }
            
        }else if(props == 'next'){
            if(PostContentContainer.VideoListDetailsWithImages[SelectedVideoImageCarousel].ImageList){
                if (SelectedVideoImage >= PostContentContainer.VideoListDetailsWithImages[SelectedVideoImageCarousel].ImageList.length - 1) {
                    SetSelectedVideoImage(0);
                } else {
                    SetSelectedVideoImage((e) => e + 1);
                }
            }
           
        }
    }
    function ScrollVideoImageCarousel (props){
        if(props == 'back') {
            //console.log(PostContentContainer.VideoListDetailsWithImages[SelectedVideoImageCarousel])
            if(PostContentContainer.VideoListDetailsWithImages){
                if (SelectedVideoImageCarousel === 0) {
                    SetSelectedVideoImageCarousel(PostContentContainer.VideoListDetailsWithImages.length - 1)
                } else {
                    SetSelectedVideoImageCarousel((e) => e - 1);
                }
            }
            
        }else if(props == 'next'){
            if(PostContentContainer.VideoListDetailsWithImages){
                if (SelectedVideoImageCarousel >= PostContentContainer.VideoListDetailsWithImages.length - 1) {
                    SetSelectedVideoImageCarousel(0);
                } else {
                    SetSelectedVideoImageCarousel((e) => e + 1);
                }
            }
           
        }
    }
    function ScrollVideoScriptCarousel (props){
        if(props == 'back') {
            //console.log(PostContentContainer.VideoListDetailsWithImages[SelectedVideoImageCarousel])
            if(PostContentContainer.VideoListDetailsWithImages){
                if (SelectedVideoScriptCarousel === 0) {
                    SetSelectedVideoScriptCarousel(PostContentContainer.VideoListDetailsWithImages.length - 1)
                } else {
                    SetSelectedVideoScriptCarousel((e) => e - 1);
                }
            }
            
        }else if(props == 'next'){
            if(PostContentContainer.VideoListDetailsWithImages){
                if (SelectedVideoScriptCarousel >= PostContentContainer.VideoListDetailsWithImages.length - 1) {
                    SetSelectedVideoScriptCarousel(0);
                } else {
                    SetSelectedVideoScriptCarousel((e) => e + 1);
                }
            }
           
        }
    }
    function ScrollVideoAudioUploadContainer (props){
        if(props == 'back') {
            //console.log(PostContentContainer.VideoListDetailsWithImages[SelectedVideoImageCarousel])
            if(PostContentContainer.VideoListDetailsWithImages){
                if (SelectedVideoAudioUploadContainer === 0) {
                    SetSelectedVideoAudioUploadContainer(PostContentContainer.VideoListDetailsWithImages.length - 1)
                } else {
                    SetSelectedVideoAudioUploadContainer((e) => e - 1);
                }
            }
            
        }else if(props == 'next'){
            if(PostContentContainer.VideoListDetailsWithImages){
                if (SelectedVideoAudioUploadContainer >= PostContentContainer.VideoListDetailsWithImages.length - 1) {
                    SetSelectedVideoAudioUploadContainer(0);
                } else {
                    SetSelectedVideoAudioUploadContainer((e) => e + 1);
                }
            }
           
        }
    }
    function ScrollSelectedAudioToVideoContainer (props){
        if(props == 'back') {
            //console.log(PostContentContainer.VideoListDetailsWithImages[SelectedVideoImageCarousel])
            if(AudioToVideoContainer.audioFiles){
                if (SelectedAudioToVideoContainer === 0) {
                    SetSelectedAudioToVideoContainer(AudioToVideoContainer.audioFiles.length - 1)
                } else {
                    SetSelectedAudioToVideoContainer((e) => e - 1);
                }
            }
            
        }else if(props == 'next'){
            if(AudioToVideoContainer.audioFiles){
                if (SelectedAudioToVideoContainer >= AudioToVideoContainer.audioFiles.length - 1) {
                    SetSelectedAudioToVideoContainer(0);
                } else {
                    SetSelectedAudioToVideoContainer((e) => e + 1);
                }
            }
           
        }
    }
    function ScrollVideoYoutubeIdCarousel (props){
        if(props == 'back') {
            //console.log(PostContentContainer.VideoListDetailsWithImages[SelectedVideoImageCarousel])
            if(PostContentContainer.UploadedVideoId){
                if (SelectedVideoYoutubeIdCarousel === 0) {
                    SetSelectedVideoYoutubeIdCarousel(PostContentContainer.UploadedVideoId.length - 1)
                } else {
                    SetSelectedVideoYoutubeIdCarousel((e) => e - 1);
                }
            }
            
        }else if(props == 'next'){
            if(PostContentContainer.UploadedVideoId){
                if (SelectedVideoYoutubeIdCarousel >= PostContentContainer.UploadedVideoId.length - 1) {
                    SetSelectedVideoYoutubeIdCarousel(0);
                } else {
                    SetSelectedVideoYoutubeIdCarousel((e) => e + 1);
                }
            }
           
        }
    }
    function ScrollVideoUrlCarousels (props){
        if(props == 'back') {
            //console.log(PostContentContainer.VideoListDetailsWithImages[SelectedVideoImageCarousel])
            if(AiVideoMergeUrl.length != 0){
                if (SelectedAiVideoMergeUrl === 0) {
                    SetSelectedAiVideoMergeUrl(AiVideoMergeUrl.length - 1)
                } else {
                    SetSelectedAiVideoMergeUrl((e) => e - 1);
                }
            }
            
        }else if(props == 'next'){
            if(AiVideoMergeUrl.length != 0){
                if (SelectedAiVideoMergeUrl >= AiVideoMergeUrl.length - 1) {
                    SetSelectedAiVideoMergeUrl(0);
                } else {
                    SetSelectedAiVideoMergeUrl((e) => e + 1);
                }
            }
           
        }
    }
    
    const MapImageCarousels = ({imagelist = []}) => {
        // className= {`mask-square h-fit m-auto min-h-fit  max-w-[250px] rounded-md cursor-pointer max-h-[250px] xs:max-h-[320px] xs:max-w-xs rounded-b-md   `}
        var lists = imagelist.map((items,i) => {
            var imageurl = `${import.meta.env.VITE_APP_API_URL}/media/${UserEmail}/youtube/${items.name}`
            //console.log(imageurl)
            return (
                <img key={i} loading="lazy" onClick={()=>ChangeMediaGallary(imageurl,'image')} className= {`mask-square h-full m-auto min-h-full min-w-full max-h-[250px] xs:max-h-[320px] xs:max-w-xs rounded-md cursor-pointer rounded-b-md   `} src={imageurl || null}  alt="media not found"/>        
            )
        })
        return lists
    }
    function ClickUploadRepository (props) {
        if(props != null){
            document.getElementById(props).click()
        }
    }
    function ClickOneForAllUploadRepository (props) {
            AiVoiceRef.current.click()
    }  
    
    function ToongleFirstStepLeveAudioToVideo(props){
        if(UserEmail == 'gestuser@gmail.com' || UserEmail == null){
            ShowToast('warning','Login to proceed')
            return
        }
        if(props == 'upload'){
            if(PostContentContainer.SocialMediaNumberImagesOptions == ''){
                ShowToast('warning','Seams like you haven\'t selected audio mode')
                return
            }
          
            SetPostContentContainer((e)=> {
                return {
                    ...e,
                    'FirstStepLevel' : 1,
                    'progressLevel' :  1,
                    'LoadingVideoList' : true
                }
            })
            const formData = new FormData()
            AudioToVideoContainer.audioFiles.forEach((audio, index) => {
                formData.append(`audio`, audio.file);
            });
            formData.append('email',UserEmail)
            formData.append('SocialMediaType',PostContentContainer.SelectedSocialMediaType)
            formData.append('NumberOfImages',PostContentContainer.SocialMediaNumberImagesOptions[0].value)
            dispatch({
                type :ProgressInformationReducer,
                payload : 'Uploading and transcribing your audios. Please hold '
            })
            formData.append('NumberOfRequestRetry',0)
            UploadAudioToVideoAudios(formData)
        }
    }
    function ClearUplaodedAudio (ival,position,AudioPreviewTag,AudioUploadName) {
        if(ival != null && AudioPreviewTag != null){
            const newObject = {
                'file': null,
                'Name': '_is empty_',
                'VideoReference': null
            };
            SetAudioUpload((e) => {
                const updatedArray = e;
                if (updatedArray.length >= position) {
                    updatedArray[position] = newObject;
                    // updatedArray.splice(position, 1);
                } 
                return updatedArray
            })
            document.getElementById(AudioPreviewTag).src = ''
            document.getElementById(AudioUploadName).value = '_is empty_'
            document.getElementById(ival).src = ''
        }
        
    }
    function ClearAudioToVideoUplaodedAudio (position) {
        console.log('called')
        if(position != null ){
            var array = AudioToVideoContainer.audioFiles
            array.splice(position, 1);
            SetAudioToVideoContainer((e) => {
                return {
                    ...e,
                    'audioFiles' : array
                }
            })
        }
        
    }
    function ClearOneForAllUplaodedAudio () {
        SetOneForAllAudioUpload((e) => {
            return {
                'Name' : '',
                'file' : null,
                'src' : ''
            }
        })
        document.getElementById('OneForAllAudioPreviewTag').src = ''
        AiVoiceRef.current.src = ''           
    }
    function ClearAudioToVoiceUploadedAudio (props) {
        if(props == 'clear'){
            SetAudioToVideoContainer((e) => {
                return {
                    ...e,
                    'audioFiles' : [],
                    'ShowAudioToVideoContainer' : false
                }
            })
        }       
    }
    const MapImageCarouselsContainer = PostContentContainer.VideoListDetailsWithImages.map((items,i) => {
        
        var imageListval = items.ImageList
        // {<MapImageCarousels imagelist={imageListval}/>}
      
        return (
           <div key={i} className={`flex flex-row gap-0 w-full min-w-full min-h-full bg-transparent h-[250px] transition-all duration-300  overflow-hidden `} >
               <div className={`flex flex-col gap-0  w-full h-full min-h-full  bg-transparent justify-start overflow-hidden `}>
                    <div onTouchStart={handleTouchImageStart } onTouchEnd={handleTouchImageEnd } style={{transform: `translateX(-${SelectedVideoImage * 100}%)`}}  className=" rounded-sm flex flex-row h-[90%]  bg-transparent  transition-all ease-in-out duration-300 w-full overflow-visible " >
                        {<MapImageCarousels imagelist={imageListval}/>}
                    </div>
                    {/* left right arrow div */}
                    <div className=" flex flex-row relative sm:text-lg w-full mx-auto min-h-[10%] h-fit bg-transparent sm:my-auto justify-center dark:text-gray-400 pt-1 text-slate-700 text-base gap-10 mb-auto " >
                        <p className=" text-sm py-1 absolute right-full left-0 top-0 mb-auto text-slate-800 dark:text-slate-400 " >{i + 1}</p>

                        <LuCornerUpLeft  onClick={() => ScrollVideoImage('back')} className={` ${imageListval.length <= 1 ? 'invisible' : 'visible'} cursor-pointer bg-transparent hover:text-white transition-all  duration-300 `} />
                        <LuCornerUpRight  onClick={() => ScrollVideoImage('next')} className={` ${imageListval.length <= 1 ? 'invisible' : 'visible'} cursor-pointer  hover:text-white bg-transparent transition-all duration-300 `} />
                    </div>
                </div>
                
           </div>
        )
    })

    const MapVideoScripts = PostContentContainer.VideoListDetailsWithImages.map((items,i) => { 
        var script = items.audio.script
       
        return (
            <div key={i} className={` ${PostContentContainer.LoadingVideoList == true ? 'invisible' : 'visible'} flex flex-row w-full h-[250px] min-h-full py-4 px-2 min-w-full sm:pl-8 justify-around  gap-3`}>
                <p className=" text-sm py-1 mb-auto text-slate-800 dark:text-slate-400 " >{i + 1}</p>
                <button onClick={() => copyToClipboard(script)} data-tip="Copy script"  className={` cursor-pointer tooltip tooltip-right w-10 min-w-5 h-6 shadow-xs rounded-md shadow-slate-200 hover:shadow-slate-500 dark:hover:shadow-slate-200 transition-all duration-300 dark:shadow-slate-500 bg-transparent `} >
                    <MdContentCopy   className=" my-auto text-sm mx-auto text-slate-200 transition-all duration-300 "  role="button" />
                </button>
                <textarea className=" text-sm w-full sm:w-[80%] resize-none min-h-[80px] shadow-xs p-1 rounded-sm dark:text-slate-300 text-slate-600  text-ellipsis " readOnly value={script}></textarea>
            </div>
        )
    })  
    const MapVideoAudioUploadContainer = PostContentContainer.VideoListDetailsWithImages.map((items,i) => { 
       var idval = `AiVoiceRef${i}`
       var AudioPreviewTag = `${idval}_AudioPreviewTag`
       var AudioUploadName = `${idval}_AudioUploadName` 
       var audioUploadNameVal = AudioUpload[i] ? AudioUpload[i].Name : '_is empty_'
        return (
            <div key={i} className={`${PostContentContainer.LoadingVideoList == true ? 'invisible' : 'visible'} flex flex-row relative justify-start overflow-hidden sm:pl-8 gap-3 w-full h-[150px] bg-transparent min-h-full`} >
                <input onChange={(event) =>ToogleAudioUpload(idval,i,AudioPreviewTag,AudioUploadName,event)} id={idval} className=" hidden" accept="audio/*"  type="file" />
                <p className=" text-sm  text-slate-800 absolute dark:text-slate-400 " >{i + 1}</p>

                <div className="flex flex-col gap-2 justify-between w-full pt-2 " >
                    <div className={`flex flex-row w-full justify-start py-2 pl-2 sm:w-fit gap-3`}>
                        <button onClick={() => ClickUploadRepository(idval)} data-tip="Upload audio"  className={` cursor-pointer tooltip tooltip-right w-10 min-w-10 h-8 shadow-xs rounded-md shadow-slate-200 hover:shadow-slate-500 dark:hover:shadow-slate-200 transition-all duration-300 dark:shadow-slate-500 bg-transparent `} >
                            <BsUpload  className=" my-auto text-sm mx-auto text-slate-200 transition-all duration-300 "  role="button" />
                        </button>
                        <input id={AudioUploadName} className=" text-sm w-full rounded-sm dark:text-slate-300 text-slate-600  text-ellipsis " readOnly value={`name: ${audioUploadNameVal}`} />
                    </div>

                    <div className="flex flex-row flex-wrap w-full min-w-full h-fit" >
                        <audio controlsList="nodownload"  className=" w-full sm:mx-auto max-w-xs py-2 px-1 " id={AudioPreviewTag} controls src=''></audio>
                        <p disabled={PostContentContainer.LoadingVideoList == true} onClick={() =>ClearUplaodedAudio(idval,i,AudioPreviewTag,AudioUploadName)} className={` ${PostContentContainer.LoadingVideoList == true ? 'invisible' : 'visible'} dark:text-slate-400 text-slate-500 hover:text-red-200/60 dark:hover:text-red-300/80 transition-all duration-200 underline underline-offset-2 cursor-pointer w-fit ml-auto mr-2 `} >clear</p>
                    </div>
                </div>
            </div>
            
        )
    })
    const MapAudioToVideoContainer = AudioToVideoContainer.audioFiles.map((items,i) => { 
        
         return (
             <div key={i} className={`${PostContentContainer.LoadingVideoList == true ? 'invisible' : 'visible'} flex flex-col relative justify-start overflow-hidden sm:pl-8 w-full h-[150px] bg-transparent min-h-full`} >
                <div className="flex flex-row justify-start gap-4 w-full pt-2 " >
                    <p className="my-auto text-sm  text-slate-800  dark:text-slate-400 " >{i + 1}.</p>
                    <p disabled={PostContentContainer.LoadingVideoList == true} onClick={() =>ClearAudioToVideoUplaodedAudio(i)} className={`dark:text-slate-400 text-slate-500 hover:text-red-200/60 dark:hover:text-red-300/80 transition-all duration-200 text-sm underline underline-offset-2 italic cursor-pointer w-fit `} >clear</p>
                </div>
                 <div className="flex flex-col gap-2 justify-start w-full pt-2 " >
                    <p className="my-auto text-sm pl-2 text-slate-800 w-full text-ellipsis max-w-[200px] xs:max-w-[320px] sm:max-w-[400px] text-nowrap overflow-hidden dark:text-slate-400 " >{items.name}</p>
                    <audio controlsList="nodownload"  className=" w-full sm:mx-auto max-w-xs py-2 px-1 "  controls src={items.src}></audio>
                 </div>
             </div>
             
         )
    })

    const MapVideoYoutubeId = PostContentContainer.UploadedVideoId.map((items,i) => { 
        var script = items
      
        return (
            <div key={i} className={` flex flex-row w-full h-[250px] min-h-full py-4 px-2 min-w-full sm:pl-8 justify-around  gap-3`}>
                <p className=" text-sm py-1 mb-auto text-slate-800 dark:text-slate-400 " >{i + 1}</p>
                <button onClick={() => copyToClipboard(script)} data-tip="Copy script"  className={` cursor-pointer tooltip tooltip-right w-10 min-w-5 h-6 shadow-xs rounded-md shadow-slate-200 hover:shadow-slate-500 dark:hover:shadow-slate-200 transition-all duration-300 dark:shadow-slate-500 bg-transparent `} >
                    <MdContentCopy   className=" my-auto text-sm mx-auto text-slate-200 transition-all duration-300 "  role="button" />
                </button>
                <input className=" text-sm w-full h-fit shadow-xs p-2 rounded-sm dark:text-slate-300 text-slate-600  text-ellipsis " readOnly value={script} />
            </div>
        )
    })
 
    const MapVideoUrlCarousels = AiVideoMergeUrl.map((items,i) => { 
        return (
            <div key={i} className={`flex flex-row w-full h-[250px] min-h-full py-4 px-2 min-w-full sm:pl-8 justify-around  gap-3`}>
                <video controls className={` `} src={`${import.meta.env.VITE_APP_API_URL}/media/${items}` || null} ></video>
            </div>
        )
    })
    const ToongleProfileYoutubeChannelsChange = (event) => {
        const {value} = event.target
        SetSelectedtokenPathName(value)
    }
    
    const MapProfileYoutubeChannels = ProfileYoutubeChannels.map((items, i) => {
        return (
            <div key={i} className="flex flex-row group hover:bg-slate-400 dark:hover:bg-slate-700 hover:w-[97%] w-full transition-all duration-200 rounded-sm p-2 cursor-pointer group-hover:px-2  justify-start gap-4 px-2 ">
                <input 
                    onChange={ToongleProfileYoutubeChannelsChange}
                    type="radio"
                    name="profileYoutubeChannels"  // common name for the group
                    disabled={false} //{PostContentContainer.LoadingVideoList == true}
                    value={items.tokenPath}
                    checked={items.tokenPath === SelectedtokenPathName}  // control checked state
                    className="radio radio-info dark:radio-success shadow-xs shadow-slate-500/80 dark:shadow-slate-100/60"
                />
                <p className="text-sm py-1 text-slate-800 dark:text-slate-400">{items.name}</p>
            </div>
        );
    });
    
    const ToongleClearServerChange = (event) => {
        const {checked} = event.target
       
        SetPostContentContainer((e) => {
            return {
                ...e,
                'ClearServer' : checked
            }
        })
    }
    
    function copyToClipboard(text) {
        navigator.clipboard.writeText(text)
            .then(() => ShowToast('info','Copied'))
            .catch(err => {
                ShowToast('warning','Seams like there is an issue with your request. Try again later') 
                console.error("Failed to copy:", err)
            });
    }
    //videos of birds, others are eagles, parots, flamingos and other more
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
                            src={MediaGallary.src || null} 
                        />
                    </div>
                    
                </div>
            </div>
            <section className={`  md:w-full  justify-between flex flex-col relative overflow-x-hidden overflow-y-visible w-full rounded-sm  md:mx-auto bg-transparent dark:text-slate-100 m-auto   h-full`}>
                <small className=" text-slate-600 dark:text-slate-500 text-center" >It just takes three steps</small>
                {/* changing <image/audio> to voice container */}
                <div className=" w-full min-w-full overflow-y-auto  h-fit flex flex-row bg-transparent justify-start gap-4 px-3 " >
                    <p onClick={()=> ToongleAiPageSelected('ImageToVideo')} className={` ${AiPageSelected == 'ImageToVideo' ? ' dark:text-lime-600 text-sky-600 shadow-sky-800 dark:shadow-lime-700 ' : 'text-slate-700  dark:text-slate-400 shadow-slate-500 dark:shadow-slate-500'} px-4 py-2 my-3 rounded-2xl text-sm text-center shadow-[0px_0px_8px_1px_rgba(0,0,0,0.25)]  hover:shadow-slate-900  transition-all duration-300 hover:dark:shadow-slate-400 cursor-pointer w-fit min-w-fit `}>Image to video</p>
                    <p onClick={()=> ToongleAiPageSelected('VoiceToVideo')} className={` ${AiPageSelected == 'VoiceToVideo' ? ' dark:text-lime-600 text-sky-600 shadow-sky-800 dark:shadow-lime-700 ' : 'text-slate-700  dark:text-slate-400 shadow-slate-500 dark:shadow-slate-500'} px-4 py-2 my-3 rounded-2xl text-sm text-center shadow-[0px_0px_8px_1px_rgba(0,0,0,0.25)]  hover:shadow-slate-900  transition-all duration-300 hover:dark:shadow-slate-400 cursor-pointer w-fit min-w-fit  `}>voice To video</p>
                </div>
                {/* Image to video container */}
                <div className={` ${ AiPageSelected == 'ImageToVideo' ?'flex flex-col' : 'hidden'} gap-3 w-[95%] max-w-[1000px] text-black dark:text-slate-100 m-auto  `} >
                    
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
                                <p className=" text-sm py-1 text-slate-800 dark:text-slate-400 " >Number of images per video</p>
                                <Select
                                    isMulti
                                    options={SocialMediaNumberImagesOptions}
                                    value={PostContentContainer.SocialMediaNumberImagesOptions}
                                    onChange={handleSocialMediaOptionsChange}
                                    name="SocialMediaNumberImagesOptions"
                                    placeholder="..."
                                    theme={(theme) => customTagSelectorTheme(theme, Theme)}
                                    styles={customStyles(Theme)}
                                    className="max-h-[200px] "
                                />
                                <p className=" text-sm py-1 text-slate-800 dark:text-slate-400 " >Number of videos</p>
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
                                <div className={` flex flex-row flex-wrap gap-2 py-3 ${PostContentContainer.LoadingVideoList == true ? 'border-t-[1px] ' : 'border-t-0'} border-slate-500 dark:border-t-slate-500 transition-all duration-300  w-[100%] mt-3 max-w-[600px] mx-auto justify-around`}>
                                    {
                                        PostContentContainer.LoadingVideoList == true ? 
                                            <div className="flex flex-col w-fit gap-3" >
                                                <Typist avgTypingDelay={20} stdTypingDelay={5}  className=" mx-auto text-yellow-300 dark:text-amber-400" key={ProgressInformation}>
                                                    <span className=" text-sm py-1 text-center transition-all duration-300 text-blue-700 dark:text-sky-400 " >{ProgressInformation}</span>
                                                </Typist>
                                                <span className="loading mx-auto dark:bg-slate-400 bg-slate-700 loading-spinner loading-md"></span>
                                            </div>
                                            :
                                            <button disabled={watch('AIprompt') == ''  || PostContentContainer.SocialMediaNumberImagesOptions.length == 0 || PostContentContainer.SocialMediaNumberVideosOptions.length == 0} onClick={() => ToongleFirstStepLevel('next')} className={` py-2 cursor-pointer  disabled:cursor-not-allowed  disabled:bg-gray-600 disabled:opacity-60 px-3 min-w-[80px] disabled:shadow-transparent mx-auto mb-auto text-sm text-gray-900 rounded-md bg-transparent transition-all duration-300 shadow-blue-600/90 dark:shadow-sky-600/90 border-opacity-80 hover:border-opacity-100 shadow-xs hover:py-3 dark:text-white `}>Next</button>
                                    }

                                </div>
                            
                            </div>
                            {/* details verification and modifications generation */}
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
                                    <button disabled={PostContentContainer.LoadingVideoList == true} onClick={() => ToongleFirstStepLeve2('back')} className={`  py-2 cursor-pointer  disabled:cursor-not-allowed  disabled:bg-gray-600 disabled:opacity-60 px-3 min-w-[80px] disabled:shadow-transparent mx-auto mb-auto text-sm text-gray-900 rounded-md bg-transparent transition-all duration-300 shadow-slate-600/90 dark:shadow-gray-400/90 border-opacity-80 hover:border-opacity-100 shadow-xs hover:py-3 dark:text-white`}>Back</button>
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
                                <div className={` flex flex-row flex-wrap gap-2 py-3 ${PostContentContainer.LoadingVideoList == true ? 'border-t-[1px] ' : 'border-t-0'} border-slate-500 dark:border-t-slate-500 transition-all duration-300  w-[100%] mt-3 max-w-[600px] mx-auto justify-around`}>
                                    {
                                        PostContentContainer.LoadingVideoList == true ? 
                                            <div className="flex flex-col w-fit gap-3" >
                                                <Typist avgTypingDelay={20} stdTypingDelay={5}  className=" mx-auto text-yellow-300 dark:text-amber-400" key={ProgressInformation}>
                                                    <span className=" text-sm py-1 text-center transition-all duration-300 text-blue-700 dark:text-sky-400 " >{ProgressInformation}</span>
                                                </Typist>
                                                <span className="loading mx-auto dark:bg-slate-400 bg-slate-700 loading-spinner loading-md"></span>
                                            </div> :
                                            <button disabled={false} onClick={() => ToongleSecondProgressLevel('Create')} className={` py-2 cursor-pointer  disabled:cursor-not-allowed  disabled:bg-gray-600 disabled:opacity-60 px-3 min-w-[80px] disabled:shadow-transparent mx-auto mb-auto text-sm text-gray-900 rounded-md bg-transparent transition-all duration-300 shadow-blue-600/90 dark:shadow-sky-600/90 border-opacity-80 hover:border-opacity-100 shadow-xs hover:py-3 dark:text-white `}>Create</button>
                                    }
                                </div>
                            </div>
                            
                            {/* voicing */}
                            <div className={` w-full ${PostContentContainer.SecondStepLevel == 2 ? 'flex flex-col justify-start' : 'hidden'} h-[200px] min-h-fit  gap-3 `}  >
                                {/*image carousels */}
                                <p className=" text-sm py-1 text-slate-800 dark:text-slate-400 pt-2 " >Image previews</p>
                                <div className="flex flex-col sm:flex-row gap-1 justify-center sm:pl-8  w-full">
                                    <div className="flex flex-row justify-around sm:justify-start sm:gap-10  gap-1  w-full h-fit overflow-hidden sm:mx-0 mx-auto" >
                                        <div className={`h-full w-[90%] sm:w-full  max-w-[350px] xs:max-w-xs overflow-hidden`} >
                                            <div style={{transform: `translateY(-${SelectedVideoImageCarousel * 100}%)`}}  className=" rounded-sm flex flex-col h-[250px] max-h-[250px]  w-full mx-auto  transition-all ease-in-out m-auto duration-300 bg-transparent  overflow-y-visible " >
                                                {MapImageCarouselsContainer}
                                            </div>
                                        </div>
                                        {/* arrow up down div */}
                                        <div className={`flex flex-col ${PostContentContainer.VideoListDetailsWithImages.length <= 1 ? ' invisible' : 'visible'}  justify-around bg-transparent h-full my-auto gap-4 sm:text-lg w-fit  min-w-fit dark:text-gray-400 text-slate-700 text-base`} >
                                            <IoChevronUpOutline  onClick={() => ScrollVideoImageCarousel('back')} className=" cursor-pointer  hover:text-white bg-transparent transition-all duration-300" />
                                            <IoChevronDownOutline  onClick={() => ScrollVideoImageCarousel('next')} className=" cursor-pointer  hover:text-white bg-transparent transition-all duration-300" />
                                        </div>
                                    </div>
                                    
                                </div>
                                {/* custom scripting */}
                                <p className=" text-sm py-1 text-slate-800 dark:text-slate-400 " >Bellow is a custom 60 sec script you can use to generate your audio</p>
                                <div className="flex flex-col sm:flex-row gap-1 justify-center sm:pl-8  w-full">
                                    <div className="flex flex-row justify-around sm:justify-start sm:gap-10  gap-1  w-full h-fit overflow-hidden sm:mx-0 mx-auto" >
                                        <div className={`h-full w-[90%] sm:w-full  max-w-[350px] xs:max-w-xs overflow-hidden`} >
                                            <div style={{transform: `translateY(-${SelectedVideoScriptCarousel * 100}%)`}}  className=" rounded-sm flex flex-col h-[250px] max-h-[250px]  w-full mx-auto  transition-all ease-in-out m-auto duration-300 bg-transparent  overflow-y-visible " >
                                                {MapVideoScripts}
                                            </div>
                                        </div>
                                        {/* arrow up down div */}
                                        <div className={` flex flex-col ${PostContentContainer.VideoListDetailsWithImages.length <= 1 ? ' invisible' : 'visible'} justify-around bg-transparent h-full my-auto gap-4 sm:text-lg w-fit  min-w-fit dark:text-gray-400 text-slate-700 text-base`} >
                                            <IoChevronUpOutline  onClick={() => ScrollVideoScriptCarousel('back')} className=" cursor-pointer  hover:text-white bg-transparent transition-all duration-300" />
                                            <IoChevronDownOutline  onClick={() => ScrollVideoScriptCarousel('next')} className=" cursor-pointer  hover:text-white bg-transparent transition-all duration-300" />
                                        </div>
                                    </div>
                                    
                                </div>
                                {/* upload */}
                                
                                {/* audio model selection */}
                                <p className=" text-sm py-1 text-slate-800 dark:text-slate-400 " >Select audio mode</p>
                                <Select
                                    isMulti
                                    options={VideoAudioModeOptions}
                                    value={PostContentContainer.VideoAudioModeOptions}
                                    onChange={handleSocialMediaOptionsChange}
                                    name="VideoAudioModeOptions"
                                    placeholder="..."
                                    theme={(theme) => customTagSelectorTheme(theme, Theme)}
                                    styles={customStyles(Theme)}
                                    className="max-h-[200px] "
                                />
                                <p className={` ${PostContentContainer.VideoAudioModeSelectedOptions == '' ? 'hidden' : ''} text-sm py-1 text-slate-800 dark:text-slate-400 `} >Upload audio to be merged with images created</p>
                                
                                <div className={` ${PostContentContainer.VideoAudioModeSelectedOptions == 'OneForAll' ? 'flex flex-col sm:flex-row' : 'hidden'} gap-1 justify-center sm:pl-8  w-full `} >
                                    <div className={`${PostContentContainer.LoadingVideoList == true ? 'invisible' : 'visible'} flex flex-row relative justify-start overflow-hidden sm:pl-8 gap-3 w-full h-[150px] bg-transparent min-h-full`} >
                                        <input onChange={ToogleOneForAllAudioUpload} ref={AiVoiceRef} className=" hidden" accept="audio/*"  type="file" />
                                        <div className="flex flex-col gap-2 justify-between w-full pt-2 " >
                                            <div className={`flex flex-row w-full justify-start py-2 pl-2 sm:w-fit gap-3`}>
                                                <button onClick={ClickOneForAllUploadRepository} data-tip="Upload audio"  className={` cursor-pointer tooltip tooltip-right w-10 min-w-10 h-8 shadow-xs rounded-md shadow-slate-200 hover:shadow-slate-500 dark:hover:shadow-slate-200 transition-all duration-300 dark:shadow-slate-500 bg-transparent `} >
                                                    <BsUpload  className=" my-auto text-sm mx-auto text-slate-200 transition-all duration-300 "  role="button" />
                                                </button>
                                                <input  className=" text-sm w-full rounded-sm dark:text-slate-300 text-slate-600  text-ellipsis " readOnly value={`name: ${OneForAllAudioUpload.Name}`} />
                                            </div>

                                            <div className="flex flex-row flex-wrap w-full min-w-full h-fit" >
                                                <audio controlsList="nodownload" id="OneForAllAudioPreviewTag"  className=" w-full sm:mx-auto max-w-xs py-2 px-1 " controls src={OneForAllAudioUpload.src}></audio>
                                                <p disabled={PostContentContainer.LoadingVideoList == true} onClick={ClearOneForAllUplaodedAudio} className={` ${PostContentContainer.LoadingVideoList == true ? 'invisible' : 'visible'} dark:text-slate-400 text-slate-500 hover:text-red-200/60 dark:hover:text-red-300/80 transition-all duration-200 underline underline-offset-2 cursor-pointer w-fit ml-auto mr-2 `} >clear</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className={` ${PostContentContainer.VideoAudioModeSelectedOptions == 'AllForAll' ? 'flex flex-col sm:flex-row' : 'hidden'} gap-1 justify-center sm:pl-8  w-full `} >
                                    <div className="flex flex-row justify-around sm:justify-start sm:gap-10  gap-1  w-full h-fit overflow-hidden sm:mx-0 mx-auto" >
                                        <div className={`h-full w-[90%] sm:w-full  max-w-[350px] xs:max-w-xs overflow-hidden`} >
                                            <div style={{transform: `translateY(-${SelectedVideoAudioUploadContainer * 100}%)`}}  className=" rounded-sm flex flex-col h-[150px] max-h-[150px]  w-full mx-auto  transition-all ease-in-out m-auto duration-300 bg-transparent  overflow-y-visible " >
                                                {MapVideoAudioUploadContainer}
                                            </div>
                                        </div>
                                        {/* arrow up down div */}
                                        <div className=" flex flex-col justify-around bg-transparent h-full my-auto gap-4 sm:text-lg w-fit  min-w-fit dark:text-gray-400 text-slate-700 text-base" >
                                            <IoChevronUpOutline  onClick={() => ScrollVideoAudioUploadContainer('back')} className=" cursor-pointer  hover:text-white bg-transparent transition-all duration-300" />
                                            <IoChevronDownOutline  onClick={() => ScrollVideoAudioUploadContainer('next')} className=" cursor-pointer  hover:text-white bg-transparent transition-all duration-300" />
                                        </div>
                                    </div>
                                    
                                </div>
                                
                                <div className={` flex  flex-wrap gap-2 py-3 ${PostContentContainer.LoadingVideoList == true ? 'flex-col border-t-[1px]' : ' border-t-0 flex-row '} border-slate-500 dark:border-t-slate-500 transition-all duration-300  w-[100%] mt-3 max-w-[600px] mx-auto justify-around`}>
                                    <button disabled={PostContentContainer.LoadingVideoList == true} onClick={() => ToongleSecondProgressLevel('back')} className={`  py-2 cursor-pointer  disabled:cursor-not-allowed  disabled:bg-gray-600 disabled:opacity-60 px-3 min-w-[80px] disabled:shadow-transparent mx-auto mb-auto text-sm text-gray-900 rounded-md bg-transparent transition-all duration-300 shadow-slate-600/90 dark:shadow-gray-400/90 border-opacity-80 hover:border-opacity-100 shadow-xs hover:py-3 dark:text-white`}>Back</button>

                                    {
                                        PostContentContainer.LoadingVideoList == true ? 
                                            <div className="flex flex-col w-full gap-3" >
                                                    <Typist avgTypingDelay={20} stdTypingDelay={5}  className=" mx-auto text-yellow-300 dark:text-amber-400" key={ProgressInformation}>
                                                        <span className=" text-sm py-1 text-center transition-all duration-300 text-blue-700 dark:text-sky-400 " >{ProgressInformation}</span>
                                                    </Typist>
                                                    <span className="loading mx-auto dark:bg-slate-400 bg-slate-700 loading-spinner loading-md"></span>
                                            </div>
                                        :
                                            <button disabled={DisableMergeButton} onClick={() => ToongleSecondProgressLevel('Merge')} className={` py-2 cursor-pointer  disabled:cursor-not-allowed  disabled:bg-gray-600 disabled:opacity-60 px-3 min-w-[80px] disabled:shadow-transparent mx-auto mb-auto text-sm text-gray-900 rounded-md bg-transparent transition-all duration-300 shadow-blue-600/90 dark:shadow-sky-600/90 border-opacity-80 hover:border-opacity-100 shadow-xs hover:py-3 dark:text-white `}>Merge</button>
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
                                <div className={`  ${AiVideoMergeUrl.length == 0  ? 'hidden' :'flex flex-col'} sm:flex-row gap-1 justify-center sm:pl-8  w-full `} >
                                    <div className="flex flex-row justify-around sm:justify-start sm:gap-10  gap-1  w-full h-fit overflow-hidden sm:mx-0 mx-auto" >
                                        <div className={`h-full w-[90%] sm:w-full  max-w-[350px] xs:max-w-xs overflow-hidden`} >
                                            <div style={{transform: `translateY(-${SelectedAiVideoMergeUrl * 100}%)`}}  className=" rounded-sm flex flex-col h-[250px] max-h-[250px]  w-full mx-auto  transition-all ease-in-out m-auto duration-300 bg-transparent  overflow-y-visible " >
                                                {MapVideoUrlCarousels}
                                            </div>
                                        </div>
                                        {/* arrow up down div */}
                                        <div className={` ${AiVideoMergeUrl.length == 1 ? 'hidden':'flex flex-col'} justify-around bg-transparent h-full my-auto gap-4 sm:text-lg w-fit  min-w-fit dark:text-gray-400 text-slate-700 text-base `} >
                                            <IoChevronUpOutline  onClick={() => ScrollVideoUrlCarousels('back')} className=" cursor-pointer  hover:text-white bg-transparent transition-all duration-300" />
                                            <IoChevronDownOutline  onClick={() => ScrollVideoUrlCarousels('next')} className=" cursor-pointer  hover:text-white bg-transparent transition-all duration-300" />
                                        </div>
                                    </div>
                                    
                                </div>
                                <img className={`${AiVideoMergeUrl.length == 0  ? 'flex mask mask-squircle max-h-80 max-w-80 mx-auto lg:mr-auto lg:ml-0 ' : 'hidden'}`} src={`${import.meta.env.VITE_APP_API_URL}/media/${`media unavailable ${Theme}.jpg`}` || null}  />
                                
                                {/* progressLevel buttons */}
                                <p className=" text-sm pt-1 text-slate-800 dark:text-slate-400 " >Upload to {PostContentContainer.SelectedSocialMediaType}</p>
                                <small className={`${ProfileYoutubeChannels.length != 0 ? 'flex' : 'hidden'} text-[x-small] text-slate-800 dark:text-slate-400 `} >If not selected you will be prompted to link another account via google</small>
                                <small onClick={() => SetSelectedtokenPathName('token.json')} className={`${ProfileYoutubeChannels.length != 0 && PostContentContainer.LoadingVideoList == false ? 'flex' : 'hidden'} text-sm text-slate-800 dark:text-slate-400 underline cursor-pointer hover:text-red-800 dark:hover:text-red-300 transition-all duration-200 w-fit `} >clear</small>
                                <div className={` ${ProfileYoutubeChannels.length != 0 ? 'flex flex-col' : 'hidden'} bg-slate-500/40 dark:bg-slate-500/40 gap-2 py-3 pl-2  transition-all duration-300  w-[90%] rounded-sm max-w-[600px] overflow-y-auto h-fit max-h-[200px] overflow-x-hidden ml-2 justify-around`} >
                                    {MapProfileYoutubeChannels}
                                </div>
                                <div className={` flex  flex-wrap gap-2 py-3 ${PostContentContainer.LoadingVideoList == true ? 'flex-col border-t-[1px]' : ' border-t-0 flex-row '} border-slate-500 dark:border-t-slate-500 transition-all duration-300  w-[100%] mt-3 max-w-[600px] mx-auto justify-around`}>
                                    {
                                        PostContentContainer.LoadingVideoList == true ? 
                                            <div className="flex flex-col w-full gap-3" >
                                                <Typist avgTypingDelay={20} stdTypingDelay={5}  className=" mx-auto text-yellow-300 dark:text-amber-400" key={ProgressInformation}>
                                                    <span className=" text-sm py-1 text-center transition-all duration-300 text-blue-700 dark:text-sky-400 " >{ProgressInformation}</span>
                                                </Typist>
                                                <span className="loading mx-auto dark:bg-slate-400 bg-slate-700 loading-spinner loading-md"></span>
                                            </div>                                        :
                                            <button disabled={false} onClick={() => ToongleThirdProgressLevel('Upload')} className={` py-2 cursor-pointer  disabled:cursor-not-allowed  disabled:bg-gray-600 disabled:opacity-60 px-3 min-w-[80px] disabled:shadow-transparent mx-auto mb-auto text-sm text-gray-900 rounded-md bg-transparent transition-all duration-300 shadow-blue-600/90 dark:shadow-sky-600/90 border-opacity-80 hover:border-opacity-100 shadow-xs hover:py-3 dark:text-white `}>Upload</button>
                                    }
                                </div>
                                
                            </div>
                            {/* logs from submission */}
                            <div className={` w-full ${PostContentContainer.ThirdStepLevel == 2 ? 'flex flex-col' : 'hidden'} h-[200px] min-h-fit mt-4  gap-3 `}  >
                                <p className=" text-sm py-1 my-auto text-slate-800 dark:text-slate-400 " >Video successfuly uploaded</p>
                                <p className=" text-sm py-1 text-slate-800 dark:text-slate-400 " >Your uploaded video id</p>
                                
                                <div className="flex flex-col sm:flex-row gap-1 justify-center sm:pl-8  w-full">
                                    <div className="flex flex-row justify-around sm:justify-start sm:gap-10  gap-1  w-full h-fit overflow-hidden sm:mx-0 mx-auto" >
                                        <div className={`h-full w-[90%] sm:w-full  max-w-[350px] xs:max-w-xs overflow-hidden`} >
                                            <div style={{transform: `translateY(-${SelectedVideoYoutubeIdCarousel * 100}%)`}}  className=" rounded-sm flex flex-col h-[100px]  bg-transparent w-full mx-auto  transition-all ease-in-out m-auto duration-300 overflow-y-visible " >
                                                {MapVideoYoutubeId}
                                            </div>
                                        </div>
                                        {/* arrow up down div */}
                                        <div className=" flex flex-col justify-around bg-transparent h-fit mt-4 mb-auto gap-4 sm:text-lg w-fit  min-w-fit dark:text-gray-400 text-slate-700 text-base" >
                                            <IoChevronUpOutline  onClick={() => ScrollVideoYoutubeIdCarousel('back')} className=" cursor-pointer  hover:text-white bg-transparent transition-all duration-300" />
                                            <IoChevronDownOutline  onClick={() => ScrollVideoYoutubeIdCarousel('next')} className=" cursor-pointer  hover:text-white bg-transparent transition-all duration-300" />
                                        </div>
                                    </div>
                                    
                                </div>
                                <p className=" text-sm py-1 text-slate-800 dark:text-slate-400 " >Clear my files in Mela server</p>
                                <label className="label cursor-pointer">
                                    <span className="label-text text-sm text-slate-800 dark:text-slate-400 mx-3">Clear</span>
                                    <input onChange={ToongleClearServerChange} checked={PostContentContainer.ClearServer} name="ClearServer"  type="checkbox"  className="checkbox rounded-md checkbox-info shadow-xs dark:checked:text-sky-500 shadow-slate-500 dark:shadow-slate-500" />
                                </label>
                                {/* progressLevel buttons */}
                                <div className=" flex flex-row flex-wrap gap-2 mt-4 w-[90%] max-w-[600px] mx-auto justify-around">
                                    <button disabled={false} onClick={() => ToongleThirdProgressLevel('Reset')} className={` py-2 cursor-pointer  disabled:cursor-not-allowed  disabled:bg-gray-600 disabled:opacity-60 px-3 min-w-[80px] disabled:shadow-transparent mx-auto mb-auto text-sm text-gray-900 rounded-md bg-transparent transition-all duration-300 shadow-blue-600/90 dark:shadow-sky-600/90 border-opacity-80 hover:border-opacity-100 shadow-xs hover:py-3 dark:text-white `}>Restart</button>
                                </div>

                            </div>
                        </div>
                    </div>

                </div>
                {/* voice to video container */}
                <div className={` ${ AiPageSelected == 'VoiceToVideo' ?'flex flex-col' : 'hidden'} gap-3 w-[95%] max-w-[1000px] text-black dark:text-slate-100 m-auto  `} >
                    {/* auido transcript */}
                    <div className={`${PostContentContainer.progressLevel == 1  ? 'collapse-open collapse' : ' collapse-arrow collapse'}  rounded-xl dark:bg-slate-500/40 bg-slate-400 `}  >
                        <input type="radio" name="my-accordion-2" defaultChecked />
                        <div className="collapse-title text-xl font-medium flex flex-row justify-between ">
                            Audio Transcription 
                            <small className=" text-xs my-auto opacity-70 dark:opacity-60" >
                                <sup>1</sup>/ <sub>3</sub> 
                            </small>
                        </div>
                        <div className={` collapse-content flex transition-all  duration-200 flex-col gap-5 `} >
                            {/* steps display container */}
                            <ul className= {`steps transition-all w-full gap-4 text-slate-700 dark:text-slate-400 duration-300 mx-auto `}>
                                <li className={`step ${PostContentContainer.FirstStepLevel == 1 ?'step-primary' : PostContentContainer.FirstStepLevel > 1 ? ' step-success' : 'step-neutral' } `}>Upload</li>
                                <li className={`step ${PostContentContainer.FirstStepLevel == 2 ?'step-primary' : PostContentContainer.FirstStepLevel > 2 ? ' step-success' : 'step-neutral'}  `}>Verification</li>
                            
                            </ul>
                            {/* information gathare container */}
                            <div className={` ${PostContentContainer.FirstStepLevel == 1 ? 'flex flex-col' : 'hidden'} h-[300px] justify-around min-h-fit w-full  gap-3 `} >
                                <p className=" text-sm py-1 text-slate-800 dark:text-slate-400 " >Number of images per video</p>
                                <Select
                                    isMulti
                                    options={SocialMediaNumberImagesOptions}
                                    value={PostContentContainer.SocialMediaNumberImagesOptions}
                                    onChange={handleSocialMediaOptionsChange}
                                    name="SocialMediaNumberImagesOptions"
                                    placeholder="..."
                                    theme={(theme) => customTagSelectorTheme(theme, Theme)}
                                    styles={customStyles(Theme)}
                                    className="max-h-[200px] "
                                />
                                <p className=" text-sm py-1 text-slate-800 dark:text-slate-400 " >Upload audio(s)</p>
                                {/* audios upload container */}
                                <div className={` ${!AudioToVideoContainer.ShowAudioToVideoContainer  ? 'flex flex-col sm:flex-row' : 'hidden'} gap-1 justify-center sm:pl-8  w-full `} >
                                    <div className={`flex flex-row relative justify-start overflow-hidden sm:pl-8 gap-3 w-full h-[150px] bg-transparent min-h-full`} >
                                        <input onChange={ToogleAiAudioToVoiceRefUpload} ref={AiAudioToVoiceRef} className=" hidden" accept="audio/*"  type="file" multiple  />
                                        <div className="flex flex-col gap-2 justify-between w-full pt-2 " >
                                            <div className={`flex flex-row w-full justify-start py-2 pl-2 sm:w-fit gap-3`}>
                                                <button onClick={()=> AiAudioToVoiceRef.current.click()} data-tip="Upload audio"  className={` cursor-pointer tooltip tooltip-right w-10 min-w-10 h-8 shadow-xs rounded-md shadow-slate-200 hover:shadow-slate-500 dark:hover:shadow-slate-200 transition-all duration-300 dark:shadow-slate-500 bg-transparent `} >
                                                    <BsUpload  className=" my-auto text-sm mx-auto text-slate-200 transition-all duration-300 "  role="button" />
                                                </button>
                                            </div>
                                            <div className="flex flex-row flex-wrap w-full min-w-full h-fit" >
                                                <p disabled={PostContentContainer.LoadingVideoList == true} onClick={() => ClearAudioToVoiceUploadedAudio('clear')} className={` ${PostContentContainer.LoadingVideoList == true ? 'invisible' : 'visible'} dark:text-slate-400 text-slate-500 hover:text-red-200/60 dark:hover:text-red-300/80 transition-all duration-200 underline underline-offset-2 cursor-pointer w-fit ml-auto mr-2 `} >clear</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                {/* audio carousels */}
                                <div className={` ${AudioToVideoContainer.ShowAudioToVideoContainer ? 'flex flex-col sm:flex-row' : 'hidden'} gap-1 justify-center sm:pl-8  w-full `} >
                                    <div className="flex flex-row justify-around sm:justify-start sm:gap-10  gap-1  w-full h-fit overflow-hidden sm:mx-0 mx-auto" >
                                        <div className={`h-full w-[90%] sm:w-full  max-w-[350px] xs:max-w-xs overflow-hidden`} >
                                            <div style={{transform: `translateY(-${SelectedAudioToVideoContainer * 100}%)`}}  className=" rounded-sm flex flex-col h-[150px] max-h-[150px]  w-full mx-auto  transition-all ease-in-out m-auto duration-300 bg-transparent  overflow-y-visible " >
                                                {MapAudioToVideoContainer}
                                            </div>
                                        </div>
                                        {/* arrow up down div */}
                                        <div className=" flex flex-col justify-around bg-transparent h-full my-auto gap-4 sm:text-lg w-fit  min-w-fit dark:text-gray-400 text-slate-700 text-base" >
                                            <IoChevronUpOutline  onClick={() => ScrollSelectedAudioToVideoContainer('back')} className=" cursor-pointer  hover:text-white bg-transparent transition-all duration-300" />
                                            <IoChevronDownOutline  onClick={() => ScrollSelectedAudioToVideoContainer('next')} className=" cursor-pointer  hover:text-white bg-transparent transition-all duration-300" />
                                        </div>
                                    </div>
                                </div>
                                {/* progressLevel buttons */}
                                <div className={` flex  flex-wrap gap-2 py-3 ${PostContentContainer.LoadingVideoList == true ? 'flex-col border-t-[1px]' : ' border-t-0 flex-row '} border-slate-500 dark:border-t-slate-500 transition-all duration-300  w-[100%] mt-3 max-w-[600px] mx-auto justify-around`}>
                                    {
                                        PostContentContainer.LoadingVideoList == true ? 
                                            <div className="flex flex-col w-full gap-3" >
                                                <Typist avgTypingDelay={20} stdTypingDelay={5}  className=" mx-auto text-yellow-300 dark:text-amber-400" key={ProgressInformation}>
                                                    <span className=" text-sm py-1 text-center transition-all duration-300 text-blue-700 dark:text-sky-400 " >{ProgressInformation}</span>
                                                </Typist>
                                                <span className="loading mx-auto dark:bg-slate-400 bg-slate-700 loading-spinner loading-md"></span>
                                            </div>                                        :
                                            <button disabled={PostContentContainer.SocialMediaNumberImagesOptions.length == 0 || !AudioToVideoContainer.ShowAudioToVideoContainer} onClick={() => ToongleFirstStepLeveAudioToVideo('upload')} className={` py-2 cursor-pointer  disabled:cursor-not-allowed  disabled:bg-gray-600 disabled:opacity-60 px-3 min-w-[80px] disabled:shadow-transparent mx-auto mb-auto text-sm text-gray-900 rounded-md bg-transparent transition-all duration-300 shadow-blue-600/90 dark:shadow-sky-600/90 border-opacity-80 hover:border-opacity-100 shadow-xs hover:py-3 dark:text-white `}>Upload</button>
                                    }

                                </div>
                               
                            
                            </div>
                            {/* details verification and modifications generation */}
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
                                <div className={` flex  flex-wrap gap-2 py-3 ${PostContentContainer.LoadingVideoList == true ? 'flex-col border-t-[1px]' : ' border-t-0 flex-row '} border-slate-500 dark:border-t-slate-500 transition-all duration-300  w-[100%] mt-3 max-w-[600px] mx-auto justify-around`}>
                                    {
                                        PostContentContainer.LoadingVideoList == true ? 
                                            <div className="flex flex-col w-full gap-3" >
                                                <Typist avgTypingDelay={20} stdTypingDelay={5}  className=" mx-auto text-yellow-300 dark:text-amber-400" key={ProgressInformation}>
                                                    <span className=" text-sm py-1 text-center transition-all duration-300 text-blue-700 dark:text-sky-400 " >{ProgressInformation}</span>
                                                </Typist>
                                                <span className="loading mx-auto dark:bg-slate-400 bg-slate-700 loading-spinner loading-md"></span>
                                            </div> :
                                            <button disabled={false} onClick={() => ToongleSecondProgressLevel('CreateTranscript')} className={` py-2 cursor-pointer  disabled:cursor-not-allowed  disabled:bg-gray-600 disabled:opacity-60 px-3 min-w-[80px] disabled:shadow-transparent mx-auto mb-auto text-sm text-gray-900 rounded-md bg-transparent transition-all duration-300 shadow-blue-600/90 dark:shadow-sky-600/90 border-opacity-80 hover:border-opacity-100 shadow-xs hover:py-3 dark:text-white `}>Create</button>
                                    }
                                </div>
                                
                            </div>
                            {/* voicing */}
                            <div className={` w-full ${PostContentContainer.SecondStepLevel == 2 ? 'flex flex-col justify-start' : 'hidden'} h-[200px] min-h-fit  gap-3 `}  >
                                {/*image carousels */}
                                <p className=" text-sm py-1 text-slate-800 dark:text-slate-400 " >Image previews</p>
                                <div className="flex flex-col sm:flex-row gap-1 justify-center sm:pl-8  w-full">
                                    <div className="flex flex-row justify-around sm:justify-start sm:gap-10  gap-1  w-full h-fit overflow-hidden sm:mx-0 mx-auto" >
                                        <div className={`h-full w-[90%] sm:w-full  max-w-[350px] xs:max-w-xs overflow-hidden`} >
                                            <div style={{transform: `translateY(-${SelectedVideoImageCarousel * 100}%)`}}  className=" rounded-sm flex flex-col h-[250px] max-h-[250px]  w-full mx-auto  transition-all ease-in-out m-auto duration-300 bg-transparent  overflow-y-visible " >
                                                {MapImageCarouselsContainer}
                                            </div>
                                        </div>
                                        {/* arrow up down div */}
                                        <div className={` ${PostContentContainer.VideoListDetailsWithImages.length == 0 ?' invisible' : 'visible'} transition-all duration-300 flex flex-col justify-around bg-transparent h-full my-auto gap-4 sm:text-lg w-fit  min-w-fit dark:text-gray-400 text-slate-700 text-base  `} >
                                            <IoChevronUpOutline  onClick={() => ScrollVideoImageCarousel('back')} className=" cursor-pointer  hover:text-white bg-transparent transition-all duration-300" />
                                            <IoChevronDownOutline  onClick={() => ScrollVideoImageCarousel('next')} className=" cursor-pointer  hover:text-white bg-transparent transition-all duration-300" />
                                        </div>
                                    </div>
                                    
                                </div>
                                <p className={`text-sm py-1 text-slate-800 dark:text-slate-400 `} >Merge images to video</p>
                                
                                <div className={` flex  flex-wrap gap-2 py-3 ${PostContentContainer.LoadingVideoList == true ? 'flex-col border-t-[1px]' : ' border-t-0 flex-row '} border-slate-500 dark:border-t-slate-500 transition-all duration-300  w-[100%] mt-3 max-w-[600px] mx-auto justify-around`}>
                                    <button disabled={PostContentContainer.LoadingVideoList == true} onClick={() => ToongleSecondProgressLevel('back')} className={`  py-2 cursor-pointer  disabled:cursor-not-allowed  disabled:bg-gray-600 disabled:opacity-60 px-3 min-w-[80px] disabled:shadow-transparent mx-auto mb-auto text-sm text-gray-900 rounded-md bg-transparent transition-all duration-300 shadow-slate-600/90 dark:shadow-gray-400/90 border-opacity-80 hover:border-opacity-100 shadow-xs hover:py-3 dark:text-white`}>Back</button>
                                    {
                                        PostContentContainer.LoadingVideoList == true ? 
                                            <div className="flex flex-col w-full gap-3" >
                                                <Typist avgTypingDelay={20} stdTypingDelay={5}  className=" mx-auto text-yellow-300 dark:text-amber-400" key={ProgressInformation}>
                                                    <span className=" text-sm py-1 text-center transition-all duration-300 text-blue-700 dark:text-sky-400 " >{ProgressInformation}</span>
                                                </Typist>
                                                <span className="loading mx-auto dark:bg-slate-400 bg-slate-700 loading-spinner loading-md"></span>
                                            </div>                                        :
                                            <button disabled={PostContentContainer.VideoListDetailsWithImages.length == 0} onClick={() => ToongleSecondProgressLevel('MergeTranscript')} className={` py-2 cursor-pointer  disabled:cursor-not-allowed  disabled:bg-gray-600 disabled:opacity-60 px-3 min-w-[80px] disabled:shadow-transparent mx-auto mb-auto text-sm text-gray-900 rounded-md bg-transparent transition-all duration-300 shadow-blue-600/90 dark:shadow-sky-600/90 border-opacity-80 hover:border-opacity-100 shadow-xs hover:py-3 dark:text-white `}>Merge</button>
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
                                
                                <div className={`  ${AiVideoMergeUrl.length == 0  ? 'hidden' :'flex flex-col'} sm:flex-row gap-1 justify-center sm:pl-8  w-full `} >
                                    <div className="flex flex-row justify-around sm:justify-start sm:gap-10  gap-1  w-full h-fit overflow-hidden sm:mx-0 mx-auto" >
                                        <div className={`h-full w-[90%] sm:w-full   overflow-hidden`} >
                                            <div style={{transform: `translateY(-${SelectedAiVideoMergeUrl * 100}%)`}}  className=" rounded-sm flex flex-col h-[250px] max-h-[250px]  w-full mx-auto  transition-all ease-in-out m-auto duration-300 bg-transparent  overflow-y-visible " >
                                                {MapVideoUrlCarousels}
                                            </div>
                                        </div>
                                        {/* arrow up down div */}
                                        <div className={` ${AiVideoMergeUrl.length == 1 ? 'hidden':'flex flex-col'} justify-around bg-transparent h-full my-auto gap-4 sm:text-lg w-fit  min-w-fit dark:text-gray-400 text-slate-700 text-base `} >
                                            <IoChevronUpOutline  onClick={() => ScrollVideoUrlCarousels('back')} className=" cursor-pointer  hover:text-white bg-transparent transition-all duration-300" />
                                            <IoChevronDownOutline  onClick={() => ScrollVideoUrlCarousels('next')} className=" cursor-pointer  hover:text-white bg-transparent transition-all duration-300" />
                                        </div>
                                    </div>
                                    
                                </div>
                                <img className={`${AiVideoMergeUrl.length == 0  ? 'flex mask mask-squircle max-h-80 max-w-80 mx-auto lg:mr-auto lg:ml-0 ' : 'hidden'}`} src={`${import.meta.env.VITE_APP_API_URL}/media/${`media unavailable ${Theme}.jpg`}` || null}  />
                                
                                {/* progressLevel buttons */}
                                <p className=" text-sm py-1 text-slate-800 dark:text-slate-400 " >Upload to {PostContentContainer.SelectedSocialMediaType}</p>
                                <small className={`${ProfileYoutubeChannels.length != 0 ? 'flex' : 'hidden'} text-[x-small] text-slate-800 dark:text-slate-400 `} >If not selected you will be prompted to link another account via google</small>
                                <small onClick={() => SetSelectedtokenPathName('token.json')} className={`${ProfileYoutubeChannels.length != 0 && PostContentContainer.LoadingVideoList == false ? 'flex' : 'hidden'} text-sm text-slate-800 dark:text-slate-400 underline cursor-pointer hover:text-red-800 dark:hover:text-red-300 transition-all duration-200 w-fit `} >clear</small>
                                <div className={` ${ProfileYoutubeChannels.length != 0 ? 'flex flex-col' : 'hidden'} bg-slate-500/40 dark:bg-slate-500/40 gap-2 py-3 pl-2  transition-all duration-300  w-[90%] rounded-sm max-w-[600px] overflow-y-auto h-fit max-h-[200px] overflow-x-hidden ml-2 justify-around`} >
                                    {MapProfileYoutubeChannels}
                                </div>
                                <div className={` flex  flex-wrap gap-2 py-3 ${PostContentContainer.LoadingVideoList == true ? 'flex-col border-t-[1px]' : ' border-t-0 flex-row '} border-slate-500 dark:border-t-slate-500 transition-all duration-300  w-[100%] mt-3 max-w-[600px] mx-auto justify-around`}>
                                    {
                                        PostContentContainer.LoadingVideoList == true ? 
                                            <div className="flex flex-col w-full gap-3" >
                                                <Typist avgTypingDelay={20} stdTypingDelay={5}  className=" mx-auto text-yellow-300 dark:text-amber-400" key={ProgressInformation}>
                                                    <span className=" text-sm py-1 text-center transition-all duration-300 text-blue-700 dark:text-sky-400 " >{ProgressInformation}</span>
                                                </Typist>
                                                <span className="loading mx-auto dark:bg-slate-400 bg-slate-700 loading-spinner loading-md"></span>
                                            </div>                                        :
                                            <button disabled={false} onClick={() => ToongleThirdProgressLevel('Upload')} className={` py-2 cursor-pointer  disabled:cursor-not-allowed  disabled:bg-gray-600 disabled:opacity-60 px-3 min-w-[80px] disabled:shadow-transparent mx-auto mb-auto text-sm text-gray-900 rounded-md bg-transparent transition-all duration-300 shadow-blue-600/90 dark:shadow-sky-600/90 border-opacity-80 hover:border-opacity-100 shadow-xs hover:py-3 dark:text-white `}>Upload</button>
                                    }
                                </div>
                                
                            </div>
                            {/* logs from submission */}
                            <div className={` w-full ${PostContentContainer.ThirdStepLevel == 2 ? 'flex flex-col' : 'hidden'} h-[200px] min-h-fit mt-4  gap-3 `}  >
                                <p className=" text-sm py-1 my-auto text-slate-800 dark:text-slate-400 " >Video successfuly uploaded</p>
                                <p className=" text-sm py-1 text-slate-800 dark:text-slate-400 " >Your uploaded video id</p>
                                
                                <div className="flex flex-col sm:flex-row gap-1 justify-center sm:pl-8  w-full">
                                    <div className="flex flex-row justify-around sm:justify-start sm:gap-10  gap-1  w-full h-fit overflow-hidden sm:mx-0 mx-auto" >
                                        <div className={`h-full w-[90%] sm:w-full  max-w-[350px] xs:max-w-xs overflow-hidden`} >
                                            <div style={{transform: `translateY(-${SelectedVideoYoutubeIdCarousel * 100}%)`}}  className=" rounded-sm flex flex-col h-[100px]  bg-transparent w-full mx-auto  transition-all ease-in-out m-auto duration-300 overflow-y-visible " >
                                                {MapVideoYoutubeId}
                                            </div>
                                        </div>
                                        {/* arrow up down div */}
                                        <div className=" flex flex-col justify-around bg-transparent h-fit mt-4 mb-auto gap-4 sm:text-lg w-fit  min-w-fit dark:text-gray-400 text-slate-700 text-base" >
                                            <IoChevronUpOutline  onClick={() => ScrollVideoYoutubeIdCarousel('back')} className=" cursor-pointer  hover:text-white bg-transparent transition-all duration-300" />
                                            <IoChevronDownOutline  onClick={() => ScrollVideoYoutubeIdCarousel('next')} className=" cursor-pointer  hover:text-white bg-transparent transition-all duration-300" />
                                        </div>
                                    </div>
                                    
                                </div>
                                <p className=" text-sm py-1 text-slate-800 dark:text-slate-400 " >Clear my files in Mela server</p>
                                <label className="label cursor-pointer">
                                    <span className="label-text text-sm text-slate-800 dark:text-slate-400 mx-3">Clear</span>
                                    <input onChange={ToongleClearServerChange} checked={PostContentContainer.ClearServer} name="ClearServer"  type="checkbox"  className="checkbox rounded-md checkbox-info shadow-xs dark:checked:text-sky-500 shadow-slate-500 dark:shadow-slate-500" />
                                </label>
                                {/* progressLevel buttons */}
                                <div className=" flex flex-row flex-wrap gap-2 mt-4 w-[90%] max-w-[600px] mx-auto justify-around">
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
export default connect(mapStateToProps,{PromptMergeVideos,FetchUserProfile,UploadAudioToVideoAudios,PromptMergeAudioToVideo})(PostContentPage)
