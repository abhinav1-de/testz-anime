/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect, useRef } from "react";
import getAnimeInfo from "@/src/utils/getAnimeInfo.utils";
import getEpisodes from "@/src/utils/getEpisodes.utils";
import getNextEpisodeSchedule from "../utils/getNextEpisodeSchedule.utils";
import getServers from "../utils/getServers.utils";
import getStreamInfo from "../utils/getStreamInfo.utils";

export const useWatch = (animeId, initialEpisodeId) => {
  const [error, setError] = useState(null);
  const [buffering, setBuffering] = useState(true);
  const [streamInfo, setStreamInfo] = useState(null);
  const [animeInfo, setAnimeInfo] = useState(null);
  const [episodes, setEpisodes] = useState(null);
  const [animeInfoLoading, setAnimeInfoLoading] = useState(false);
  const [totalEpisodes, setTotalEpisodes] = useState(null);
  const [seasons, setSeasons] = useState(null);
  const [servers, setServers] = useState(null);
  const [streamUrl, setStreamUrl] = useState(null);
  const [isFullOverview, setIsFullOverview] = useState(false);
  const [subtitles, setSubtitles] = useState([]);
  const [thumbnail, setThumbnail] = useState(null);
  const [intro, setIntro] = useState(null);
  const [outro, setOutro] = useState(null);
  const [episodeId, setEpisodeId] = useState(null);
  const [activeEpisodeNum, setActiveEpisodeNum] = useState(null);
  const [activeServerId, setActiveServerId] = useState(null);
  const [activeServerType, setActiveServerType] = useState(null);
  const [activeServerName, setActiveServerName] = useState(null);
  const [serverLoading, setServerLoading] = useState(true);
  const [nextEpisodeSchedule, setNextEpisodeSchedule] = useState(null);
  const isServerFetchInProgress = useRef(false);
  const isStreamFetchInProgress = useRef(false);

  useEffect(() => {
    setEpisodes(null);
    setEpisodeId(null);
    setActiveEpisodeNum(null);
    setServers(null);
    setActiveServerId(null);
    setStreamInfo(null);
    setStreamUrl(null);
    setSubtitles([]);
    setThumbnail(null);
    setIntro(null);
    setOutro(null);
    setBuffering(true);
    setServerLoading(true);
    setError(null);
    setAnimeInfo(null);
    setSeasons(null);
    setTotalEpisodes(null);
    setAnimeInfoLoading(true);
    isServerFetchInProgress.current = false;
    isStreamFetchInProgress.current = false;
  }, [animeId]);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setAnimeInfoLoading(true);
        const [animeData, episodesData] = await Promise.all([
          getAnimeInfo(animeId, false),
          getEpisodes(animeId),
        ]);
        setAnimeInfo(animeData?.data);
        setSeasons(animeData?.seasons);
        setEpisodes(episodesData?.episodes);
        setTotalEpisodes(episodesData?.totalEpisodes);
        const newEpisodeId =
          initialEpisodeId ||
          (episodesData?.episodes?.length > 0
            ? episodesData.episodes[0].id.match(/ep=(\d+)/)?.[1]
            : null);
        setEpisodeId(newEpisodeId);
      } catch (err) {
        console.error("Error fetching initial data:", err);
        setError(err.message || "An error occurred.");
      } finally {
        setAnimeInfoLoading(false);
      }
    };
    fetchInitialData();
  }, [animeId]);

  useEffect(() => {
    const fetchNextEpisodeSchedule = async () => {
      try {
        const data = await getNextEpisodeSchedule(animeId);
        setNextEpisodeSchedule(data);
      } catch (err) {
        console.error("Error fetching next episode schedule:", err);
      }
    };
    fetchNextEpisodeSchedule();
  }, [animeId]);

  useEffect(() => {
    if (!episodes || !episodeId) {
      setActiveEpisodeNum(null);
      return;
    }
    const activeEpisode = episodes.find((episode) => {
      const match = episode.id.match(/ep=(\d+)/);
      return match && match[1] === episodeId;
    });
    const newActiveEpisodeNum = activeEpisode ? activeEpisode.episode_no : null;
    if (activeEpisodeNum !== newActiveEpisodeNum) {
      setActiveEpisodeNum(newActiveEpisodeNum);
    }
  }, [episodeId, episodes]);

  useEffect(() => {
    if (!episodeId || !episodes || isServerFetchInProgress.current) return;

    const fetchServers = async () => {
      isServerFetchInProgress.current = true;
      setServerLoading(true);
      try {
        const data = await getServers(animeId, episodeId);
        console.log(data);
        
        const originalServers = data?.filter(
          (server) =>
            server.serverName === "HD-1" ||
            server.serverName === "HD-3"
        );
        
        // Create properly filtered servers with unique IDs to prevent conflicts
        const filteredServers = [];
        
        originalServers?.forEach(server => {
          if (server.serverName === "HD-3" && server.type === "dub") {
            return; // Skip HD-3 for DUB section
          }
          
          // Create completely unique data_ids for each server type combination
          filteredServers.push({
            ...server,
            data_id: `${server.serverName.toLowerCase().replace('-', '')}_${server.type}_${server.data_id || Math.random().toString(36).substr(2, 9)}`,
            server_id: `${server.serverName.toLowerCase().replace('-', '')}_${server.type}_${server.server_id || Math.random().toString(36).substr(2, 9)}`
          });
        });
        
        // Add VidAPI-1 to SUB category only
        if (filteredServers.some((s) => s.type === "sub")) {
          filteredServers.push({
            type: "sub",
            data_id: "vidapi1-sub",
            server_id: "vidapi1-sub",
            serverName: "VidAPI-1",
            isVidapi: true,
          });
        }
        
        // Add Pahe servers to both SUB and DUB categories
        if (filteredServers.some((s) => s.type === "sub")) {
          filteredServers.push({
            type: "sub",
            data_id: "pahe-sub",
            server_id: "pahe-sub",
            serverName: "Pahe",
            isPahe: true,
          });
        }
        if (filteredServers.some((s) => s.type === "dub")) {
          filteredServers.push({
            type: "dub",
            data_id: "pahe-dub",
            server_id: "pahe-dub",
            serverName: "Pahe",
            isPahe: true,
          });
        }
        
        // Add HD-4 servers
        if (filteredServers.some((s) => s.type === "sub")) {
          filteredServers.push({
            type: "sub",
            data_id: "hd4-sub-custom",
            server_id: "hd4-sub-41",
            serverName: "HD-4",
          });
        }
        if (filteredServers.some((s) => s.type === "dub")) {
          filteredServers.push({
            type: "dub",
            data_id: "hd4-dub-custom",
            server_id: "hd4-dub-42",
            serverName: "HD-4",
          });
        }
        
        // Add multi server if any sub/dub servers exist
        if (filteredServers.some(s => s.type === "sub" || s.type === "dub")) {
          filteredServers.push({ 
            type: "multi", 
            serverName: "Nest", 
            data_id: "multi",
            server_id: "43"
          });
        }
        
        // Add SLAY servers based on API categories
        const slayLanguages = [
          { name: "English", param: "ENGLISH" },
          { name: "Japanese", param: "JAPANESE" }, 
          { name: "Hindi", param: "HINDI" },
          { name: "Nest", param: "NEST" }
        ];
        
        slayLanguages.forEach(lang => {
          filteredServers.push({ 
            type: "slay", 
            serverName: lang.name, 
            data_id: `slay-${lang.param.toLowerCase()}`,
            slayLang: lang.param,
            server_id: `slay-${lang.param.toLowerCase()}`
          });
        });
        
        
        console.log("Final filteredServers:", filteredServers);
        
        const savedServerName = localStorage.getItem("server_name");
        const savedServerType = localStorage.getItem("server_type");
        const savedDataId = localStorage.getItem("server_data_id");
        
        const initialServer =
          filteredServers.find(s => s.data_id === savedDataId) ||
          filteredServers.find(s => s.serverName === savedServerName && s.type === savedServerType) ||
          filteredServers.find(s => s.type === "dub") ||
          filteredServers.find(s => s.type === "sub") ||
          filteredServers[0];

        setServers(filteredServers);
        setActiveServerType(initialServer?.type);
        setActiveServerName(initialServer?.serverName);
        setActiveServerId(initialServer?.data_id);
      } catch (error) {
        console.error("Error fetching servers:", error);
        setError(error.message || "An error occurred.");
      } finally {
        setServerLoading(false);
        isServerFetchInProgress.current = false;
      }
    };
    fetchServers();
  }, [episodeId, episodes, animeInfo]);
  // Fetch stream info only when episodeId, activeServerId, and servers are ready
  useEffect(() => {
    if (
      !episodeId ||
      !activeServerId ||
      !servers ||
      isServerFetchInProgress.current ||
      isStreamFetchInProgress.current
    )
      return;
    if (
      (activeServerName?.toLowerCase() === "hd-1" || activeServerName?.toLowerCase() === "hd-4" || activeServerName?.toLowerCase() === "nest" || activeServerType?.toLowerCase() === "slay" || activeServerName?.includes("VidAPI") || activeServerName?.toLowerCase() === "pahe") 
      &&
      !serverLoading
    ) {
      setBuffering(false);
      return;
    }
    const fetchStreamInfo = async () => {
      isStreamFetchInProgress.current = true;
      setBuffering(true);
      try {
        const server = servers.find((srv) => srv.data_id === activeServerId);
        if (server) {
            const data = await getStreamInfo(
            animeId,
            episodeId,
            server.serverName.toLowerCase()==="hd-3"?"hd-1":server.serverName.toLowerCase()==="nest"?"hd-1":server.serverName.toLowerCase(),
            server.type.toLowerCase()
            );
          setStreamInfo(data);
          setStreamUrl(data?.streamingLink?.link?.file || null);
          setIntro(data?.streamingLink?.intro || null);
          setOutro(data?.streamingLink?.outro || null);
          const subtitles =
            data?.streamingLink?.tracks
              ?.filter((track) => track.kind === "captions")
              .map(({ file, label }) => ({ file, label })) || [];
          setSubtitles(subtitles);
          const thumbnailTrack = data?.streamingLink?.tracks?.find(
            (track) => track.kind === "thumbnails" && track.file
          );
          if (thumbnailTrack) setThumbnail(thumbnailTrack.file);
        } else {
          setError("No server found with the activeServerId.");
        }
      } catch (err) {
        console.error("Error fetching stream info:", err);
        setError(err.message || "An error occurred.");
      } finally {
        setBuffering(false);
        isStreamFetchInProgress.current = false;
      }
    };
    fetchStreamInfo();
  }, [episodeId, activeServerId, servers]);

  // Find the active server object from the main servers array (now includes all server types)
  const activeServer = servers?.find(server => server.data_id === activeServerId);

  // Add console log to debug server changes
  useEffect(() => {
    if (activeServer) {
      console.log("Active server changed:", activeServer);
    }
  }, [activeServerId, activeServer]);

  return {
    error,
    buffering,
    serverLoading,
    streamInfo,
    animeInfo,
    episodes,
    nextEpisodeSchedule,
    animeInfoLoading,
    totalEpisodes,
    seasons,
    servers,
    streamUrl,
    isFullOverview,
    setIsFullOverview,
    subtitles,
    thumbnail,
    intro,
    outro,
    episodeId,
    setEpisodeId,
    activeEpisodeNum,
    setActiveEpisodeNum,
    activeServerId,
    setActiveServerId,
    activeServerType,
    setActiveServerType,
    activeServerName,
    setActiveServerName,
    activeServer,
  };
};
