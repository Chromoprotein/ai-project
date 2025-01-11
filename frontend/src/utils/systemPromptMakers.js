export const processTraits = (traits, sliderData) => {
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

export const makeFullSystemPrompt = (botName, instructions, processedTraits, userInfo) => {
    const prompt = `Your name is ${botName}. ${instructions}` +
        (processedTraits ? ` ${processedTraits}` : '') +
        (userInfo ? ` The user has shared this information about themselves: ${userInfo}` : '');

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