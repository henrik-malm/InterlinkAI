'use client'

import { useState } from "react";

export default function Home() {
  const prompt = "Write a quote of the day.";
  const [output, setOutput] = useState("Ohlala");

  const generateText = async () => {
    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt }), // Use the defined 'prompt' variable
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "API request failed");
      }

      const data = await response.json();
      setOutput(data.output);
    } catch (error) {
      console.error("Error generating text:", error);
      setOutput("go") // Show error message to the user
    }
  };

  return (
    <button onClick={generateText}>{output}</button> // Changed to a button for better UX
  );
}