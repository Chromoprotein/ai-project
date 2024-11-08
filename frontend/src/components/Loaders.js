export function Loading({loading}) {
  return (
    <span>
      {loading && <p className="loading">...</p>}
    </span>
  );
}

export function Typing() {
  return (
    <div class="loader">
        <span></span>
        <span></span>
        <span></span>
    </div>    
  );
}