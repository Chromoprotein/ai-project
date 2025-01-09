export function Hello({bot = "AI"}) {

  return (
    <div className="centeredContainer">
      <p className="title">{bot}: How can I help you?</p>
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