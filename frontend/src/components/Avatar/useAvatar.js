import { useState } from "react";
import axiosInstance from "../../utils/axiosInstance";

export default function useAvatar(apiEndpoints, entityType, setIsSubmit) {
    const [avatar, setAvatar] = useState();
    const [loading, setLoading] = useState(false);
    const [isSaved, setIsSaved] = useState(false);
    const [message, setMessage] = useState();
    const [prompt, setPrompt] = useState();

    const handlePromptChange = (e) => setPrompt(e.target.value);

    const generateAvatar = async (id) => {
        setMessage();
        setIsSaved(false);
        setLoading(true);
        try {
            const fullData = entityType === "bot" ? { botId: id, prompt } : { prompt };

            const response = await axiosInstance.post(apiEndpoints.generate, fullData);
            if (response) {
                setAvatar(response.data[0].url);
            }
        } catch (error) {
            console.error(error);
            setMessage(error.message);
        } 
    };

    const saveAvatar = async (id) => {
        try {
            setLoading(true);
            const payload = entityType === "bot" ? { botId: id, avatar } : { avatar };

            const response = await axiosInstance.put(apiEndpoints.save, payload);
            if (response) {
                setIsSaved(true);
                setIsSubmit((prev) => !prev);
            }
        } catch (error) {
            console.error(error);
            setMessage(error.message);
        } finally {
            setLoading(false);
        }
    };

    const clearAvatar = async (id) => {
        try {
            setLoading(true);
            const endpoint = entityType === "bot" ? `${apiEndpoints.clear}/${id}` : apiEndpoints.clear;

            await axiosInstance.patch(endpoint);
            setAvatar();
            setIsSaved(false);
            setIsSubmit((prev) => !prev);
        } catch (error) {
            console.error(error);
            setMessage(error.message);
        } finally {
            setLoading(false);
        }
    };

    const discardWithoutSaving = () => {
        setAvatar();
    }

    return {
        avatar,
        loading,
        setLoading,
        isSaved,
        message,
        prompt,
        setAvatar,
        handlePromptChange,
        generateAvatar,
        saveAvatar,
        clearAvatar,
        discardWithoutSaving
    };
};