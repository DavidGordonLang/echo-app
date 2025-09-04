import React, { useState } from "react";
import questions from "../data/questions";

function SeedForm({ onSeedSubmit }) {
  const [answers, setAnswers] = useState(Array(questions.length).fill(""));
  const [current, setCurrent] = useState(0);

  const handleChange = (e) => {
    const updated = [...answers];
    updated[current] = e.target.value;
    setAnswers(updated);
  };

  const handleNext = () => {
    if (current < questions.length - 1) {
      setCurrent(current + 1);
    } else {
      // Save to localStorage (optional)
      const seedObject = {
        answers,
        timestamp: new Date().toISOString()
      };
      localStorage.setItem("echo_seed", JSON.stringify(seedObject));

      // ✅ Pass seed data back to App.jsx
      onSeedSubmit(answers);
    }
  };

  return (
    <div style={{ padding: "2rem", maxWidth: "600px", margin: "auto" }}>
      <h2>Welcome to Echo</h2>
      <p>{questions[current]}</p>
      <textarea
        value={answers[current]}
        onChange={handleChange}
        rows={5}
        style={{ width: "100%", marginTop: "1rem" }}
      />
      <button
        onClick={handleNext}
        style={{ marginTop: "1rem", padding: "0.5rem 1rem" }}
      >
        {current === questions.length - 1 ? "Finish" : "Next"}
      </button>
    </div>
  );
}

export default SeedForm;
