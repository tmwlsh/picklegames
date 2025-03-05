"use client";

import { useState } from "react";
import Container from "../container";

const PickleballScheduler = () => {
  const [playerInput, setPlayerInput] = useState("");
  const [games, setGames] = useState([]);

  const COURTS = 4;
  const PLAYERS_PER_GAME = 4;
  const TOTAL_GAMES = 6;

  const [numCourts, setNumCourts] = useState(COURTS);
  const [totalGames, setTotalGames] = useState(TOTAL_GAMES);

  const generateGames = async () => {
    let players = playerInput
      .split(",")
      .map((name) => name.trim())
      .filter((name) => name !== "");
  
    if (players.length < numCourts * PLAYERS_PER_GAME) {
      alert("Not enough players to fill all courts!");
      return;
    }
  
    let playerQueue = shuffle([...players]); 
    let gameAssignments = [];
  
    for (let i = 0; i < totalGames; i++) {
      let gameRound = [];
      let selectedPlayers = new Set();
  
      for (let j = 0; j < numCourts; j++) {
        if (playerQueue.length < PLAYERS_PER_GAME) {
          playerQueue = shuffle([...players]);
        }
  
        let courtPlayers = [];
        while (courtPlayers.length < PLAYERS_PER_GAME && playerQueue.length > 0) {
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
  
    const uniqueId = `match-${Date.now()}`;
  
    // ✅ Send match data to the API instead of localStorage
    await fetch("/api/matches", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: uniqueId, games: gameAssignments }),
    });
  
    // Redirect to match list
    window.location.href = `/matches/${uniqueId}`;
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
              placeholder="Number of courts"
              className="w-full p-3 border rounded mb-4"
            />
          </label>
          <label className="block mb-2">
            Total Games
            <input
              type="number"
              value={totalGames}
              onChange={(e) => setTotalGames(Number(e.target.value))}
              placeholder="Total games"
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

        {games.length > 0 && (
          <div className="mt-6">
            {games.map((game, gameIndex) => (
              <div key={gameIndex} className="mt-12">
                <div className="text-left font-bold bg-gray-200 p-3 rounded border">
                  Game {gameIndex + 1}
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
                  {game.courts.map((court, courtIndex) => {
                    return (
                      <div
                        key={courtIndex}
                        className="border p-3 rounded bg-white shadow"
                      >
                        <p className="font-bold mb-1">Court {courtIndex + 1}</p>
                        {court.join(", ")}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </Container>
    </div>
  );
};

export default PickleballScheduler;
