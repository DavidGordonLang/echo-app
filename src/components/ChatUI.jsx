import React, { useEffect, useRef, useState } from "react";

const ChatUI = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [seed, setSeed] = useState(null);
  const [initialised, setInitialised] = useState(false);
  const chatRef = useRef(null);

  // Pull seed data from localStorage
  useEffect(() => {
    const storedSeed = localStorage.getItem("echo_seed");
    if (storedSeed) {
      const parsed = JSON.parse(storedSeed);
      setSeed(parsed.answers);
    }
  }, []);

  // Initialise Echo once with seed
  useEffect(() => {
    if (seed && !initialised) {
      initialiseEcho(seed);
      setInitialised(true);
    }
  }, [seed, initialised]);

  const initialiseEcho = async (seedData) => {
    try {
      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.REACT_APP_OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: "gpt-4o",
          messages: [
            {
              role: "system",
              content:
                "You are Echo, a deeply personalised assistant. Your job is to reflect the user's thoughts back to them clearly, honestly, and without cheerleading. Use the following seed data to guide tone, questions, and support: " +
                JSON.stringify(seedData) +
                ". Begin with one gentle but insightful question based on the above.",
            },
          ],
        }),
      });

      const data = await res.json();
      console.log("🔍 Initial Echo Response:", data);

      const reply =
        data?.choices?.[0]?.message?.content ||
        "Sorry, I didn’t catch that. Try again?";
      setMessages([{ from: "echo", text: reply }]);
    } catch (err) {
      console.error("🚨 Init Error:", err);
      setMessages([
        { from: "echo", text: "There was a problem reaching Echo. Try again shortly." },
      ]);
    }
  };

  const sendMessageToGPT = async (text) => {
    if (!text.trim()) return;

    const userMsg = { from: "user", text };
    setMessages((prev) => [...prev, userMsg]);

    try {
      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.REACT_APP_OPENAI_API_KEY}`,
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

      const data = await res.json();
      console.log("🔍 Echo Response:", data);

      const reply =
        data?.choices?.[0]?.message?.content ||
        "Sorry, I didn’t catch that. Try again?";
      setMessages((prev) => [...prev, { from: "echo", text: reply }]);
    } catch (err) {
      console.error("🚨 Chat Error:", err);
      setMessages((prev) => [
        ...prev,
        { from: "echo", text: "There was a problem reaching Echo. Try again shortly." },
      ]);
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
