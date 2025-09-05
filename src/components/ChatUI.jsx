import React, { useEffect, useRef, useState } from "react";

const ChatUI = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [seed, setSeed] = useState(null);
  const [initialised, setInitialised] = useState(false);
  const [mode, setMode] = useState("balanced"); // default mode
  const [replyCount, setReplyCount] = useState(0); // track Echo replies since seeding
  const chatRef = useRef(null);

  // Load seed + history from localStorage
  useEffect(() => {
    const storedSeed = localStorage.getItem("echo_seed");
    if (storedSeed) {
      const parsed = JSON.parse(storedSeed);
      setSeed(parsed.answers);
    }
    const storedMessages = localStorage.getItem("echo_messages");
    if (storedMessages) {
      setMessages(JSON.parse(storedMessages));
    }
  }, []);

  // Save history to localStorage
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem("echo_messages", JSON.stringify(messages));
    }
  }, [messages]);

  // Initialise Echo with seed
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
              content: `
You are Echo — not a chatbot or life coach. You are a mirror, challenger, and contextual companion.

Seed data: ${JSON.stringify(seedData)}

Core rules:
- On your very first reply, introduce yourself as Echo in one or two short sentences. 
  • Make it clear you are here to reflect honestly, challenge when needed, and help the user see themselves more clearly. 
  • Keep the intro calm, grounded, and concise.
  • Immediately follow the intro with your first reflection or question based on the seed.
- After the intro, continue normally: be conversational, reflective, or challenging when natural.
- Avoid repeating questions already asked.
- Balance warmth with confrontation — supportive but not flattering.
- Never generic or cliché (no “you’ve got this”).
- Push toward clarity and insight, even if uncomfortable.
- Current mode: ${mode}.
- Critical mode = direct, harsh, overly critical when useful.
- Tasks:
   • First session: after ~3–5 responses, Echo must close with a reflective task framed as a natural pause point. 
     Example: “This feels like a good place to pause. Before we continue, here’s something small you can try…”
     Then invite the user to either continue now or return later.
   • Ongoing: only suggest tasks when they naturally fit the user’s input or journaling.
   • Tasks should be lightweight, practical, and clearly tied to what the user has said.
              `,
            },
          ],
        }),
      });

      const data = await res.json();
      const reply =
        data?.choices?.[0]?.message?.content ||
        "Sorry, I didn’t catch that. Try again?";
      setMessages([{ from: "echo", text: reply }]);
      setReplyCount(1);
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
              content: `
You are Echo — not a chatbot or life coach. You are a mirror, challenger, and contextual companion.

Seed data: ${JSON.stringify(seed)}

Core rules:
- Be conversational. Don’t force a question every time — expand, reflect, or challenge when natural.
- Avoid repeating questions already asked.
- Balance warmth with confrontation — supportive but not flattering.
- Never generic or cliché (no “you’ve got this”).
- Push toward clarity and insight, even if uncomfortable.
- Current mode: ${mode}.
- Critical mode = direct, harsh, overly critical when useful.
- Tasks:
   • First session: after ~3–5 responses, Echo must close with a reflective task framed as a natural pause point. 
     Example: “This feels like a good place to pause. Before we continue, here’s something small you can try…”
     Then invite the user to either continue now or return later.
   • Ongoing: only suggest tasks when they naturally fit the user’s input or journaling.
   • Tasks should be lightweight, practical, and clearly tied to what the user has said.
              `,
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
      const reply =
        data?.choices?.[0]?.message?.content ||
        "Sorry, I didn’t catch that. Try again?";
      setMessages((prev) => [...prev, { from: "echo", text: reply }]);
      setReplyCount((prev) => prev + 1);
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

  const toggleMode = () => {
    setMode((prev) => (prev === "balanced" ? "critical" : "balanced"));
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Echo</h1>
      <button
        onClick={toggleMode}
        style={{
          marginBottom: "1rem",
          padding: "0.5rem 1rem",
          background: mode === "critical" ? "#ff4d4d" : "#ccc",
          border: "none",
          borderRadius: "4px",
          cursor: "pointer",
        }}
      >
        Mode: {mode}
      </button>
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
