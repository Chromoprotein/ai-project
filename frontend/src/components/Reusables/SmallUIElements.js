import { useState } from "react";

export function Hello({bot = "AI", avatar = ""}) {

  const imageSrc = avatar ? `data:image/webp;base64,${avatar}` : "/placeholderAvatar.webp";

  return (
    <div className="centeredContainer">
      <img src={imageSrc} alt={`Avatar of ${bot}`} className="botImage"/>
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