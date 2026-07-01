export function Loading({ label = 'Loading…' }) {
  return <div className="state-msg">{label}</div>;
}

export function ErrorState({ error }) {
  return (
    <div className="state-msg error">
      Couldn&apos;t load data: {error?.message || 'unknown error'}
    </div>
  );
}
