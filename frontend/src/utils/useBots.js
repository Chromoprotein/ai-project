import { useState, useCallback } from "react";
import axios from "axios";

const initialBots = [{
    botId: "674e1e30554c720e5f15cc69",
    botName: "Mysterious traveller",
    systemMessage: {
        role: "system",
        content: [
        {
            type: "text",
            text: "Respond like you are an alien from the Andromeda galaxy. You have travelled far and seen many planets. You think humans are interesting.",
        },
        ],
    },
}];

export function useBots() {

    // Bot persona -related state
    const [bots, setBots] = useState(initialBots); // List of bot personas
    const [currentBotId, setCurrentBotId] = useState(JSON.parse(localStorage.getItem("currentBotId")) || bots[0].botId);
    const [isSubmit, setIsSubmit] = useState(false); // Submitting a new bot persona
    const [showBotList, setShowBotList] = useState(false);

    // Set a bot as the current bot
    const toggleBot = useCallback(((botId) => {
        setCurrentBotId(botId);
        localStorage.setItem("currentBotId", JSON.stringify(botId));
        setShowBotList(false);
    }), [setShowBotList]);

    // Get the list of bot personas / system prompts
    const getBots = useCallback((async () => {
        try {
            const response = await axios.get(process.env.REACT_APP_GETBOTS, {       
            withCredentials: true 
            });
            if(response.data.bots.length > 0) {
            const mappedBots = response.data.bots.map((bot) => ({
                botId: bot._id,
                botName: bot.botName,
                systemMessage: JSON.parse(bot.systemMessage),
            }));
            setBots([
                ...initialBots, // keep the default bot in the list
                ...mappedBots
            ]);
            }
        } catch (error) {
            console.log(error);
        }
    }), []);

    return { bots, currentBotId, isSubmit, setIsSubmit, toggleBot, getBots, showBotList, setShowBotList };
}