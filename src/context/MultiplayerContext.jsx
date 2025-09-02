import { createContext, useContext, useEffect, useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { io } from 'socket.io-client';

const MultiplayerContext = createContext();

export const useMultiplayer = () => {
  const context = useContext(MultiplayerContext);
  if (!context) {
    throw new Error('useMultiplayer must be used within a MultiplayerProvider');
  }
  return context;
};

export const MultiplayerProvider = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [roomCode, setRoomCode] = useState(null);
  const [isHost, setIsHost] = useState(false);
  const [members, setMembers] = useState([]);
  const [chat, setChat] = useState([]);
  const [isInRoom, setIsInRoom] = useState(false);
  const [roomError, setRoomError] = useState(null);
  const [nickname, setNickname] = useState('');
  
  // Video sync states
  const [roomVideoState, setRoomVideoState] = useState(null);
  const [shouldSyncVideo, setShouldSyncVideo] = useState(false);
  
  // Refs to prevent duplicate syncing
  const playerRef = useRef(null);
  const isUpdatingFromSync = useRef(false);
  
  // Refs for navigation to avoid useEffect dependency issues
  const navigateRef = useRef(navigate);
  const locationRef = useRef(location);
  
  // Update refs when values change
  useEffect(() => {
    navigateRef.current = navigate;
    locationRef.current = location;
  }, [navigate, location]);

  useEffect(() => {
    // Generate random nickname if not set
    if (!nickname) {
      setNickname(`Guest-${Math.floor(1000 + Math.random() * 9000)}`);
    }
  }, []);

  useEffect(() => {
    // Initialize socket connection to multiplayer server
    const serverUrl = import.meta.env.VITE_MULTIPLAYER_SERVER_URL || 'https://server-bkur.onrender.com';
    const newSocket = io(serverUrl, {
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      timeout: 20000
    });
    
    newSocket.on('connect', () => {
      setIsConnected(true);
      console.log('Connected to multiplayer server');
      
      // Don't try to access roomCode here as it creates a stale closure
      // Let other parts of the app handle room rejoining logic
    });

    newSocket.on('disconnect', (reason) => {
      console.log('Disconnected from multiplayer server. Reason:', reason);
      setIsConnected(false);
      
      // Don't immediately clear room state on disconnect
      // Let reconnection handle it
      if (reason === 'io server disconnect' || reason === 'io client disconnect') {
        // Only clear state if server deliberately disconnected or client disconnected
        setIsInRoom(false);
        setRoomCode(null);
        setIsHost(false);
        setMembers([]);
        setChat([]);
      }
    });

    // Handle successful reconnection
    newSocket.on('reconnect', (attemptNumber) => {
      console.log('Successfully reconnected to multiplayer server after', attemptNumber, 'attempts');
      setIsConnected(true);
    });

    // Handle reconnection attempts
    newSocket.on('reconnect_attempt', (attemptNumber) => {
      console.log('Attempting to reconnect... Attempt:', attemptNumber);
    });

    // Handle reconnection errors
    newSocket.on('reconnect_error', (error) => {
      console.log('Reconnection failed:', error);
    });

    // Room events
    newSocket.on('roomCreated', (data) => {
      setRoomCode(data.roomCode);
      setIsHost(data.isHost);
      setMembers(data.members);
      setIsInRoom(true);
      setRoomError(null);
    });

    newSocket.on('roomJoined', (data) => {
      setRoomCode(data.roomCode);
      setIsHost(data.isHost);
      setMembers(data.members);
      setChat(data.chat || []);
      setIsInRoom(true);
      setRoomError(null);
      
      // Only sync episode if joining a different anime/episode
      if (data.currentEpisode && data.animeId) {
        const currentLocation = locationRef.current;
        const currentPath = currentLocation.pathname;
        const currentParams = new URLSearchParams(currentLocation.search);
        const currentAnimeId = currentPath.split('/watch/')[1];
        const currentEpisodeId = currentParams.get('ep');
        const existingRoomCode = currentParams.get('room');
        
        // Only navigate if we're on a different anime or episode
        if (currentAnimeId !== data.animeId || currentEpisodeId !== data.currentEpisode) {
          const newUrl = `/watch/${data.animeId}?ep=${data.currentEpisode}&room=${data.roomCode}`;
          console.log('Navigating to different anime/episode:', newUrl);
          navigateRef.current(newUrl);
        } else if (!existingRoomCode || existingRoomCode !== data.roomCode) {
          // Only update URL to include room code if it's missing or different
          const newUrl = `/watch/${data.animeId}?ep=${data.currentEpisode}&room=${data.roomCode}`;
          console.log('Updating URL to include room code:', newUrl);
          navigateRef.current(newUrl, { replace: true });
        } else {
          console.log('Already on correct episode with room code, no navigation needed');
        }
      }
    });

    newSocket.on('userJoined', (data) => {
      setMembers(data.members);
      setChat(prev => [...prev, {
        id: Date.now(),
        nickname: 'System',
        message: `${data.nickname} joined the room`,
        timestamp: Date.now(),
        isSystem: true
      }]);
    });

    newSocket.on('userLeft', (data) => {
      setMembers(data.members);
      setChat(prev => [...prev, {
        id: Date.now(),
        nickname: 'System',
        message: `${data.nickname} left the room`,
        timestamp: Date.now(),
        isSystem: true
      }]);
    });

    newSocket.on('newHost', (data) => {
      setMembers(data.members);
      setIsHost(newSocket.id === data.newHostId);
      setChat(prev => [...prev, {
        id: Date.now(),
        nickname: 'System',
        message: `${data.newHostNickname} is now the host`,
        timestamp: Date.now(),
        isSystem: true
      }]);
    });

    // Video sync disabled - no video synchronization between users
    newSocket.on('videoAction', (data) => {
      console.log('Video sync disabled - ignoring video action');
      // Do nothing - video sync is completely disabled
    });

    // Episode change events
    newSocket.on('changeEpisode', (data) => {
      const { episodeId, animeId, roomCode: dataRoomCode } = data;
      const newUrl = `/watch/${animeId}?ep=${episodeId}&room=${dataRoomCode}`;
      const currentLocation = locationRef.current;
      
      if (currentLocation.pathname + currentLocation.search !== newUrl) {
        navigateRef.current(newUrl);
      }
    });

    // Chat events - optimized to prevent video interference
    newSocket.on('chatMessage', (message) => {
      // Use requestAnimationFrame to batch chat updates and reduce performance impact
      requestAnimationFrame(() => {
        setChat(prev => [...prev, message]);
      });
    });

    // Room left event (when user successfully leaves)
    newSocket.on('roomLeft', () => {
      setIsInRoom(false);
      setRoomCode(null);
      setIsHost(false);
      setMembers([]);
      setChat([]);
    });

    // Error handling
    newSocket.on('error', (error) => {
      setRoomError(error.message);
      console.error('Multiplayer error:', error);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, []);

  // Functions to interact with multiplayer
  const createRoom = () => {
    if (socket && nickname) {
      console.log('Creating room with nickname:', nickname);
      socket.emit('createRoom', { nickname });
    }
  };

  const joinRoom = (code, customNickname = null) => {
    const nameToUse = customNickname || nickname;
    if (socket && nameToUse && code) {
      if (customNickname) {
        setNickname(customNickname);
      }
      console.log('Joining room with nickname:', nameToUse);
      socket.emit('joinRoom', { roomCode: code, nickname: nameToUse });
    }
  };

  const leaveRoom = () => {
    if (socket && roomCode) {
      // Emit leave room event instead of disconnecting socket
      socket.emit('leaveRoom', { roomCode });
      setIsInRoom(false);
      setRoomCode(null);
      setIsHost(false);
      setMembers([]);
      setChat([]);
      
      // Remove room parameter from URL using React Router
      const currentLocation = locationRef.current;
      const searchParams = new URLSearchParams(currentLocation.search);
      searchParams.delete('room');
      const newSearch = searchParams.toString();
      const newUrl = currentLocation.pathname + (newSearch ? `?${newSearch}` : '');
      navigateRef.current(newUrl, { replace: true });
    }
  };

  const sendChatMessage = (message) => {
    if (socket && roomCode && message.trim()) {
      // Temporarily disable video sync during chat to prevent buffering
      const originalSyncFlag = isUpdatingFromSync.current;
      isUpdatingFromSync.current = true;
      
      socket.emit('chatMessage', { message: message.trim() });
      
      // Re-enable sync after a short delay
      setTimeout(() => {
        isUpdatingFromSync.current = originalSyncFlag;
      }, 100);
    }
  };

  const syncVideoAction = (action) => {
    // Video sync disabled - users can watch independently
    console.log('Video sync disabled - no synchronization between users');
    return;
  };

  const syncEpisodeChange = (episodeId, animeId) => {
    if (socket && roomCode && isHost) {
      socket.emit('changeEpisode', { episodeId, animeId, roomCode });
    }
  };

  const setPlayerReference = (player) => {
    playerRef.current = player;
  };

  const value = {
    socket,
    isConnected,
    roomCode,
    isHost,
    isInRoom,
    members,
    chat,
    roomError,
    nickname,
    setNickname,
    roomVideoState,
    shouldSyncVideo,
    setShouldSyncVideo,
    createRoom,
    joinRoom,
    leaveRoom,
    sendChatMessage,
    syncVideoAction,
    syncEpisodeChange,
    setPlayerReference,
    playerRef
  };

  return (
    <MultiplayerContext.Provider value={value}>
      {children}
    </MultiplayerContext.Provider>
  );
};
