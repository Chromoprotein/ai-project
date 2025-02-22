import Layout from "../Reusables/Layout";
import { useMode } from "../../utils/useMode";
import { FaEdit } from "react-icons/fa";
import { useState, useEffect } from "react";
import axiosInstance from "../../utils/axiosInstance";
import { MdDeleteForever } from "react-icons/md";
import { FaPlusCircle } from "react-icons/fa";
import { FaEye } from "react-icons/fa";
import IconButton from "../Reusables/IconButton";
import BackButton from '../Reusables/BackButton';
import { useChats } from "../../utils/useChats";
import { Spinner } from "../Reusables/SmallUIElements";
import AvatarManager from "../Reusables/AvatarManager";
import useAvatar from "../../utils/useAvatar";
import useAvatarToggler from "../../utils/useAvatarToggler";

export default function UserProfile() {

    const { theme } = useMode();
    
    const { getUser, userData, loadingUser } = useChats();

    const [edit, setEdit] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const [formData, setFormData] = useState(null);

    const [isSubmit, setIsSubmit] = useState(false);

    const { showAvatarGen, toggleAvatarGen } = useAvatarToggler();

    useEffect(() => {
        getUser();
    }, [getUser]);

    useEffect(() => {
        if(userData) {
            setFormData(userData);
        };
    }, [userData]);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const toggleEdit = () => {
        setEdit((prev) => !prev);
    }

    const buttons = (
        <>
            <BackButton />
            <IconButton func={toggleEdit} condition={edit} trueIcon={<FaEye/>} trueText="View profile" falseIcon={<FaEdit />} falseText="Edit profile" changeClass="botButton" />
        </>
    );

    const filterEmptyGoals = () => {
        const newFormData = {
            ...formData,
            currentGoals: formData.currentGoals.filter(goal => goal.goal.length > 0)
        };
        setFormData(newFormData);
        return newFormData;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const filteredFormData = filterEmptyGoals();
            setMessage("");
            const response = await axiosInstance.put(
                process.env.REACT_APP_UPDATEUSER,
                filteredFormData
            );
            if (response) {
                setMessage(response.data.message);
            }
        } catch (error) {
            console.error(error);
            setError(error.message);
        }
    };

    const handleAddGoal = () => {
        setFormData({
            ...formData, 
            currentGoals: [...formData.currentGoals, { id: Date.now(), goal: "" }]
        });
    }

    const handleRemoveGoal = (id) => {
        setFormData({
            ...formData,
            currentGoals: formData.currentGoals.filter(goal => goal.id !== id)
        });
    }

    const handleChangeGoal = (id, value) => {
        setFormData({
            ...formData,
            currentGoals: formData.currentGoals.map(goal => goal.id === id ? {...goal, goal: value} : goal)
        });
    }

    if (loadingUser || !formData) return <Spinner />;

    const formFields = [
        { label: "Username", type: "text", name: "username", value: formData.username, onChange: handleChange },
        { label: "Email (never shared with bots)", type: "text", name: "email", value: formData.email, onChange: handleChange },
        { label: "About me", type: "text", name: "aboutMe", value: formData.aboutMe, onChange: handleChange, inputType: "textarea" },
        { label: "My interests and hobbies", type: "text", name: "interestsHobbies", value: formData.interestsHobbies, onChange: handleChange, inputType: "textarea" },
        { label: "My current mood", type: "text", name: "currentMood", value: formData.currentMood, onChange: handleChange }
    ];

    const emptyField = <p className="emptyField">This field is empty</p>;

    return (
        <Layout theme={theme} buttons={buttons}>
            <form onSubmit={handleSubmit} className="formContainer">
                <div className="formItem">
                    <h2>{formData.username}'s profile</h2>
                </div>

                <AvatarManager 
                    id={userData.userId}
                    originalImage={userData.avatar && `data:image/webp;base64,${userData.avatar}`}
                    showAvatarGen={showAvatarGen.user}
                    toggleAvatarGen={() => toggleAvatarGen(null, "user")} 
                    setIsSubmit={setIsSubmit}
                    entityType="user"
                />

                {formFields.map(({ label, type, name, value, onChange, inputType }) => (
                    <div key={name} className="formItem">
                        <label className="smallLabel">{label}</label>
                        {edit ?
                            <>
                                {inputType === "textarea" ?
                                    <textarea type={type} name={name} value={value} onChange={onChange}></textarea> : 
                                    <input type={type} name={name} value={value} className="inputElement" onChange={onChange} />
                                }
                            </> 
                        : 
                            <>{value && value.length > 0 ? <p>{value}</p> : <>{emptyField}</>}</>
                        }
                    </div>
                ))}

                {formData.currentGoals?.map((field, index) => (
                    <div key={field.id} className="formItem">
                        <div className="spacedItemsWrapper">
                            <label className="smallLabel">My goal {index+1}</label>
                            {edit && <button type="button" className="iconButton" onClick={() => handleRemoveGoal(field.id)}>
                                <MdDeleteForever/>
                            </button>}
                        </div>
                        {edit ? 
                            <textarea
                                type="text"
                                value={field.goal}
                                onChange={(e) => handleChangeGoal(field.id, e.target.value)}
                            ></textarea> 
                        :
                            <>{field.goal.length > 0 ? <p>{field.goal}</p> : <>{emptyField}</>}</>
                        }
                    </div>
                ))}
                {edit && 
                    <>
                        {formData.currentGoals.length < 3 ? 
                            <IconButton changeClass="textButton" func={handleAddGoal} icon={<FaPlusCircle/>} text="Goal" />
                        : 
                            <div className="formItem">
                                <div className="formInfo">You can enter max. 3 goals</div>    
                            </div>
                        }
                    </>
                }

                {edit && <div className="formItem">
                    <button className="button" type="submit">
                        Save changes
                    </button>
                </div>}

                {message && (
                    <div className="formItem">
                    <p className="formInfo">{message}</p>
                    </div>
                )}
                {error && (
                    <div className="formItem">
                    <p className="formInfo errorMessage">{error}</p>
                    </div>
                )}
            </form>
        </Layout>
    );
}