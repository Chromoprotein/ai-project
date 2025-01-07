import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { useChats } from "../utils/useChats";
import axiosInstance from "../utils/axiosInstance";

export default function Edit() {

    const { botId } = useParams();
    const { currentBot, getBot } = useChats();

    const [avatar, setAvatar] = useState();

    useEffect(() => {
        getBot(botId);
    }, [getBot, botId])

    const generateAvatar = async () => {
        try {
            const response = await axiosInstance.post(
                process.env.REACT_APP_GENERATEAVATAR,
                { botId: currentBot.botId }
            );
            if(response) {
                console.log(response.data[0].url)
                setAvatar(response.data[0].url);
            }
        } catch (error) {
            console.log(error);
        };
    }

    const saveAvatar = async () => {
        try {
            const response = await axiosInstance.put(
                process.env.REACT_APP_AVATAR,
                { 
                    botId: currentBot.botId,
                    avatar: avatar
                }
            );
            if(response) {
                console.log(response.data);
            }
        } catch (error) {
            console.log(error);
        };
    }

    return (
        <div>
            <p>{botId}</p>

            {avatar && <img src={avatar} className="botImage" alt="Bot avatar"/>}

            <button className="button" onClick={generateAvatar}>Generate avatar</button>

            {avatar && <button className="button" onClick={saveAvatar}>Save this avatar</button>}
        </div>
    );

};