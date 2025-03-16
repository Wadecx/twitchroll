"use client";

import { useState, useEffect } from "react";

export const Fetcher = () => {
  const [token, setToken] = useState<string | null>(null);
  const [broadcasterID, setBroadcasterID] = useState<string | null>(null);
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [rolling, setRolling] = useState(false);
  const [selectedSub, setSelectedSub] = useState<string | null>(null);
  const [displayedSub, setDisplayedSub] = useState<string | null>(null);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get("code");

    if (code && !token) {
      exchangeCodeForAccessToken(code);
    }
  }, [token]);

  useEffect(() => {
    if (token && !broadcasterID) {
      getUserID(token);
    }
  }, [token]);

  useEffect(() => {
    if (broadcasterID) {
      getSubscriptions();
    }
  }, [broadcasterID]);

  const generateOAuthLink = () => {
    const clientID = process.env.NEXT_PUBLIC_TWITCH_CLIENT_ID;
    const redirectURI = process.env.NEXT_PUBLIC_TWITCH_REDIRECT_URI;
    const scope = "channel:read:subscriptions";

    if (!clientID || !redirectURI) {
      console.error("Client ID ou Redirect URI non définis");
      return "";
    }

    return `https://id.twitch.tv/oauth2/authorize?client_id=${clientID}&redirect_uri=${encodeURIComponent(
      redirectURI
    )}&response_type=code&scope=${scope}`;
  };

  const exchangeCodeForAccessToken = async (code: string) => {
    try {
      const response = await fetch("/api/twitch-auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });

      const data = await response.json();
      if (data.access_token) {
        setToken(data.access_token);
      } else {
        console.error("Erreur lors de l'échange du code", data);
      }
    } catch (error) {
      console.error("Erreur réseau ou serveur", error);
    }
  };

  const getUserID = async (accessToken: string) => {
    try {
      const response = await fetch("https://api.twitch.tv/helix/users", {
        headers: {
          "Client-ID": process.env.NEXT_PUBLIC_TWITCH_CLIENT_ID!,
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const data = await response.json();
      if (data.data && data.data.length > 0) {
        setBroadcasterID(data.data[0].id);
      } else {
        console.error("Impossible de récupérer le broadcaster_id", data);
      }
    } catch (error) {
      console.error(
        "Erreur lors de la récupération de l'ID utilisateur",
        error
      );
    }
  };

  const getSubscriptions = async () => {
    if (!token || !broadcasterID) return;

    setLoading(true);
    try {
      const response = await fetch(
        `https://api.twitch.tv/helix/subscriptions?broadcaster_id=${broadcasterID}`,
        {
          headers: {
            "Client-ID": process.env.NEXT_PUBLIC_TWITCH_CLIENT_ID!,
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();
      setSubscriptions(data.data || []);
    } catch (error) {
      console.error("Erreur lors de la récupération des abonnés", error);
    } finally {
      setLoading(false);
    }
  };

  // 🔥 Lancer la roulette avec un vrai random
  const startRoulette = () => {
    if (subscriptions.length === 0) return;

    setRolling(true);
    setDisplayedSub(null);

    // 🎰 Sélectionner un gagnant aléatoire
    const randomIndex = Math.floor(Math.random() * subscriptions.length);
    const randomWinner = subscriptions[randomIndex].user_name;
    setSelectedSub(randomWinner);

    let index = 0;
    const interval = setInterval(() => {
      setDisplayedSub(subscriptions[index % subscriptions.length].user_name);
      index++;
    }, 100); // Défilement rapide

    setTimeout(() => {
      clearInterval(interval);
      setDisplayedSub(randomWinner); // 🎯 Affichage du vrai gagnant
      setRolling(false);
    }, 3000); // Durée avant l'arrêt
  };

  return (
    <div className="mt-24 text-white flex flex-col items-center justify-center mb-24">
      <h1 className="text-3xl font-bold text-purple-400 mb-6">
        Twitch Roulette
      </h1>

      {token ? (
        <>
          {loading ? (
            <p className="text-xl text-purple-300">Chargement des abonnés...</p>
          ) : subscriptions.length > 0 ? (
            <>
              {/* 🎰 Section roulette */}
              <div className="mt-6 items-center flex flex-col">
                <h2 className="text-2xl font-bold text-purple-400">
                  🎰 Roulette des abonnés 🎰
                </h2>
                <div className="border-4 border-purple-500 p-6 mt-4 text-3xl font-extrabold text-center text-white bg-black shadow-lg rounded-lg neon-effect">
                  {displayedSub ? displayedSub : "🎡 En attente..."}
                </div>
                <button
                  onClick={startRoulette}
                  disabled={rolling}
                  className="bg-purple-600 hover:bg-purple-700 transition-all text-white p-3 rounded-xl mt-6 text-xl font-bold shadow-lg"
                >
                  {rolling ? "🎲 Tirage en cours..." : "🚀 Lancer la roulette"}
                </button>
              </div>
            </>
          ) : (
            <p className="text-xl text-gray-400">Aucun abonnement trouvé.</p>
          )}
        </>
      ) : (
        <a href={generateOAuthLink()}>
          <button className="bg-blue-600 hover:bg-blue-700 transition-all text-white p-3 rounded-xl text-xl font-bold shadow-lg">
            🔑 Se connecter avec Twitch
          </button>
        </a>
      )}

      <style jsx>{`
        @keyframes neonGlow {
          0% {
            text-shadow: 0 0 5px #d946ef, 0 0 10px #d946ef, 0 0 15px #d946ef;
          }
          50% {
            text-shadow: 0 0 10px #9333ea, 0 0 20px #9333ea, 0 0 30px #9333ea;
          }
          100% {
            text-shadow: 0 0 5px #d946ef, 0 0 10px #d946ef, 0 0 15px #d946ef;
          }
        }

        .neon-effect {
          animation: neonGlow 1.5s infinite alternate;
        }
      `}</style>
    </div>
  );
};
