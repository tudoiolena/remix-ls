import { FormEvent, useState } from "react";

export default function Index() {
  const [command, setCommand] = useState("");
  const [content, setContent] = useState("");
  const [error, setError] = useState("");

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const response = await fetch("/api/ls", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ command }),
    });
    const result = await response.json();
    if (response.ok) {
      setError("");
      setContent(result.data);
    } else {
      setError(result.error);
      setContent("");
    }
    setCommand("");
  };

  return (
    <div>
      <form onSubmit={onSubmit}>
        <input
          type="text"
          value={command}
          onChange={(e) => setCommand(e.target.value)}
          placeholder="Enter ls command"
          required
        />
        <button type="submit">Enter</button>
      </form>
      <div id="content">
        <pre>{content}</pre>
      </div>
      {error && (
        <div id="error">
          <p>{error}</p>
        </div>
      )}
    </div>
  );
}
