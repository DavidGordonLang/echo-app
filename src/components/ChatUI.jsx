import React, { useEffect, useRef, useState } from "react";

const ChatUI = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [seed, setSeed] = useState(null);
  const [initialised, setInitialised] = useState(false);
  const chatRef = useRef(null);

  // Load seed from localStorage
  useEffect(() => {
    const storedSeed = localStorage.getItem("echo_seed");
    if (storedSeed) {
      const parsed = JSON.parse(storedSeed);
      setSeed(parsed.answers);
    }
  }, []);

  // Initialise Echo with seed once it's loaded
  useEffect(() => {
    if (seed && !initialised) {
      initialiseEcho(seed);
    }
  }, [seed, initialised]);

  const initialiseEcho = async (seedData) => {
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
              content: `You are Echo, a deeply personalised assistant. Your job is to reflect the user's thoughts back to them clearly, honestly, and without cheerleading. Use the following seed data to guide tone, questions, and support: ${JSON.stringify(
                seedData
              )}. Begin with one gentle but insightful question based on the above.`,
            },
          ],
        }),
      });

      const data = await response.json();
      const reply = data.choices[0].message.content;
      setMessages([{ from: "echo", text: reply }]);
      setInitialised(true);
    } catch (err) {
      console.error("Initialisation Error:", err);
    }
  };

  const sendMessageToGPT = async (text) => {
    if (!text.trim()) return;

    const updatedMessages = [...messages, { from: "user", text }];
    setMessages(updatedMessages);

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
              content: `You are Echo, a deeply personalised assistant. Your job is to reflect the user's thoughts back to them clearly, honestly, and without cheerleading. Use the following seed data to guide tone, questions, and support: ${JSON.stringify(
                seed
              )}.`,
            },
            ...updatedMessages.map((msg) => ({
              role: msg.from === "user" ? "user" : "assistant",
              content: msg.text,
            })),
          ],
        }),
      });

      const data = await response.json();
      const reply = data.choices[0].message.content;
      setMessages((prev) => [...prev, { from: "echo", text: reply }]);
    } catch (err) {
      console.error("Chat Error:", err);
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
