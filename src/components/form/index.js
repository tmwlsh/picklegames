"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Container from "../container";

const JSONBIN_API_KEY =
  "$2a$10$Mhb3I4U5RlMV6i8O5taLO.Wol9NXkhN9tFY7NJd23bzI3t17d08Wi"; // Replace with your JSONBin API Key
const JSONBIN_COLLECTION_ID = "67cf138b8561e97a50e9766e"; // Optional

const PickleballScheduler = () => {
  const [playerInput, setPlayerInput] = useState("");
  const [numCourts, setNumCourts] = useState(4);
  const [totalGames, setTotalGames] = useState(6);
  const router = useRouter();

  const JSONBIN_COLLECTION_ID = "67cf138b8561e97a50e9766e"; // Ensure this exists

  const generateGames = async () => {
    let players = playerInput
      .split(",")
      .map((name) => name.trim())
      .filter((name) => name !== "");
  
    if (players.length < numCourts * 4) {
      alert("Not enough players to fill all courts!");
      return;
    }
  
    // Track how many times each player has played
    let playCount = {};
    players.forEach((player) => (playCount[player] = 0));
  
    let gameAssignments = [];
    let playerQueue = [...players]; // Copy player list
  
    for (let i = 0; i < totalGames; i++) {
      let gameRound = [];
      let selectedPlayers = new Set();
  
      // Sort players by fewest games played, then shuffle for variety
      let sortedPlayers = [...playerQueue].sort((a, b) => playCount[a] - playCount[b]);
      sortedPlayers = shuffle(sortedPlayers); // Shuffle within fairness constraints
  
      for (let j = 0; j < numCourts; j++) {
        let courtPlayers = [];
  
        while (courtPlayers.length < 4 && sortedPlayers.length > 0) {
          let player = sortedPlayers.shift(); // Pick the player with the least games (shuffled)
          if (!selectedPlayers.has(player)) {
            courtPlayers.push(player);
            selectedPlayers.add(player);
            playCount[player]++; // Increment their game count
          }
        }
  
        gameRound.push(courtPlayers);
      }
  
      gameAssignments.push({ courts: gameRound });
  
      // 🔄 **Rotate Players to Mix Matchups**
      playerQueue = [...playerQueue.slice(1), playerQueue[0]]; // Rotate first player to the end
    }
  
    const timestamp = new Date().toISOString(); // Store date and time
  
    try {
      console.log("Saving to JSONBin.io...");
      const response = await fetch("https://api.jsonbin.io/v3/b", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Master-Key": JSONBIN_API_KEY,
          "X-Bin-Private": "false",
          "X-Collection-Id": JSONBIN_COLLECTION_ID,
        },
        body: JSON.stringify({
          createdAt: timestamp,
          games: gameAssignments,
          playCount: playCount,
        }),
      });
  
      const responseText = await response.text();
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
  
  // 🔀 **Helper Function: Shuffle Array**
  const shuffle = (array) => {
    return array.sort(() => Math.random() - 0.5);
  };

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
