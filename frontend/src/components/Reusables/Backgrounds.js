export default function Background({ theme }) {
  return (
    <>
      {theme === "light" ? <CloudBackground /> : <StarBackground />};
    </>
  );
}

function StarBackground() {
  return (
    <div className="star-layers">
      <div className="star-layer" id="stars"></div>
      <div className="star-layer" id="stars2"></div>
      <div className="star-layer" id="stars3"></div>
    </div>
  );
}

function CloudBackground() {
  return (
    <div className="cloud-layers">
      <div className="cloud-layer" id="clouds-small"></div>
      <div className="cloud-layer" id="clouds-medium"></div>
      <div className="cloud-layer" id="clouds-large"></div>
    </div>
  );
}