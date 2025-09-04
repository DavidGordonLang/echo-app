import React, { useState } from "react";
import SeedForm from "./components/SeedForm";
import ChatUI from "./components/ChatUI";

function App() {
  const [seedData, setSeedData] = useState(null);

  const handleSeedSubmit = (responses) => {
    setSeedData(responses);
  };

  return (
    <>
      {seedData ? (
        <ChatUI seed={seedData} />
      ) : (
        <SeedForm onSeedSubmit={handleSeedSubmit} />
      )}
    </>
  );
}

export default App;
