import React, { useState, useEffect } from "react";

const ChatUI = () => {
  const [seed, setSeed] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("echo_seed");
    if (stored) {
      const parsed = JSON.parse(stored);
      setSeed(parsed);
      setMessages([
        {
          role: "system",
          content: `You are Echo, a deeply personalised assistant. Your job is to reflect the user's thoughts back to them clearly, honestly, and without cheerleading. Use the following seed data to guide tone, questions, and support: ${JSON.stringify(
            parsed.answers
          )}`,
        },
        {
          role: "assistant",
          content:
            "Hello again. Based on what you shared, I’m here to reflect, challenge gently, and help you get clear. What’s on your mind today?",
        },
      ]);
    }
  }, []);

  const sendMessage = async () => {
    if (!input.trim()) return;
    const updatedMessages = [...messages, { role: "user", content: input }];
    setMessages(updatedMessages);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.REACT_APP_OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: "gpt-4o",
          messages: updatedMessages,
        }),
      });

      const data = await response.json();
      const reply = data.choices[0].message.content;

      setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
    } catch (err) {
      console.error("API error:", err);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Something went wrong." },
      ]);
    }

    setLoading(false);
  };

  return (
    <div>
      <h2>Echo</h2>
      <div
        style={{
          border: "1px solid #ccc",
          padding: "1rem",
          height: "60vh",
          overflowY: "scroll",
          marginBottom: "1rem",
        }}
      >
        {messages.map((msg, idx) => (
          <div key={idx} style={{ marginBottom: "1rem" }}>
            <strong>{msg.role === "user" ? "You" : "Echo"}:</strong>{" "}
            {msg.content}
          </div>
        ))}
        {loading && <em>Echo is thinking…</em>}
      </div>

      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        rows={3}
        style={{ width: "100%" }}
        placeholder="Type here…"
      />
      <button onClick={sendMessage} style={{ marginTop: "0.5rem" }}>
        Send
      </button>
    </div>
  );
};

export default ChatUI;
