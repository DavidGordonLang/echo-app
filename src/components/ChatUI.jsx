import React, { useEffect, useRef, useState } from "react";

const ChatUI = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [seed, setSeed] = useState(null);
  const chatRef = useRef(null);

  useEffect(() => {
    const storedSeed = localStorage.getItem("echo_seed");
    if (storedSeed) {
      const parsed = JSON.parse(storedSeed);
      setSeed(parsed.answers);
      console.log("🌱 Loaded seed from localStorage:", parsed.answers);
    }
  }, []);

  useEffect(() => {
    if (seed && messages.length === 0) {
      sendMessageToGPT(
        "Begin with one gentle but insightful question based on the user's seed data."
      );
    }
  }, [seed]);

  const sendMessageToGPT = async (text, isSystem = false) => {
    if (!text.trim()) return;

    if (!isSystem) {
      setMessages((prev) => [...prev, { from: "user", text }]);
    }

    console.log("📤 Sending to GPT:", text);
    console.log("🧠 Current messages:", messages);

    try {
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: "gpt-4o",
          messages: [
            {
              role: "system",
              content:
                "You are Echo, a deeply personalised assistant. Your job is to reflect the user's thoughts back to them clearly, honestly, and without cheerleading. Use the following seed data to guide tone, questions, and support: " +
                JSON.stringify(seed),
            },
            ...messages.map((msg) => ({
              role: msg.from === "user" ? "user" : "assistant",
              content: msg.text,
            })),
            { role: "user", content: text },
          ],
        }),
      });

      const data = await response.json();
      const reply = data.choices?.[0]?.message?.content;

      if (reply) {
        console.log("✅ GPT reply:", reply);
        setMessages((prev) => [...prev, { from: "assistant", text: reply }]);
      } else {
        console.error("❌ No reply received from GPT. Full data:", data);
      }
    } catch (err) {
      console.error("🚨 Error calling GPT:", err);
    }

    setInput("");
  };

  const handleSend = () => {
    sendMessageToGPT(input);
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Echo</h1>
      <div
        style={{
          border: "1px solid #ccc",
          padding: "1rem",
          minHeight: "300px",
          whiteSpace: "pre-wrap",
          marginBottom: "1rem",
        }}
        ref={chatRef}
      >
        {messages.map((msg, i) => (
          <p key={i}>
            <strong>{msg.from === "user" ? "You" : "Echo"}:</strong> {msg.text}
          </p>
        ))}
      </div>
      <textarea
        rows={4}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Type here..."
        style={{ width: "100%", marginBottom: "1rem" }}
      />
      <button onClick={handleSend}>Send</button>
    </div>
  );
};

export default ChatUI;
