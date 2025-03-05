"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Container from "@/components/container"; // Ensure you have this component

const MatchList = () => {
  const { id } = useParams();
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetch(`/api/matches?id=${id}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.error) {
            console.error("Match not found");
          } else {
            setGames(data);
          }
          setLoading(false);
        })
        .catch((err) => {
          console.error("Error fetching match data", err);
          setLoading(false);
        });
    }
  }, [id]);

  if (loading) {
    return (
      <div className="py-10">
        <Container>
          <p className="text-center text-lg font-bold">Loading matches...</p>
        </Container>
      </div>
    );
  }

  return (
    <div className="py-10">
      <Container>
        <h1 className="text-2xl font-bold text-center mb-6">Match List</h1>

        {games.length > 0 ? (
          <div>
            {games.map((game, gameIndex) => (
              <div key={gameIndex} className="mt-12">
                <div className="text-left font-bold bg-gray-200 p-3 rounded border">
                  Game {gameIndex + 1}
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
                  {game.courts.map((court, courtIndex) => (
                    <div
                      key={courtIndex}
                      className="border p-3 rounded bg-white shadow"
                    >
                      <p className="font-bold mb-1">Court {courtIndex + 1}</p>
                      {court.join(", ")}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-lg font-bold">No games found.</p>
        )}
      </Container>
    </div>
  );
};

export default MatchList;
