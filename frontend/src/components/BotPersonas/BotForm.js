import ReactSlider from "react-slider";
import { FaChevronDown } from "react-icons/fa";
import { FaChevronUp } from "react-icons/fa";
import axiosInstance from "../../utils/axiosInstance";
import { useState } from "react";
import sliderData from "../../shared/botTraitData";
import { FaSave } from "react-icons/fa";
import { MdDeleteForever } from "react-icons/md";
import { RiCollapseDiagonal2Line } from "react-icons/ri";
import IconButton from "../Reusables/IconButton";
import { useDeleteWarning } from "../Reusables/useDeleteWarning";

export default function BotForm({ userData, initialState, initialSharedData, edit, toggleEdit, setIsSubmit }) {

    const [formData, setFormData] = useState(initialState);
    const [sharedData, setSharedData] = useState(initialSharedData);

    const [showAdvanced, setShowAdvanced] = useState(false);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");

    const { deleteWarning, toggleDeleteWarning, confirmMessage } = useDeleteWarning("Are you sure you want to permanently delete this bot?", () => deleteBot(formData.botId))

    const toggleAdvanced = () => {
        setShowAdvanced((prev) => !prev);
    }

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSliderChange = (id, newScore) => {
        setFormData((prevFormData) => {
            const currentTraits = prevFormData.traits || [];

            const updatedTraits = newScore === 0
                ? currentTraits.filter((trait) => trait.id !== id) // Remove if score is 0
                : currentTraits.some((trait) => trait.id === id) // Check whether object exists in formData
                    ? currentTraits.map((trait) =>
                        trait.id === id ? { ...trait, score: newScore } : trait
                    ) // Update existing
                    : [...currentTraits, { id, score: newScore }]; // Add new

            return {
                ...prevFormData,
                traits: updatedTraits, // Only update traits
            };
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            let endpoint;
            if(edit) {
               endpoint = process.env.REACT_APP_EDITBOT; 
            } else {
                endpoint = process.env.REACT_APP_CREATEBOT;
            }
            const allData = { formData, sharedData };
            const response = await axiosInstance.post(
                endpoint,
                allData
            );
            if (response) {
                setMessage("Persona updated");
                setIsSubmit((prev) => !prev); // to refetch the bots
            }
        } catch (error) {
            console.error(error);
            setError(error.message);
        }

    };

    const deleteBot = async (botId) => {
        try {
            const response = await axiosInstance.delete(
                `${process.env.REACT_APP_DELETEBOT}/${botId}`,
            );
            if (response) {
                setIsSubmit((prev) => !prev); // to refetch the bots
            }
        } catch (error) {
            console.error(error);
            setError(error.message);
        }
    };

    return (
        <div className="formBackground">
        <form onSubmit={handleSubmit} className="formContainer">

            <div className="formItem">
                <h1>{edit ? "Edit" : "New"} bot persona</h1>
            </div>

            <div className="formItem">
                <label className="smallLabel">Name *</label>
                <input className="inputElement" type="text" name="botName" value={formData.botName} onChange={handleChange} />
            </div>

            <div className="formItem">
                <label className="smallLabel">Instructions *
                </label>
                <textarea type="text" name="instructions" value={formData.instructions} onChange={handleChange}></textarea>
            </div>

            <div className="formItem">
                <label className="smallLabel">Traits</label>

                {sliderData.map(traitPair => {
                    // Find the current score for this slider's ID
                    const currentScore = formData.traits?.find((trait) => trait.id === traitPair.id)?.score || 0;

                    if(traitPair.isAdvanced && !showAdvanced) {
                        return null;
                    }

                    return (<div>
                        <label className="smallLabel sliderLabel">
                            <span className="labelLeft">{traitPair.leftTrait}</span>
                            <span className="labelCenter">{Math.abs(currentScore)}/100</span>
                            <span className="labelRight">{traitPair.rightTrait}</span>
                        </label>
                        <ReactSlider
                            className="customSlider"
                            thumbClassName="customThumb"
                            trackClassName="customTrack"
                            value={currentScore}
                            onChange={(value) => handleSliderChange(traitPair.id, value)}
                            min={-100}
                            max={100}
                            step={10} // Interval
                        />
                    </div>)
                })}

                <IconButton changeClass="textButton" func={toggleAdvanced} condition={showAdvanced} trueIcon={<FaChevronUp />} trueText="Show less" falseIcon={<FaChevronDown />} falseText="Show more" />
            </div>

            <div className="formItem">
                <label className="smallLabel">Select profile data to share</label>
            </div>

            <div className={`clickableText ${sharedData.shareUsername && "clickedText"}`} onClick={() => setSharedData((prev) => ({...prev, shareUsername: !prev.shareUsername}))}>
                <label className="smallLabel">Username</label>
                <p>{userData.username}</p>
                <input // Hidden checkbox for accessibility
                    type="checkbox"
                    checked={sharedData.shareUsername}
                    style={{ display: "none" }}
                    onChange={() => {}}
                />
            </div>

            <div className={`clickableText ${sharedData.shareAboutMe && "clickedText"}`} onClick={() => setSharedData((prev) => ({...prev, shareAboutMe: !prev.shareAboutMe}))}>
                <label className="smallLabel">About Me</label>
                <p>{userData.aboutMe}</p>
                <input // Hidden checkbox for accessibility
                    type="checkbox"
                    checked={sharedData.shareAboutMe}
                    style={{ display: "none" }}
                    onChange={() => {}}
                />
            </div>

            <div className={`clickableText ${sharedData.shareInterestsHobbies && "clickedText"}`} onClick={() => setSharedData((prev) => ({...prev, shareInterestsHobbies: !prev.shareInterestsHobbies}))}>
                <label className="smallLabel">Interests & Hobbies</label>
                <p>{userData.interestsHobbies}</p>
                <input
                    type="checkbox"
                    checked={sharedData.shareInterestsHobbies}
                    style={{ display: "none" }}
                    onChange={() => {}}
                />
            </div>

            <div className={`clickableText ${sharedData.shareCurrentMood && "clickedText"}`} onClick={() => setSharedData((prev) => ({...prev, shareCurrentMood: !prev.shareCurrentMood}))}>
                <label className="smallLabel">Current Mood</label>
                <p>{userData.currentMood}</p>
                <input
                    type="checkbox"
                    checked={sharedData.shareCurrentMood}
                    style={{ display: "none" }}
                    onChange={() => {}}
                />
            </div>

            <label className="smallLabel leftText">Current goals</label>
            <>
                {userData.currentGoals.map((goal) => {
                    const isSelected = sharedData.sharedGoals?.includes(goal.id) || false;
                    
                    return (
                        <div
                            key={goal.id}
                            className={`clickableText ${isSelected && "clickedText"}`}
                            onClick={() => {
                                setSharedData((prev) => ({
                                    ...prev,
                                    sharedGoals: isSelected
                                        ? prev.sharedGoals.filter((goalId) => goalId !== goal.id)
                                        : [...prev.sharedGoals, goal.id]
                                }));
                            }}
                        >
                            {goal.goal}
                            {/* Hidden checkbox for accessibility */}
                            <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => {}} // No direct onChange; handled by div click
                                style={{ display: "none" }} // Hide the checkbox
                            />
                        </div>
                    );
                })}
            </>

            <div className="formItem">
                <label className="smallLabel">Additional information bot should know about you:</label>
                <textarea type="text" name="userInfo" value={formData.userInfo} onChange={handleChange}></textarea>
            </div>

            <div className="botButtons">
                <IconButton type="submit" changeClass="botButton" icon={<FaSave/>} text="Submit" />
                {edit && <>
                    <IconButton changeClass="botButton" func={toggleEdit} icon={<RiCollapseDiagonal2Line/>} text="Close" />
                    <IconButton changeClass="iconButton" func={toggleDeleteWarning} icon={<MdDeleteForever/>} />
                </>}
            </div>

            {message && 
                <div className="formItem">
                    <div className="formInfo">{message}</div>
                </div>
            }
            
            {deleteWarning && confirmMessage}

            {error && (
                <div className="formItem">
                    {error}
                </div>
            )}
        </form>
        </div>
    );
}