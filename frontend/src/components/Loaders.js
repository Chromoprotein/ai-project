export function Loading({loading}) {
  return (
    <span>
      {loading && <p className="loading">...</p>}
    </span>
  );
}