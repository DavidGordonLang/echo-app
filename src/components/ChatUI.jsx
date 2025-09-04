import React, { useState, useEffect } from "react";


export default function ChatUI({ seed }) {
const [messages, setMessages] = useState([]);
const [input, setInput] = useState("");
const [loading, setLoading] = useState(false);


const seedMessage = {
role: "system",
content: `You are Echo, a deeply personalised assistant. Your job is to reflect the user's thoughts back to them clearly, honestly, and without cheerleading. Use the following seed data to guide tone, questions, and support: [${seed
.map((line) => `"${line}"`)
.join(", ")}]. Begin with one gentle but insightful question based on the above.`
};


useEffect(() => {
// Start conversation
setMessages([seedMessage]);
fetchResponse(seedMessage);
}, []);


const fetchResponse = async (newMessage) => {
setLoading(true);
const body = {
model: "gpt-4o",
messages: [...messages, newMessage].filter((msg) => msg.role !== "system")
};


try {
const res = await fetch("https://api.openai.com/v1/chat/completions", {
method: "POST",
headers: {
"Content-Type": "application/json",
Authorization: `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`
},
body: JSON.stringify(body)
});


const data = await res.json();
const reply = data.choices?.[0]?.message;
if (reply) setMessages((prev) => [...prev, reply]);
} catch (err) {
console.error("API Error:", err);
}


setLoading(false);
};


const handleSubmit = (e) => {
e.preventDefault();
if (!input.trim()) return;
const newMsg = { role: "user", content: input };
setMessages((prev) => [...prev, newMsg]);
setInput("");
fetchResponse(newMsg);
};


return (
<div style={{ padding: "2rem", maxWidth: "800px", margin: "auto" }}>
<h1>Echo</h1>
<div style={{ whiteSpace: "pre-wrap", marginBottom: "2rem" }}>
{messages.map((m, i) => (
<p key={i}>
<strong>{m.role === "user" ? "You" : "Echo"}:</strong> {m.content}
</p>
))}
</div>


<form onSubmit={handleSubmit}>
<textarea
value={input}
onChange={(e) => setInput(e.target.value)}
rows={3}
style={{ width: "100%", marginBottom: "1rem" }}
placeholder="Type here..."
/>
<button type="submit" disabled={loading}>
Send
</button>
</form>
</div>
);
}
