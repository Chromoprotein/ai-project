import { useState } from "react";
import axiosInstance from "../../utils/axiosInstance";
import { MiniSpinner } from "../Reusables/SmallUIElements";
import { RiEditCircleFill } from "react-icons/ri";
import { IoSparklesOutline } from "react-icons/io5";
import { FaSave } from "react-icons/fa";
import { MdDeleteForever } from "react-icons/md";

export default function AvatarGen({botId, originalImage, avatarGen, toggleAvatarGen, setIsSubmit}) {

    const [avatar, setAvatar] = useState();

    // States tracking the loading
    const [generating, setGenerating] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isSaved, setIsSaved] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const [message, setMessage] = useState();

    const generateAvatar = async (botId) => {
        setMessage();
        setIsSaved(false);
        setGenerating(true);
        try {
            const response = await axiosInstance.post(
                process.env.REACT_APP_GENERATEAVATAR,
                { botId }
            );
            if(response) {
                console.log(response.data[0].url)
                setAvatar(response.data[0].url);
            }
        } catch (error) {
            console.log(error);
            setMessage(error.message);
        }
    }

    const saveAvatar = async (botId) => {
        try {
            setIsSaving(true);
            const response = await axiosInstance.put(
                process.env.REACT_APP_AVATAR,
                { 
                    botId,
                    avatar: avatar
                }
            );
            if(response) {
                setIsSubmit((prev) => !prev); // to fetch the updated bot data
            }
        } catch (error) {
            console.log(error);
            setMessage(error.message);
        } finally {
            setIsSaving(false);
            setIsSaved(true);
        }
    }

    const clearAvatar = async (botId) => {
        try {
            setIsDeleting(true);
            const response = await axiosInstance.patch(
                `${process.env.REACT_APP_CLEARAVATAR}/${botId}`,
            );
            if(response) {
                setIsSubmit((prev) => !prev); // to fetch the updated bot data
            }
        } catch (error) {
            console.log(error);
            setMessage(error.message);
        } finally {
            setIsDeleting(false);
        }
    }

    return (
        <>
            <div className="botImageWrapper" onClick={toggleAvatarGen} >
                <div className="botImageEditIcon"><RiEditCircleFill size={25}/></div>
                <img 
                    src={(avatar && avatarGen === botId) ? avatar : originalImage} 
                    alt="Chatbot avatar" 
                    className="botImage clickable" 
                    onLoad={() => setGenerating(false)} 
                    onError={() => setMessage("Error: failed to load image")}
                />
            </div>

            {avatarGen === botId && <div className="botButtons">
                <button className="botButton" disabled={generating} onClick={() => generateAvatar(botId)}>
                    <span className="buttonIcon"><IoSparklesOutline/></span>
                    <span className="buttonText">{generating ? <><MiniSpinner/> Generating...</> : "Generate avatar"}</span>
                </button>

                <button className="botButton" disabled={isSaved || !avatar || isSaving} onClick={() => saveAvatar(botId)}>
                    <span className="buttonIcon"><FaSave/></span>
                    <span className="buttonText">{isSaved ? "Avatar saved" : isSaving ? <><MiniSpinner/> Saving</> : "Save this avatar"}</span>
                </button>

                <button className="botButton" disabled={!originalImage} onClick={() => clearAvatar(botId)}>
                    <span className="buttonIcon"><MdDeleteForever/></span>
                    <span className="buttonText">{isDeleting ? "Deleting" : "Delete avatar"}</span>
                </button>
            </div>}

            <div className="errorMessage">
                {message && <p>{message}</p>}
            </div>
        </>
    );
};