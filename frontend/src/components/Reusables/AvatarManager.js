import { RiEditCircleFill } from "react-icons/ri";
import { IoSparklesOutline } from "react-icons/io5";
import { FaSave } from "react-icons/fa";
import { MdDeleteForever } from "react-icons/md";
import useAvatar from "../../utils/useAvatar";
import { MiniOverlaySpinner } from "./SmallUIElements";
import IconButton from "./IconButton";

export default function AvatarManager({ id, originalImage, avatarGen, toggleAvatarGen, setIsSubmit, entityType = "bot" }) {

    const apiEndpoints = {
        generate: process.env.REACT_APP_GENERATEAVATAR,
        save: process.env.REACT_APP_AVATAR,
        clear: process.env.REACT_APP_CLEARAVATAR,
    };

    const { avatar, loading, isSaved, message, prompt, handlePromptChange, generateAvatar, saveAvatar, clearAvatar } = useAvatar(apiEndpoints, entityType);

    return (
        <>
            <div className="botImageWrapper" onClick={toggleAvatarGen}>
                <div className="botImageEditIcon"><RiEditCircleFill size={25}/></div>
                {loading && <MiniOverlaySpinner />}
                <img 
                    src={(avatar && avatarGen === id) ? avatar : (originalImage ? originalImage : "/placeholderAvatar.webp")} 
                    alt={`${entityType} avatar`} 
                    className={`botImage clickable ${loading && "botImageLoading"}`} 
                    onLoad={() => setIsSubmit((prev) => !prev)} 
                    onError={() => console.log("Error: failed to load image")}
                />
            </div>

            {avatarGen === id && (
                <div className="botButtons">
                    <div className="formItem">
                        <label className="smallLabel">Avatar prompt</label>
                        <input 
                            className="inputElement" 
                            type="text" 
                            name="prompt" 
                            value={prompt} 
                            onChange={handlePromptChange} 
                        />
                    </div>

                    <IconButton changeClass="botButton" disabled={loading} func={() => generateAvatar(id)} icon={<IoSparklesOutline />} text="Generate avatar" />

                    <IconButton changeClass="botButton" disabled={isSaved || !avatar || loading} func={() => saveAvatar(id)} icon={<FaSave />} text={isSaved ? "Avatar saved" : "Save this avatar"} />

                    <IconButton changeClass="botButton" disabled={!originalImage || loading} func={() => clearAvatar(id)} icon={<MdDeleteForever />} text="Delete avatar" />
                </div>
            )}

            {message && <div className="errorMessage"><p>{message}</p></div>}
        </>
    );
};