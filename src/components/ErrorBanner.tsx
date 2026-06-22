// Renders API errors. Connection failures get a richer "start the backend"
// message; everything else is a plain red line.
export function ErrorBanner({ message, offline }: { message: string; offline: boolean }) {
  if (offline) {
    return (
      <div className="error offline">
        <strong>Backend not reachable</strong>
        <p>
          The Kotlin API isn't responding on <code>localhost:8080</code>. Start it in a
          separate terminal:
        </p>
        <pre>cd payment-api &amp;&amp; ./gradlew bootRun</pre>
        <p className="offline-hint">Then try again — no need to reload.</p>
      </div>
    )
  }
  return <div className="error">{message}</div>
}
