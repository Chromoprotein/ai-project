import { useState } from "react";
import axiosInstance from "./axiosInstance";

export default function useAvatar(apiEndpoints, entityType) {
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
        } finally {
            setLoading(false);
        }
    };

    const saveAvatar = async (id) => {
        try {
            setLoading(true);
            const payload = entityType === "bot" ? { botId: id, avatar } : { avatar };

            const response = await axiosInstance.put(apiEndpoints.save, payload);
            if (response) {
                setIsSaved(true);
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
        } catch (error) {
            console.error(error);
            setMessage(error.message);
        } finally {
            setLoading(false);
        }
    };

    return {
        avatar,
        loading,
        isSaved,
        message,
        prompt,
        setAvatar,
        handlePromptChange,
        generateAvatar,
        saveAvatar,
        clearAvatar
    };
};