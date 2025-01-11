import ReactSlider from "react-slider";
import { FaChevronDown } from "react-icons/fa";
import { FaChevronUp } from "react-icons/fa";
import axiosInstance from "../../utils/axiosInstance";
import { useState } from "react";
import sliderData from "../../shared/botTraitData";

export default function BotForm({ initialState, edit, toggleEdit, setIsSubmit }) {

    const [formData, setFormData] = useState(initialState);
    const [showAdvanced, setShowAdvanced] = useState(false);
    const [error, setError] = useState("");
    const [deleteWarning, setDeleteWarning] = useState(false);

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
            const response = await axiosInstance.post(
                endpoint,
                formData
            );
            if (response) {
                console.log(response.status.message);
                setIsSubmit((prev) => !prev); // to refetch the bots
            }
        } catch (error) {
            console.error(error);
            setError(error.message);
        }

    };

    const toggleDeleteWarning = () => {
        setDeleteWarning((prev) => !prev);
    };

    const deleteBot = async (botId) => {
        try {
            const response = await axiosInstance.delete(
                `${process.env.REACT_APP_DELETEBOT}/${botId}`,
            );
            if (response) {
                console.log(response.status.message);
                setIsSubmit((prev) => !prev); // to refetch the bots
            }
        } catch (error) {
            console.error(error);
            setError(error.message);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="formContainer">

            <div className="formItem">
                <h1>{edit ? "Edit" : "New"} bot persona</h1>
            </div>

            <div className="formItem">
                <label className="smallLabel">Name *</label>
                <input type="text" name="botName" value={formData.botName} onChange={handleChange} />
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

                <p className="textButton" onClick={toggleAdvanced}>
                    {showAdvanced ? (<>Show Less <FaChevronUp /> </>) : (<>Show More <FaChevronDown /></>)}
                </p>
            </div>

            <div className="formItem">
                <label className="smallLabel">The bot should know about you:</label>
                <textarea type="text" name="userInfo" value={formData.userInfo} onChange={handleChange}></textarea>
            </div>

            <div className="botButtons">
                <button className="button removeMargin" type="submit">
                    Submit
                </button>
                {edit && <>
                    <button className="textButton removeMargin" type="button" onClick={toggleEdit}>
                        Close
                    </button>
                    <button className="textButton removeMargin" type="button" onClick={toggleDeleteWarning}>
                        Delete
                    </button>
                </>}
            </div>

            {deleteWarning && <>
                <p>Confirm you want to delete this bot. Deleting is permanent.</p>
                <div className="botButtons">
                    <button className="button removeMargin" type="button" onClick={toggleDeleteWarning}>
                        Don't delete
                    </button>
                    <button className="textButton removeMargin" type="button" onClick={() => deleteBot(formData.botId)}>
                        Delete
                    </button>
                </div>
            </>}

            {error && (
                <div className="formItem">
                    {error}
                </div>
            )}
        </form>
    );
}