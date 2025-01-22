export function Hello({bot = "AI", avatar, loadingBot}) {

  return (
    <div className="centeredContainer">
      {loadingBot ? <MiniSpinner /> : 
      <>
        <img src={avatar} alt={`Avatar of ${bot}`} className="botImage"/>
        <p className="title">Ask {bot} anything</p>
      </>}
    </div>
  );
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
    <div className="smallSpinnerWrapper">
      <div className="spinner smallSpinner"></div>
    </div>
  );
}

export function MiniOverlaySpinner() {
  return (
      <div className="spinner smallSpinner smallOverlaySpinner"></div>
  );
}