import { useState, useEffect } from "react";
import axios from "axios";

const App = () => {
  const [link, setLink] = useState(
    "https://open.spotify.com/track/7LZkMeX1k8PXQJ0SVYn1A5?si=a3409df066cc4cfe"
  );
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [track, setTrack] = useState(null); // Track details state
  const [libraries, setLibraries] = useState([]); // Playlists/libraries state
  const [selectedLibrary, setSelectedLibrary] = useState(""); // Selected library state
  const [newAccessToken, setToken] = useState(
    localStorage.getItem("spotify_access_token")
  );
  useEffect(() => {
    const fetchToken = async () => {
      const params = new URLSearchParams(window.location.search);
      const code = params.get("code");
      if (code) {
        localStorage.setItem("spotify_access_token", code);
      }
    };

    fetchToken();
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("spotify_access_token");
    if (token) setToken(token);
  }, [newAccessToken, setToken]);

  // Handle user input of the link
  const handlePaste = (e) => {
    const pastedLink = e.target.value;
    if (!pastedLink.includes("spotify.com")) {
      setError("Invalid Spotify link");
    } else {
      setError("");
      setLink(pastedLink);
    }
  };

  // Fetch track details after submitting the link
  const handleSubmit = async () => {
    if (!link) {
      setError("Please enter a Spotify link");
      return;
    }

    setSuccess(""); // Reset success message
    setError(""); // Reset error message

    try {
      const accessToken = localStorage.getItem("spotify_access_token");
      if (!accessToken) {
        window.location.href = "http://localhost:8000/login"; // Redirect to login if no token
        return;
      }

      const songId = link.split("/").pop()?.split("?")[0];
      if (!songId) {
        setError("Invalid Spotify song link");
        return;
      }

      const response = await axios.get(
        `http://localhost:8000/track-details?songId=${songId}`, // Backend API
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (response.status === 200) {
        setTrack(response.data); // Set track details state
      } else {
        setError("Failed to fetch track details");
      }
    } catch (err) {
      console.error(err);
      setError("Failed to fetch track details");
    }
  };
  // const handleLogout = () => {
  //   localStorage.removeItem("spotify_access_token");
  // };

  // Fetch user's playlists (libraries)
  const fetchLibraries = async () => {
    try {
      const accessToken = localStorage.getItem("spotify_access_token");
      const response = await axios.get("http://localhost:8000/get-libraries", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      setLibraries(response.data); // Set libraries state
    } catch (err) {
      console.error(err);
      setError("Failed to load libraries");
    }
  };

  // Handle adding track to selected library
  const handleAddToLibrary = async () => {
    if (!track) {
      setError("Track details are missing");
      return;
    }

    if (!selectedLibrary) {
      setError("Please select a library");
      return;
    }

    try {
      const accessToken = localStorage.getItem("spotify_access_token");
      const songUrl = `https://spotify.com/track/${track.id}`;

      const response = await axios.post(
        "http://localhost:8000/add-song", // Backend API
        { songUrl, libraryId: selectedLibrary }, // Send libraryId and songUrl
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 200) {
        setSuccess("Song successfully added to your library!");
      } else {
        setError("Failed to add song to the library");
      }
    } catch (err) {
      console.error(err);
      setError("Failed to add song to the library");
    }
  };

  // Load libraries after component mounts
  useEffect(() => {
    fetchLibraries();
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-6">
      <h1 className="text-3xl font-bold mb-6">Spotify Link Scanner</h1>
      <div className="w-full max-w-md">
        <input
          type="text"
          placeholder="Paste Spotify song link here"
          className="w-full p-3 border border-gray-700 rounded-lg bg-gray-800 text-white"
          onChange={handlePaste}
          value={link}
        />

        <button
          onClick={handleSubmit}
          className="w-full mt-4 bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-lg"
        >
          Scan
        </button>

        {track && (
          <div className="mt-6 text-center">
            <h3 className="text-xl font-semibold">Track Details</h3>
            <p className="text-lg">
              {track.name} by {track.artists.join(", ")}
            </p>
            <p className="text-sm">{track.album.name}</p>

            <select
              className="w-full mt-4 bg-gray-800 border border-gray-700 text-white p-2"
              onChange={(e) => setSelectedLibrary(e.target.value)}
              value={selectedLibrary}
            >
              <option value="">Select Library</option>
              {libraries.map((library) => (
                <option key={library.id} value={library.id}>
                  {library.name}
                </option>
              ))}
            </select>

            <button
              onClick={handleAddToLibrary}
              className="w-full mt-4 bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg"
            >
              Add to Library
            </button>
          </div>
        )}
      
        {/* {newAccessToken ? (
          <button
            onClick={handleLogout}
            className="w-full mt-6 bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg"
          >
            Logout
          </button>
        ) : (
          ""
        )} */}
      </div>

      {error && <p className="text-red-500 mt-2">{error}</p>}
      {success && <p className="text-green-500 mt-2">{success}</p>}
    </div>
  );
};

export default App;
