import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import axiosInstance from "../../utils/axiosInstance";
import Layout from "../Reusables/Layout";
import { useMode } from "../../utils/useMode";
import { Link } from "react-router-dom";

export default function ShareProfile() {

    const [searchParams, setSearchParams] = useSearchParams();
    const [botId, setBotId] = useState(searchParams.get("botId"));

    const [shareAboutMe, setShareAboutMe] = useState(false);
    const [shareInterestsHobbies, setShareInterestsHobbies] = useState(false);
    const [shareCurrentMood, setShareCurrentMood] = useState(false);
    const [sharedGoals, setSharedGoals] = useState([]);

    const [error, setError] = useState("");

    const { theme } = useMode();

    const [userData, setUserData] = useState({
        username: '',
        aboutMe: '',
        interestsHobbies: '',
        currentGoals: [],
        currentMood: '',
    });

    // Fetching the user profile for display purposes
    useEffect(() => {
        const getUser = async () => {
            try {
                const response = await axiosInstance.get(process.env.REACT_APP_GETUSER);
                if(response) {
                    const user = response.data;
                    setUserData({
                        username: user.username,
                        aboutMe: user.aboutMe,
                        interestsHobbies: user.interestsHobbies,
                        currentGoals: user.currentGoals.length > 0 ? user.currentGoals : [],
                        currentMood: user.currentMood
                    });
                    const botPreferences = user.sharedWithBots.find((bot) => bot.botId === botId);
                    if(botPreferences) {
                        setShareAboutMe(botPreferences.shareAboutMe || false);
                        setShareInterestsHobbies(botPreferences.shareInterestsHobbies || false);
                        setShareCurrentMood(botPreferences.shareCurrentMood || false);
                        setSharedGoals(botPreferences.sharedGoals || []);
                    }
                }
            } catch (error) {
                console.log(error);
                setError(error.message);
            }
        };
        getUser();
    }, [botId]); 

    // Handle form submission
    const handleUpdatePreferences = async (e) => {
        e.preventDefault();

        const sharingPreferences = {
            shareAboutMe,
            shareInterestsHobbies,
            shareCurrentMood,
            sharedGoals,
        };

        try {
            const response = await axiosInstance.put(process.env.REACT_APP_UPDATESHAREDUSERDATA, {
                botId,
                sharingPreferences,
            });
            if(response.status === 200) {
                alert("Sharing preferences updated successfully!");
            }
        } catch (error) {
            console.error("Error updating sharing preferences:", error);
            alert("Failed to update sharing preferences.");
        }
    };

    const handleSharedGoalsChange = (e) => {
        const selectedOptions = Array.from(e.target.selectedOptions).map((option) => parseInt(option.value));
        setSharedGoals(selectedOptions);
    };

    const buttons = (
        <>
            <Link to="/bots" className="botButton">Back</Link>
        </>
    );

    return (
        <Layout theme={theme} buttons={buttons}>
            <form className="formContainer" onSubmit={handleUpdatePreferences}>

                <div className="formItem">
                    <h1>Select profile data to share</h1>
                </div>

                <div className={`clickableText ${shareAboutMe && "clickedText"}`} onClick={() => setShareAboutMe((prev) => !prev)}>
                    <label className="smallLabel">About Me</label>
                    <p>{userData.aboutMe}</p>
                    <input // Hidden checkbox for accessibility
                        type="checkbox"
                        checked={shareAboutMe}
                        style={{ display: "none" }}
                        onChange={(e) => setShareAboutMe(e.target.checked)}
                    />
                </div>

                <div className={`clickableText ${shareInterestsHobbies && "clickedText"}`} onClick={() => setShareInterestsHobbies((prev) => !prev)}>
                    <label className="smallLabel">Interests & Hobbies</label>
                    <p>{userData.interestsHobbies}</p>
                    <input
                        type="checkbox"
                        checked={shareInterestsHobbies}
                        style={{ display: "none" }}
                        onChange={(e) => setShareInterestsHobbies(e.target.checked)}
                    />
                </div>

                <div className={`clickableText ${shareCurrentMood && "clickedText"}`} onClick={() => setShareCurrentMood((prev) => !prev)}>
                    <label className="smallLabel">Current Mood</label>
                    <p>{userData.currentMood}</p>
                    <input
                        type="checkbox"
                        checked={shareCurrentMood}
                        style={{ display: "none" }}
                        onChange={(e) => setShareCurrentMood(e.target.checked)}
                    />
                </div>

                <label className="smallLabel">Shared Goals</label>
                <>
                    {userData.currentGoals.map((goal) => {
                        const isSelected = sharedGoals.includes(goal.id);

                        return (
                            <div
                                key={goal.id}
                                className={`clickableText ${isSelected && "clickedText"}`}
                                onClick={() => {
                                    setSharedGoals((prev) =>
                                        isSelected
                                            ? prev.filter((goalId) => goalId !== goal.id) // Remove if already selected
                                            : [...prev, goal.id] // Add if not selected
                                    );
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
                    <button type="submit" className="button">Save preferences</button>
                </div>
            </form>
        </Layout>
    );

}