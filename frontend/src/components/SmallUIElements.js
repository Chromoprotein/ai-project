export function Hello({bot = "AI"}) {

  return (
    <div className="centeredContainer">
      <p className="title">{bot}: How can I help you?</p>
    </div>
  )
}