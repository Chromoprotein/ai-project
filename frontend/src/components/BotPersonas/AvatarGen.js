import { useState } from "react";
import axiosInstance from "../../utils/axiosInstance";
import { MiniOverlaySpinner } from "../Reusables/SmallUIElements";
import { RiEditCircleFill } from "react-icons/ri";
import { IoSparklesOutline } from "react-icons/io5";
import { FaSave } from "react-icons/fa";
import { MdDeleteForever } from "react-icons/md";

export default function AvatarGen({botId, originalImage, avatarGen, toggleAvatarGen, setIsSubmit}) {

    const [avatar, setAvatar] = useState();

    // States tracking the loading
    const [loading, setLoading] = useState(false);
    const [isSaved, setIsSaved] = useState(false);

    const [message, setMessage] = useState();

    const generateAvatar = async (botId) => {
        setMessage();
        setIsSaved(false);
        setLoading(true);
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
            setLoading(false);
            setMessage(error.message);
        }
    }

    const saveAvatar = async (botId) => {
        try {
            setLoading(true);
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
            setLoading(false);
            setIsSaved(true);
        }
    }

    const clearAvatar = async (botId) => {
        try {
            setLoading(true);
            const response = await axiosInstance.patch(
                `${process.env.REACT_APP_CLEARAVATAR}/${botId}`,
            );
            if(response) {
                setAvatar();
                setIsSubmit((prev) => !prev); // to fetch the updated bot data
            }
        } catch (error) {
            console.log(error);
            setMessage(error.message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <>
            <div className="botImageWrapper" onClick={toggleAvatarGen} >
                <div className="botImageEditIcon"><RiEditCircleFill size={25}/></div>
                {loading && <MiniOverlaySpinner/>}
                <img 
                    src={(avatar && avatarGen === botId) ? avatar : originalImage} 
                    alt="Chatbot avatar" 
                    className={`botImage clickable ${loading && "botImageLoading"}`} 
                    onLoad={() => setLoading(false)} 
                    onError={() => setMessage("Error: failed to load image")}
                />
            </div>

            {avatarGen === botId && <div className="botButtons">
                <button className="botButton" disabled={loading} onClick={() => generateAvatar(botId)}>
                    <span className="buttonIcon"><IoSparklesOutline/></span>
                    <span className="buttonText">Generate avatar</span>
                </button>

                <button className="botButton" disabled={isSaved || !avatar || loading} onClick={() => saveAvatar(botId)}>
                    <span className="buttonIcon"><FaSave/></span>
                    <span className="buttonText">{isSaved ? "Avatar saved" : "Save this avatar"}</span>
                </button>

                <button className="botButton" disabled={!originalImage || loading} onClick={() => clearAvatar(botId)}>
                    <span className="buttonIcon"><MdDeleteForever/></span>
                    <span className="buttonText">Delete avatar</span>
                </button>
            </div>}

            <div className="errorMessage">
                {message && <p>{message}</p>}
            </div>
        </>
    );
};