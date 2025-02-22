import { useState } from "react";

export default function useAvatarToggler() {
    const [showAvatarGen, setShowAvatarGen] = useState({ bots: {}, user: false });

    const toggleAvatarGen = (id, entityType) => {
        setShowAvatarGen((prev) => {
            if (entityType === "bot") {
                return {
                    ...prev,
                    bots: { 
                        ...prev.bots, 
                        [id]: !prev.bots[id] // Toggle the bot's avatar view
                    }
                };
            } else if (entityType === "user") {
                return {
                    ...prev,
                    user: !prev.user // Toggle the user's avatar view
                };
            }
            return prev;
        });
    };

    return { showAvatarGen, toggleAvatarGen };
}
