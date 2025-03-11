"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Container from "@/components/container";
import React from "react";

const JSONBIN_API_KEY = "$2a$10$Mhb3I4U5RlMV6i8O5taLO.Wol9NXkhN9tFY7NJd23bzI3t17d08Wi"; // Replace with your JSONBin API Key

const ResultsPage = ({ params }) => {
  const { id } = React.use(params); // Unwrap params to access id
  const [games, setGames] = useState([]);
  const [playCount, setPlayCount] = useState({});
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (!id) return;

    const loadGamesFromJSONBin = async () => {
      try {
        console.log(`Fetching games from JSONBin.io: ${id}`);

        const response = await fetch(`https://api.jsonbin.io/v3/b/${id}/latest`, {
          method: "GET",
          headers: {
            "X-Master-Key": JSONBIN_API_KEY,
          },
        });

        if (!response.ok) {
          throw new Error(`JSONBin.io error: ${response.status} - ${response.statusText}`);
        }

        const data = await response.json();
        console.log("Fetched data:", data);

        if (!data || !data.record || !data.record.games || !data.record.playCount) {
          throw new Error("Invalid JSON structure from JSONBin.io");
        }

        setGames(data.record.games);
        setPlayCount(data.record.playCount);
        setLoading(false);
      } catch (error) {
        console.error("Error loading games:", error);
        alert("Failed to load games. Ensure the JSONBin ID is correct.");
        setLoading(false);
      }
    };

    loadGamesFromJSONBin();
  }, [id]);

  return (
    <div className="py-10">
      <Container>
        <button
          onClick={() => router.push("/")}
          className="bg-gray-500 text-white font-bold px-4 py-2 rounded border border-gray-900 mb-4"
        >
          Back to Home
        </button>

        {loading ? (
          <p>Loading games...</p>
        ) : games.length > 0 ? (
          <div>
            {games.map((game, gameIndex) => (
              <div key={gameIndex} className="mt-12">
                <div className="text-left font-bold bg-gray-200 p-3 rounded border">
                  Game {gameIndex + 1}
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
                  {game.courts.map((court, courtIndex) => (
                    <div key={courtIndex} className="border p-3 rounded bg-white shadow">
                      <p className="font-bold mb-1">Court {courtIndex + 1}</p>
                      {court.map((player) => (
                        <p key={player}>
                          {player}{" "}
                          <span className="text-gray-500 text-sm">
                            ({playCount[player] || 0} games)
                          </span>
                        </p>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p>No games found.</p>
        )}
      </Container>
    </div>
  );
};

export default ResultsPage;
