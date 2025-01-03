import { useEffect } from "react";
import axios from "axios";

const Callback = () => {
  useEffect(() => {
    const fetchToken = async () => {
      const params = new URLSearchParams(window.location.search);
      const code = params.get("code");

      if (code) {
        try {
          const response = await axios.post("http://localhost:5000/api/token", { code });
          const { access_token, refresh_token } = response.data;

          // Save tokens to localStorage or state
          localStorage.setItem("spotify_access_token", access_token);
          localStorage.setItem("spotify_refresh_token", refresh_token);

          // Redirect to your main app
          window.location.href = "/";
        } catch (error) {
          console.error("Error fetching token:", error);
        }
      }
    };

    fetchToken();
  }, []);

  return <div>Authenticating with Spotify...</div>;
};

export default Callback;
