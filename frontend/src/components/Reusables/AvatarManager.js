import { RiEditCircleFill } from "react-icons/ri";
import { IoSparklesOutline } from "react-icons/io5";
import { FaSave } from "react-icons/fa";
import { MdDeleteForever } from "react-icons/md";
import useAvatar from "../../utils/useAvatar";
import { MiniOverlaySpinner } from "./SmallUIElements";
import IconButton from "./IconButton";

export default function AvatarManager({ id, originalImage, showAvatarGen, toggleAvatarGen, setIsSubmit, entityType = "bot" }) {

    const apiEndpoints = {
        generate: process.env.REACT_APP_GENERATEAVATAR,
        save: process.env.REACT_APP_SAVEAVATAR,
        clear: process.env.REACT_APP_CLEARAVATAR,
    };

    const { avatar, loading, isSaved, message, prompt, handlePromptChange, generateAvatar, saveAvatar, clearAvatar } = useAvatar(apiEndpoints, entityType);

    return (
        <>
            <div className="botImageWrapper" onClick={toggleAvatarGen}>
                <div className="botImageEditIcon"><RiEditCircleFill size={25}/></div>
                {loading && <MiniOverlaySpinner />}
                <img 
                    src={(avatar && showAvatarGen) ? avatar : (originalImage ? originalImage : "/placeholderAvatar.webp")} 
                    alt={`${entityType} avatar`} 
                    className={`botImage clickable ${loading && "botImageLoading"}`} 
                    onLoad={() => setIsSubmit((prev) => !prev)}
                    onError={() => console.log("Error: failed to load image")}
                />
            </div>

            {showAvatarGen && (
                <>
                    <div className="formContainer removePadding removeMargin">
                        <div className="formItem">
                            <label className="smallLabel">Custom prompt (optional). If omitted, the prompt will be based on the {entityType === "bot" ? "bot's instructions" : "profile text"}.</label>
                            <textarea 
                                className="inputElement" 
                                type="text" 
                                name="prompt" 
                                value={prompt} 
                                onChange={handlePromptChange} 
                            ></textarea>
                        </div>
                    
                        <div className="botButtons">
                            <IconButton changeClass="botButton" disabled={loading} func={() => generateAvatar(id)} icon={<IoSparklesOutline />} text="Generate avatar" />

                            <IconButton changeClass="botButton" disabled={isSaved || !avatar || loading} func={() => saveAvatar(id)} icon={<FaSave />} text={isSaved ? "Avatar saved" : "Save this avatar"} />

                            <IconButton changeClass="botButton" disabled={!originalImage || loading} func={() => clearAvatar(id)} icon={<MdDeleteForever />} text="Delete avatar" />
                        </div>
                    </div>
                </>
            )}

            {message && <div className="errorMessage"><p>{message}</p></div>}
        </>
    );
};