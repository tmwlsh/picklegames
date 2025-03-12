"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Container from "../container";

const JSONBIN_API_KEY = "$2a$10$Mhb3I4U5RlMV6i8O5taLO.Wol9NXkhN9tFY7NJd23bzI3t17d08Wi"; 
const JSONBIN_COLLECTION_ID = "67cf138b8561e97a50e9766e";

const CheckIcon = () => {
  return (
    <svg className="w-6 h-6" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM369 209L241 337c-9.4 9.4-24.6 9.4-33.9 0l-64-64c-9.4-9.4-9.4-24.6 0-33.9s24.6-9.4 33.9 0l47 47L335 175c9.4-9.4 24.6-9.4 33.9 0s9.4 24.6 0 33.9z"/></svg>
  )
}

const PickleballScheduler = () => {
  const [playerInput, setPlayerInput] = useState("");
  const [numCourts, setNumCourts] = useState(4);
  const [totalGames, setTotalGames] = useState(6);
  const [gameMode, setGameMode] = useState("doubles"); // "doubles" (default) or "singles"
  const router = useRouter();

  const PLAYERS_PER_COURT = gameMode === "doubles" ? 4 : 2;

  const generateGames = async () => {
    let players = playerInput
      .split(",")
      .map((name) => name.trim())
      .filter((name) => name !== "");

    if (players.length < numCourts * PLAYERS_PER_COURT) {
      alert(`Not enough players to fill all courts! (${PLAYERS_PER_COURT} per court required)`);
      return;
    }

    let playCount = {};
    players.forEach((player) => (playCount[player] = 0));

    let gameAssignments = [];
    let playerQueue = [...players];

    for (let i = 0; i < totalGames; i++) {
      let gameRound = [];
      let selectedPlayers = new Set();

      let sortedPlayers = [...players].sort((a, b) => playCount[a] - playCount[b]);
      sortedPlayers = shuffleWithinTiers(sortedPlayers, playCount);

      for (let j = 0; j < numCourts; j++) {
        let courtPlayers = [];

        while (courtPlayers.length < PLAYERS_PER_COURT && sortedPlayers.length > 0) {
          let player = sortedPlayers.shift();
          if (!selectedPlayers.has(player)) {
            courtPlayers.push(player);
            selectedPlayers.add(player);
            playCount[player]++;
          }
        }

        gameRound.push(courtPlayers);
      }

      let benchPlayers = players.filter((p) => !selectedPlayers.has(p));

      gameAssignments.push({ courts: gameRound, bench: benchPlayers });

      playerQueue.push(playerQueue.shift());
    }

    const timestamp = new Date().toISOString();

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
          gameMode: gameMode,
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

  // 🔀 **Shuffle Players Within Play Count Tiers for Fairness**
  const shuffleWithinTiers = (players, playCount) => {
    let groups = {};
    players.forEach((player) => {
      let count = playCount[player];
      if (!groups[count]) groups[count] = [];
      groups[count].push(player);
    });

    let shuffledPlayers = [];
    Object.keys(groups)
      .sort((a, b) => a - b)
      .forEach((tier) => {
        shuffledPlayers.push(...shuffle(groups[tier]));
      });

    return shuffledPlayers;
  };

  // 🔀 **Shuffle Helper Function**
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

        {/* 🔄 Radio Buttons for Singles / Doubles Mode */}
        <div className="mb-4">
          <p>Game Mode:</p>
          <div className="flex items-center w-full grid grid-cols-1 md:grid-cols-2 md:gap-2">
            <label className={`relative flex items-center justify-between w-full p-3 border rounded mb-2 md:mb-4 md:cursor-pointer ${gameMode === "doubles" ? "bg-gray-200" : ""}`}>
              <p>
                <input
                  type="radio"
                  value="doubles"
                  checked={gameMode === "doubles"}
                  onChange={() => setGameMode("doubles")}
                  className="mr-2 absolute opacity-0 pointer-events-none"
                />
                <span>Doubles (4 Players Per Court)</span>
              </p>
              {gameMode === "doubles" && (
                <CheckIcon className="ml-2" />
              )}
            </label>
            <label className={`relative flex items-center justify-between w-full p-3 border rounded mb-4 md:cursor-pointer ${gameMode === "singles" ? "bg-gray-200" : ""}`}>
              <p>
                <input
                  type="radio"
                  value="singles"
                  checked={gameMode === "singles"}
                  onChange={() => setGameMode("singles")}
                  className="mr-2 absolute opacity-0 pointer-events-none"
                />
                <span>Singles (2 Players Per Court)</span>
              </p>
              {gameMode === "singles" && (
                <CheckIcon className="ml-2" />
              )}
            </label>
          </div>
        </div>

        <button
          onClick={generateGames}
          className="bg-green-400 text-black px-6 py-4 rounded border border-green-900 md:cursor-pointer"
        >
          Generate Games
        </button>
      </Container>
    </div>
  );
};

export default PickleballScheduler;
