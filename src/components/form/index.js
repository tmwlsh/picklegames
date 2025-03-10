"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Container from "../container";

const JSONBIN_API_KEY = "$2a$10$Mhb3I4U5RlMV6i8O5taLO.Wol9NXkhN9tFY7NJd23bzI3t17d08Wi"; // Replace with your JSONBin API Key
const JSONBIN_COLLECTION_ID = "67cf138b8561e97a50e9766e"; // Optional

const PickleballScheduler = () => {
  const [playerInput, setPlayerInput] = useState("");
  const [numCourts, setNumCourts] = useState(4);
  const [totalGames, setTotalGames] = useState(6);
  const router = useRouter();

  const generateGames = async () => {
    let players = playerInput
      .split(",")
      .map((name) => name.trim())
      .filter((name) => name !== "");
  
    if (players.length < numCourts * 4) {
      alert("Not enough players to fill all courts!");
      return;
    }
  
    let playerQueue = shuffle([...players]);
    let gameAssignments = [];
  
    for (let i = 0; i < totalGames; i++) {
      let gameRound = [];
      let selectedPlayers = new Set();
  
      for (let j = 0; j < numCourts; j++) {
        let courtPlayers = [];
        while (courtPlayers.length < 4 && playerQueue.length > 0) {
          let player = playerQueue.shift();
          if (!selectedPlayers.has(player)) {
            courtPlayers.push(player);
            selectedPlayers.add(player);
          }
        }
        gameRound.push(courtPlayers);
      }
  
      gameAssignments.push({ courts: gameRound });
      playerQueue = [...playerQueue, ...shuffle([...selectedPlayers])];
    }
  
    try {
      console.log("Saving to JSONBin.io...");
      const response = await fetch("https://api.jsonbin.io/v3/b", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Master-Key": JSONBIN_API_KEY,
          "X-Bin-Private": "true", // Ensures the bin is private
        },
        body: JSON.stringify({ games: gameAssignments }),
      });
      
  
      const responseText = await response.text(); // Get raw response
      console.log("JSONBin.io Response:", responseText);
  
      if (!response.ok) {
        throw new Error(`JSONBin.io error: ${response.status} - ${responseText}`);
      }
  
      const data = JSON.parse(responseText);
  
      if (!data || !data.metadata || !data.metadata.id) {
        throw new Error("Invalid response from JSONBin.io");
      }
  
      const binId = data.metadata.id;
      router.push(`/results/${binId}`);
    } catch (error) {
      console.error("Error saving games:", error);
      alert(`Failed to save games: ${error.message}`);
    }
  };
  

  const shuffle = (array) => array.sort(() => Math.random() - 0.5);

  return (
    <div className="py-10">
      <Container>
        <label className="block mb-2">
          Player Names
          <input
            type="text"
            value={playerInput}
            onChange={(e) => setPlayerInput(e.target.value)}
            placeholder="Enter all players' names, separated by commas."
            className="w-full p-3 border rounded mb-4"
          />
        </label>
        <div className="grid grid-cols-2 gap-2">
          <label className="block mb-2">
            Number of Courts
            <input
              type="number"
              value={numCourts}
              onChange={(e) => setNumCourts(Number(e.target.value))}
              className="w-full p-3 border rounded mb-4"
            />
          </label>
          <label className="block mb-2">
            Total Games
            <input
              type="number"
              value={totalGames}
              onChange={(e) => setTotalGames(Number(e.target.value))}
              className="w-full p-3 border rounded mb-4"
            />
          </label>
        </div>
        <button
          onClick={generateGames}
          className="bg-green-500 text-green-900 font-bold px-4 py-2 rounded border border-green-900"
        >
          Generate Games
        </button>
      </Container>
    </div>
  );
};

export default PickleballScheduler;
