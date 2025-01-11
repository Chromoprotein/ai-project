import sliderData from "../../shared/botTraitData";

export default function BotDetails({bot}) {
    return (
        <>
            <div className="botTraits">
                {bot.traits ? bot.traits.map(botTrait => {
                    // Find the current score for this slider's ID
                    const sliderTrait = sliderData?.find((trait) => trait.id === botTrait.id);

                    let displayTrait;

                    if(botTrait.score < 0) {
                        displayTrait = sliderTrait.leftTrait;
                    } else {
                        displayTrait = sliderTrait.rightTrait;
                    }

                    return <div className="labelBubble">
                                <span>{displayTrait} ({Math.abs(botTrait.score)})</span>
                            </div>
                }) : <span  className="italic">No traits added</span>}
            </div>

            <p>
                <span className="smallLabel">Instructions: </span>
                {bot.instructions ? bot.instructions : <span className="italic">No instructions added</span>}
            </p>

            <p>
                <span className="smallLabel">Knowledge about the user: </span>
                {bot.userInfo ? bot.userInfo : <span className="italic">No user information added</span>}
            </p>
        </>
    );
};