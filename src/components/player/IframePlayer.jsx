//* eslint-disable react/prop-types */
import { useEffect, useState, useRef } from "react";
import BouncingLoader from "../ui/bouncingloader/Bouncingloader";
import { useMultiplayer } from "@/src/context/MultiplayerContext";

export default function IframePlayer({
  episodeId,
  serverName,
  servertype,
  animeInfo,
  episodeNum,
  episodes,
  playNext,
  autoNext, 
  aniid,
  activeServer,
}) {
  // Multiplayer integration
  const { 
    isInRoom, 
    isHost, 
    syncVideoAction, 
    roomVideoState, 
    shouldSyncVideo, 
    setShouldSyncVideo 
  } = useMultiplayer();
  
  const iframeRef = useRef(null);
  const isUpdatingFromSync = useRef(false);
  const baseURL =
    serverName.toLowerCase() === "hd-1"
      ? import.meta.env.VITE_BASE_IFRAME_URL
      : serverName.toLowerCase() === "hd-4"
      ? import.meta.env.VITE_BASE_IFRAME_URL_2
      : serverName.toLowerCase() === "nest" || servertype === "multi" || activeServer?.type === "multi"
      ? import.meta.env.VITE_BASE_IFRAME_URL_3
      : activeServer?.type === "slay"
      ? "https://slay-knight.xyz"
      : activeServer?.isVidapi
      ? "https://vidapi.xyz"
      : activeServer?.isPahe
      ? "https://vidnest.fun"
      : undefined; 

  const [loading, setLoading] = useState(true);
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const [iframeSrc, setIframeSrc] = useState("");
  const [currentEpisodeIndex, setCurrentEpisodeIndex] = useState(
    episodes?.findIndex(
      (episode) => episode.id.match(/ep=(\d+)/)?.[1] === episodeId
    )
  );

  useEffect(() => {
    const loadIframeUrl = async () => {
      setLoading(true);
      setIframeLoaded(false);
      // Clear the iframe src first to force a reload
      setIframeSrc("");
      
      // Add a small delay to ensure the iframe is cleared before setting new src
      await new Promise(resolve => setTimeout(resolve, 100));

      console.log("Loading iframe URL for:", {
        serverName,
        servertype,
        activeServer,
        baseURL,
        episodeId,
        episodeNum,
        aniid: animeInfo?.anilistId || aniid,
        animeInfo: animeInfo
      });

      if (serverName.toLowerCase() === "nest") {
        const nestUrl = `${baseURL}/${aniid}/${episodeNum}/hindi`;
        console.log("Nest URL:", nestUrl);
        setIframeSrc(nestUrl);
      } else if (activeServer?.type === "slay") {
        // Use anilistId from animeInfo if available, otherwise use aniid
        const anilistId = animeInfo?.anilistId || aniid;
        const slayLang = activeServer?.slayLang || "DUB";
        
        // Map languages to correct URL parameters based on the API response format
        let langParam;
        switch (slayLang) {
          case "ENGLISH":
            langParam = "dub";
            break;
          case "JAPANESE":
            langParam = "sub";
            break;
          case "HINDI":
            langParam = "hindi";
            break;
          case "NEST":
            langParam = "nest";
            break;
          default:
            langParam = "dub"; // Default to dub
        }
        
        // Construct URL following the pattern: /player/[anilist_id]/[ep]/[LANG]?autoplay=true
        const slayUrl = `${baseURL}/player/${anilistId}/${episodeNum}/${langParam}?autoplay=true`;
        console.log("=== SLAY SERVER DEBUG ===");
        console.log("Slay Knight URL:", slayUrl);
        console.log("AnilistId:", anilistId, "EpisodeNum:", episodeNum, "Lang:", slayLang, "LangParam:", langParam);
        console.log("BaseURL:", baseURL);
        console.log("AnimeInfo anilistId:", animeInfo?.anilistId);
        console.log("Fallback aniid:", aniid);
        console.log("========================");
        setIframeSrc(slayUrl);
      } else if (activeServer?.isVidapi) {
        // Handle vidapi server
        // Convert anime title to URL-friendly format for vidapi
        const animeTitle = animeInfo?.title || "";
        const linkUrl = animeTitle
          .toLowerCase()
          .replace(/[^a-zA-Z0-9\s]/g, '') // Remove special characters
          .replace(/\s+/g, '-') // Replace spaces with hyphens
          .trim();
        
        const vidapiUrl = `${baseURL}/embed/anime/${linkUrl}-episode-${episodeNum}`;
        console.log("=== VIDAPI SERVER DEBUG ===");
        console.log("Vidapi URL:", vidapiUrl);
        console.log("Anime Title:", animeTitle);
        console.log("Link URL:", linkUrl);
        console.log("Episode Num:", episodeNum);
        console.log("BaseURL:", baseURL);
        console.log("==========================");
        setIframeSrc(vidapiUrl);
      } else if (activeServer?.isPahe) {
        // Handle Pahe server with correct endpoint format
        // SUB uses /animepahe/ path, DUB uses /anime/ path
        const paheServerType = activeServer.type; // Use the actual server type (sub/dub)
        const pahePath = paheServerType === "sub" ? "animepahe" : "anime";
        const paheUrl = `${baseURL}/${pahePath}/${aniid}/${episodeNum}/${paheServerType}`;
        console.log("=== PAHE SERVER DEBUG ===");
        console.log("Pahe URL:", paheUrl);
        console.log("Aniid:", aniid);
        console.log("Episode Num:", episodeNum);
        console.log("ActiveServer Type:", paheServerType);
        console.log("Pahe Path:", pahePath);
        console.log("BaseURL:", baseURL);
        console.log("========================");
        setIframeSrc(paheUrl);
      } else if (activeServer?.type === "multi" || serverName.toLowerCase() === "multi") {
        // Handle multi server (old Nest functionality)
        const multiUrl = `${baseURL}/${aniid}/${episodeNum}/hindi`;
        console.log("Multi URL:", multiUrl);
        setIframeSrc(multiUrl);
      } else {
        const regularUrl = `${baseURL}/${episodeId}/${servertype}`;
        console.log("Regular URL:", regularUrl);
        setIframeSrc(regularUrl);
      }
    };

    loadIframeUrl();
  }, [episodeId, servertype, serverName, baseURL, aniid, episodeNum]);

  useEffect(() => {
    if (episodes?.length > 0) {
      const newIndex = episodes.findIndex(
        (episode) => episode.id.match(/ep=(\d+)/)?.[1] === episodeId
      );
      setCurrentEpisodeIndex(newIndex);
    }
  }, [episodeId, episodes]);

  // Video sync disabled for iframe players to prevent buffering during chat


  useEffect(() => {
    const handleMessage = (event) => {
      console.log('Received message from iframe:', event.data);
      
      const { currentTime, duration, type, action } = event.data;
      
      // Handle auto-next functionality
      if (typeof currentTime === "number" && typeof duration === "number") {
        if (
          currentTime >= duration &&
          currentEpisodeIndex < episodes?.length - 1 &&
          autoNext
        ) {
          playNext(episodes[currentEpisodeIndex + 1].id.match(/ep=(\d+)/)?.[1]);
        }
      }
      
      // Multiplayer video sync disabled for iframe players
    };
    
    window.addEventListener("message", handleMessage);
    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, [autoNext, currentEpisodeIndex, episodes, playNext]);

  useEffect(() => {
    setLoading(true);
    setIframeLoaded(false);
    return () => {
      const continueWatching = JSON.parse(localStorage.getItem("continueWatching")) || [];
      const newEntry = {
        id: animeInfo?.id,
        data_id: animeInfo?.data_id,
        episodeId,
        episodeNum,
        adultContent: animeInfo?.adultContent,
        poster: animeInfo?.poster,
        title: animeInfo?.title,
        japanese_title: animeInfo?.japanese_title,
      };
      if (!newEntry.data_id) return;
      const existingIndex = continueWatching.findIndex(
        (item) => item.data_id === newEntry.data_id
      );
      if (existingIndex !== -1) {
        continueWatching[existingIndex] = newEntry;
      } else {
        continueWatching.push(newEntry);
      }
      localStorage.setItem("continueWatching", JSON.stringify(continueWatching));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [episodeId, servertype]);

  return (
    <div className="relative w-full h-full overflow-hidden">
      {/* Loader Overlay */}
      <div
        className={`absolute inset-0 flex justify-center items-center bg-black bg-opacity-50 z-10 transition-opacity duration-500 ${
          loading ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      >
        <BouncingLoader />
      </div>

      <iframe
        ref={iframeRef}
        key={`${episodeId}-${servertype}-${serverName}`}
        src={iframeSrc}
        allowFullScreen
        allow="autoplay; fullscreen; encrypted-media"
        sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
        className={`w-full h-full transition-opacity duration-500 ${
          iframeLoaded ? "opacity-100" : "opacity-0"
        }`}
        onLoad={() => {
          setIframeLoaded(true);
          setTimeout(() => setLoading(false), 1000);
        }}
        onError={() => {
          console.error("Iframe failed to load:", iframeSrc);
          setLoading(false);
        }}
      ></iframe>
      

    </div>
  );
}


