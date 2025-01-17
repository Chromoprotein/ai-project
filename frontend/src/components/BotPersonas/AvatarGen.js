import { useState } from "react";
import axiosInstance from "../../utils/axiosInstance";
import { MiniSpinner } from "../Reusables/SmallUIElements";
import { RiEditCircleFill } from "react-icons/ri";

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
                <button className="button" disabled={generating} onClick={() => generateAvatar(botId)}>
                    {generating ? <><MiniSpinner/> Generating...</> : "Generate avatar"}
                </button>

                <button className="button" disabled={isSaved || !avatar || isSaving} onClick={() => saveAvatar(botId)}>
                    {isSaved ? "Avatar saved" : isSaving ? <><MiniSpinner/> Saving</> : "Save this avatar"}
                </button>

                <button className="button" disabled={!originalImage} onClick={() => clearAvatar(botId)}>
                    {isDeleting ? "Deleting" : "Delete avatar"}
                </button>
            </div>}

            {message && <p>{message}</p>}
        </>
    );
};