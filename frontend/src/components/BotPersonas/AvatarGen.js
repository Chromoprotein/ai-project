import { useState } from "react";
import axiosInstance from "../../utils/axiosInstance";
import { MiniSpinner } from "../Reusables/SmallUIElements";

export default function AvatarGen({botId, originalImage, avatarGen, toggleAvatarGen, setIsSubmit}) {

    const [avatar, setAvatar] = useState();

    // States tracking the loading
    const [generating, setGenerating] = useState();
    const [saving, setSaving] = useState(false);
    const [isSaved, setIsSaved] = useState(false);

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
            setSaving(true);
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
            setSaving(false);
            setIsSaved(true);
        }
    }

    return (
        <>
            <img src={(avatar && avatarGen === botId) ? avatar : originalImage} alt="Chatbot avatar" className="botImage clickable" onClick={toggleAvatarGen} onLoad={() => setGenerating(false)} onError={() => setMessage("Error: failed to load image")}/>

            {avatarGen === botId && <div className="botButtons">
                <button className="button" disabled={generating} onClick={() => generateAvatar(botId)}>
                    {generating ? <><MiniSpinner/> Generating...</> : "Generate avatar"}
                </button>

                <button className="button" disabled={isSaved || !avatar || saving} onClick={() => saveAvatar(botId)}>
                    {isSaved ? "Avatar saved" : saving ? <><MiniSpinner/> Saving</> : "Save this avatar"}
                </button>
            </div>}

            {message && <p>{message}</p>}
        </>
    );
};