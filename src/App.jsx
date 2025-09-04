import React, { useState, useEffect } from "react";
import SeedForm from "./components/SeedForm";
import ChatUI from "./components/ChatUI"; // coming soon

function App() {
  const [seeded, setSeeded] = useState(false);

  useEffect(() => {
    const storedSeed = localStorage.getItem("echo_seed");
    if (storedSeed) setSeeded(true);
  }, []);

  return (
    <div style={{ padding: "2rem", fontFamily: "sans-serif" }}>
      {seeded ? (
        <ChatUI />
      ) : (
        <SeedForm onComplete={() => setSeeded(true)} />
      )}
    </div>
  );
}

export default App;
