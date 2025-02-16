import { MiniSpinner } from "../Reusables/SmallUIElements";

export function Hello({bot = "AI", avatar = "/placeholderAvatar.webp", loadingBot}) {

  return (
    <div className="centeredContainer">
      {loadingBot ? <MiniSpinner /> : 
      <>
        <img src={avatar} alt={`Avatar of ${bot}`} className="botImage marginRight10"/>
        <p className="title">Ask {bot} anything</p>
      </>}
    </div>
  );
}