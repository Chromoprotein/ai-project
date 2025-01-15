export function Hello({bot = "AI", avatar = "", loadingBot}) {

  const imageSrc = avatar ? `data:image/webp;base64,${avatar}` : "/placeholderAvatar.webp";

  return (
    <div className="centeredContainer">
      {loadingBot ? <Spinner /> : // Switch to a different, relatively positioned spinner
      <>
        <img src={imageSrc} alt={`Avatar of ${bot}`} className="botImage"/>
        <p className="title">Ask {bot} anything</p>
      </>}
    </div>
  )
}

export function Spinner() {
  return (
    <div className="loadingContainer">
      <div className="spinner bigSpinner"></div>
    </div>
  );
}

export function MiniSpinner() {
  return (
    <div className="spinner smallSpinner"></div>
  );
}