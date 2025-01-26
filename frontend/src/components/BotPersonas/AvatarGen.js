import { useState } from "react";
import axiosInstance from "../../utils/axiosInstance";
import { MiniOverlaySpinner } from "../Reusables/SmallUIElements";
import { RiEditCircleFill } from "react-icons/ri";
import { IoSparklesOutline } from "react-icons/io5";
import { FaSave } from "react-icons/fa";
import { MdDeleteForever } from "react-icons/md";
import IconButton from "../Reusables/IconButton";

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
                <IconButton changeClass="botButton" disabled={loading} func={() => generateAvatar(botId)} icon={<IoSparklesOutline/>} text="Generate avatar" />

                <IconButton changeClass="botButton" disabled={isSaved || !avatar || loading} func={() => saveAvatar(botId)} icon={<FaSave/>} text={isSaved ? "Avatar saved" : "Save this avatar"} />

                <IconButton changeClass="botButton" disabled={!originalImage || loading} func={() => clearAvatar(botId)} icon={<MdDeleteForever/>} text="Delete avatar" />
            </div>}

            <div className="errorMessage">
                {message && <p>{message}</p>}
            </div>
        </>
    );
};