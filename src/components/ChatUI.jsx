import React, { useEffect, useRef, useState } from "react";

const ChatUI = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [seed, setSeed] = useState(null);
  const chatRef = useRef(null);
  const DEBUG = true; // Set to false to hide console logs

  useEffect(() => {
    const storedSeed = localStorage.getItem("echo_seed");
    if (storedSeed) {
      const parsed = JSON.parse(storedSeed);
      setSeed(parsed.answers);
    }
  }, []);

  useEffect(() => {
    if (seed && messages.length === 0) {
      sendMessageToGPT(
        "[SYSTEM INIT] Begin with one gentle but insightful question based on the user's seed data.",
        true
      );
    }
  }, [seed]);

  const buildSystemPrompt = () => {
    if (!seed) return "";
    return (
      "You are Echo, a deeply personalised assistant. Your job is to reflect the user's thoughts back to them clearly, honestly, and without cheerleading.\n\n" +
      "Seed reflections provided by the user include:\n" +
      seed.map((s, i) => `${i + 1}. ${s}`).join("\n") +
      "\n\nUse these to guide your tone, questions, and support. Begin with one gentle but insightful question based on the above."
    );
  };

  const sendMessageToGPT = async (text, isSystem = false) => {
    if (!text.trim()) return;

    if (!isSystem) {
      setMessages((prev) => [...prev, { from: "user", text }]);
    }

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
              content: buildSystemPrompt(),
            },
            ...messages
              .filter((msg) => msg.from !== "system")
              .map((msg) => ({
                role: msg.from === "user" ? "user" : "assistant",
                content: msg.text,
              })),
            { role: "user", content: text },
          ],
        }),
      });

      const data = await response.json();
      if (DEBUG) console.log("GPT API response:", data);

      const reply = data.choices?.[0]?.message?.content;
      if (reply) {
        setMessages((prev) => [...prev, { from: "echo", text: reply }]);
      } else {
        console.error("No reply from GPT:", data);
      }
    } catch (err) {
      console.error("API Error:", err);
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
