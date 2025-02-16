export const processTraits = (traits, sliderData) => {

    if(traits.length === 0) {
        return null;
    }

    // Map over the formData array to transform it
    const processedTraits = traits.map((trait) => {
        // Find the matching sliderData object by ID
        const slider = sliderData.find((s) => s.id === trait.id);

        // Determine the active trait based on the score
        const activeTrait = trait.score < 0 ? slider.leftTrait : slider.rightTrait;

        return {
            trait: activeTrait, // The trait name
            score: Math.abs(trait.score), // Convert negative scores to positive
        };
    });

    const traitDescriptions = processedTraits
        .map((t) => `${t.trait} (${t.score})`) 
        .join(", ");
    
    return `You have the following traits: ${traitDescriptions}. The maximum value is 100.`;
};

export const processSharedData = (sharedData) => {
    if (Object.keys(sharedData).length === 0) {
        return null;
    }

    let processedGoals = null;
    if (sharedData?.sharedGoals?.length > 0) {
        processedGoals = sharedData.sharedGoals.map((goal, index) => (`Goal ${index + 1}. ${goal.goal}`)).toString();
    }

    const processedSharedData = 
        (sharedData?.shareUsername ? `The user's name is ${sharedData?.shareUsername}` : "") + 
        (sharedData?.shareAboutMe ? ` Information about the user: ${sharedData?.shareAboutMe}` : "") +
        (sharedData?.shareInterestsHobbies ? ` The user's interests and hobbies: ${sharedData?.shareInterestsHobbies}` : "") +
        (sharedData?.shareCurrentMood ? ` The user's current mood: ${sharedData?.shareCurrentMood}` : "") + 
        (processedGoals ? ` The user's current goals: ${processedGoals}` : "");

    return processedSharedData;
};

export const makeFullSystemPrompt = (botName, instructions, traits, sliderData, userInfo, sharedData) => {

    const processedTraits = processTraits(traits, sliderData);
    const processedSharedData = processSharedData(sharedData);

    const prompt = (botName ? `Your name is ${botName}` : '') +
        (instructions ? ` ${instructions}` : '') +
        (processedTraits ? ` ${processedTraits}` : '') +
        (processedSharedData ? ` ${processedSharedData}` : '') +
        (userInfo ? ` Additional information about the user: ${userInfo}` : '');

    return {
        role: "system",
        content: [
            {
                type: "text",
                text: prompt,
            },
        ],
    };
}