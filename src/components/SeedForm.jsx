import React, { useState } from "react";
import questions from "../data/questions";

function SeedForm({ onComplete }) {
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
      const seedObject = {
        answers,
        timestamp: new Date().toISOString()
      };
      localStorage.setItem("echo_seed", JSON.stringify(seedObject));
      onComplete();
    }
  };

  return (
    <div>
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
