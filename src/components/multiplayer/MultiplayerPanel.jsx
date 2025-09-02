import { useState, useEffect, useRef } from 'react';
import { useMultiplayer } from '@/src/context/MultiplayerContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faUsers, 
  faComments, 
  faCrown, 
  faPaperPlane, 
  faSignOutAlt,
  faUserPlus,
  faCopy,
  faGripVertical
} from '@fortawesome/free-solid-svg-icons';

export default function MultiplayerPanel() {
  const {
    isConnected,
    roomCode,
    isHost,
    isInRoom,
    members,
    chat,
    nickname,
    setNickname,
    createRoom,
    joinRoom,
    leaveRoom,
    sendChatMessage,
    roomError
  } = useMultiplayer();

  const [showPanel, setShowPanel] = useState(false);
  const [activeTab, setActiveTab] = useState('members');
  const [joinCode, setJoinCode] = useState('');
  const [chatMessage, setChatMessage] = useState('');
  const [nicknameInput, setNicknameInput] = useState(nickname);
  const [panelHeight, setPanelHeight] = useState(384); // Default height (h-96 = 24rem = 384px)
  const [isResizing, setIsResizing] = useState(false);
  const resizeStartY = useRef(0);
  const startHeight = useRef(384);

  useEffect(() => {
    setNicknameInput(nickname);
  }, [nickname]);

  // Handle resize functionality
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isResizing) return;
      
      const deltaY = resizeStartY.current - e.clientY;
      const newHeight = Math.min(Math.max(startHeight.current + deltaY, 200), window.innerHeight - 120);
      setPanelHeight(newHeight);
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing]);

  const handleResizeStart = (e) => {
    setIsResizing(true);
    resizeStartY.current = e.clientY;
    startHeight.current = panelHeight;
    e.preventDefault();
  };

  const handleCreateRoom = () => {
    if (nicknameInput.trim()) {
      setNickname(nicknameInput.trim());
      createRoom();
    }
  };

  const handleJoinRoom = () => {
    if (nicknameInput.trim() && joinCode.trim()) {
      setNickname(nicknameInput.trim());
      joinRoom(joinCode.trim());
    }
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (chatMessage.trim()) {
      sendChatMessage(chatMessage);
      setChatMessage('');
    }
  };

  const copyRoomCode = async () => {
    try {
      await navigator.clipboard.writeText(roomCode);
      // You could add a toast notification here
    } catch (err) {
      console.error('Failed to copy room code:', err);
    }
  };

  if (!isConnected) {
    return (
      <div className="fixed bottom-4 right-4 bg-red-600 text-white px-4 py-2 rounded-lg">
        Connecting to multiplayer...
      </div>
    );
  }

  return (
    <>
      {/* Toggle Button */}
      <button
        onClick={() => setShowPanel(!showPanel)}
        className={`fixed bottom-4 right-4 w-12 h-12 max-[480px]:w-14 max-[480px]:h-14 rounded-full flex items-center justify-center text-white shadow-lg transition-all ${
          isInRoom ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'
        }`}
        data-testid="button-multiplayer-toggle"
      >
        <FontAwesomeIcon icon={faUsers} className="w-5 h-5 max-[480px]:w-6 max-[480px]:h-6" />
        {isInRoom && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs max-[480px]:text-sm rounded-full w-5 h-5 max-[480px]:w-6 max-[480px]:h-6 flex items-center justify-center">
            {members.length}
          </span>
        )}
      </button>

      {/* Multiplayer Panel */}
      {showPanel && (
        <div 
          className="fixed bottom-20 right-4 w-80 max-[480px]:fixed max-[480px]:inset-4 max-[480px]:bottom-20 max-[480px]:right-4 max-[480px]:left-4 max-[480px]:w-auto bg-[#1a1a1a] border border-gray-700 rounded-lg shadow-xl z-50 select-none"
          style={{ height: isInRoom ? `${panelHeight}px` : 'auto' }}
        >
          {!isInRoom ? (
            // Room Creation/Join Interface
            <div className="p-4">
              <h3 className="text-white text-lg font-semibold mb-4">Watch Together</h3>
              
              <div className="mb-4">
                <label className="block text-gray-300 text-sm mb-2">Your Nickname</label>
                <input
                  type="text"
                  value={nicknameInput}
                  onChange={(e) => setNicknameInput(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-800 text-white rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
                  placeholder="Enter your nickname"
                  data-testid="input-nickname"
                />
              </div>

              <div className="space-y-3">
                <button
                  onClick={handleCreateRoom}
                  disabled={!nicknameInput.trim()}
                  className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white py-2 px-4 rounded font-medium transition-colors"
                  data-testid="button-create-room"
                >
                  Create Room
                </button>

                <div className="text-center text-gray-400 text-sm">or</div>

                <div>
                  <input
                    type="text"
                    value={joinCode}
                    onChange={(e) => setJoinCode(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-800 text-white rounded border border-gray-600 focus:border-blue-500 focus:outline-none mb-2"
                    placeholder="Enter room code"
                    data-testid="input-room-code"
                  />
                  <button
                    onClick={handleJoinRoom}
                    disabled={!nicknameInput.trim() || !joinCode.trim()}
                    className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white py-2 px-4 rounded font-medium transition-colors"
                    data-testid="button-join-room"
                  >
                    Join Room
                  </button>
                </div>
              </div>

              {roomError && (
                <div className="mt-3 text-red-400 text-sm" data-testid="text-room-error">
                  {roomError}
                </div>
              )}
            </div>
          ) : (
            // Room Interface
            <div className="flex flex-col h-full">
              {/* Resize Handle */}
              <div 
                className="absolute top-0 left-0 right-0 h-2 cursor-ns-resize bg-transparent hover:bg-gray-600/30 transition-colors flex items-center justify-center group"
                onMouseDown={handleResizeStart}
                data-testid="resize-handle"
              >
                <FontAwesomeIcon 
                  icon={faGripVertical} 
                  className="w-3 h-3 text-gray-500 group-hover:text-gray-300 transition-colors rotate-90" 
                />
              </div>
              {/* Room Header */}
              <div className="p-4 max-[480px]:p-5 border-b border-gray-700 pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-white font-semibold text-base max-[480px]:text-lg">Room {roomCode}</h3>
                    <p className="text-gray-400 text-sm max-[480px]:text-base">
                      {isHost ? 'You are the host' : 'Watching together'}
                    </p>
                  </div>
                  <div className="flex gap-2 max-[480px]:gap-3">
                    <button
                      onClick={copyRoomCode}
                      className="text-gray-400 hover:text-white p-1 max-[480px]:p-2"
                      title="Copy room code"
                      data-testid="button-copy-room-code"
                    >
                      <FontAwesomeIcon icon={faCopy} className="w-4 h-4 max-[480px]:w-5 max-[480px]:h-5" />
                    </button>
                    <button
                      onClick={leaveRoom}
                      className="text-red-400 hover:text-red-300 p-1 max-[480px]:p-2"
                      title="Leave room"
                      data-testid="button-leave-room"
                    >
                      <FontAwesomeIcon icon={faSignOutAlt} className="w-4 h-4 max-[480px]:w-5 max-[480px]:h-5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Tabs */}
              <div className="flex border-b border-gray-700">
                <button
                  onClick={() => setActiveTab('members')}
                  className={`flex-1 py-3 max-[480px]:py-4 px-4 text-sm max-[480px]:text-base font-medium transition-colors ${
                    activeTab === 'members' 
                      ? 'text-white bg-gray-800' 
                      : 'text-gray-400 hover:text-white'
                  }`}
                  data-testid="tab-members"
                >
                  <FontAwesomeIcon icon={faUsers} className="w-4 h-4 max-[480px]:w-5 max-[480px]:h-5 mr-2" />
                  <span className="max-[480px]:hidden">Members ({members.length})</span>
                  <span className="hidden max-[480px]:inline">Members</span>
                </button>
                <button
                  onClick={() => setActiveTab('chat')}
                  className={`flex-1 py-3 max-[480px]:py-4 px-4 text-sm max-[480px]:text-base font-medium transition-colors ${
                    activeTab === 'chat' 
                      ? 'text-white bg-gray-800' 
                      : 'text-gray-400 hover:text-white'
                  }`}
                  data-testid="tab-chat"
                >
                  <FontAwesomeIcon icon={faComments} className="w-4 h-4 max-[480px]:w-5 max-[480px]:h-5 mr-2" />
                  Chat
                </button>
              </div>

              {/* Tab Content */}
              <div className="flex-1 overflow-hidden">
                {activeTab === 'members' ? (
                  <div className="p-3 max-[480px]:p-4 space-y-2 max-[480px]:space-y-3 overflow-y-auto h-full">
                    {members.map((member, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 max-[480px]:p-4 bg-gray-800 rounded"
                        data-testid={`member-${index}`}
                      >
                        <span className="text-white text-sm max-[480px]:text-base">{member.nickname}</span>
                        {member.isHost && (
                          <FontAwesomeIcon 
                            icon={faCrown} 
                            className="w-4 h-4 max-[480px]:w-5 max-[480px]:h-5 text-yellow-400" 
                            title="Host"
                          />
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col h-full">
                    {/* Chat Messages */}
                    <div className="flex-1 p-3 max-[480px]:p-2 overflow-y-auto space-y-2 max-[480px]:space-y-3">
                      {chat.map((msg) => (
                        <div
                          key={msg.id}
                          className={`text-sm max-[480px]:text-base ${
                            msg.isSystem 
                              ? 'text-gray-400 italic text-center' 
                              : 'text-white'
                          }`}
                          data-testid={`chat-message-${msg.id}`}
                        >
                          {!msg.isSystem && (
                            <div className="max-[480px]:mb-1">
                              <span className={`font-medium ${msg.isHost ? 'text-yellow-400' : 'text-blue-400'}`}>
                                {msg.nickname}
                              </span>
                              <span className="max-[480px]:hidden">: </span>
                            </div>
                          )}
                          <span className={`${!msg.isSystem ? 'max-[480px]:block max-[480px]:pl-0 ml-1 max-[480px]:ml-0' : ''} break-words`}>
                            {msg.message}
                          </span>
                        </div>
                      ))}
                      {chat.length === 0 && (
                        <div className="text-center text-gray-400 text-sm max-[480px]:text-base">
                          No messages yet. Start the conversation!
                        </div>
                      )}
                    </div>

                    {/* Chat Input */}
                    <form onSubmit={handleSendMessage} className="p-3 max-[480px]:p-4 border-t border-gray-700">
                      <div className="flex gap-2 max-[480px]:gap-3">
                        <input
                          type="text"
                          value={chatMessage}
                          onChange={(e) => setChatMessage(e.target.value)}
                          className="flex-1 px-3 py-2 max-[480px]:px-4 max-[480px]:py-3 bg-gray-800 text-white rounded border border-gray-600 focus:border-blue-500 focus:outline-none text-sm max-[480px]:text-base"
                          placeholder="Type a message..."
                          data-testid="input-chat-message"
                        />
                        <button
                          type="submit"
                          disabled={!chatMessage.trim()}
                          className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white px-3 py-2 max-[480px]:px-4 max-[480px]:py-3 rounded transition-colors min-w-[44px] max-[480px]:min-w-[48px] flex items-center justify-center"
                          data-testid="button-send-message"
                        >
                          <FontAwesomeIcon icon={faPaperPlane} className="w-4 h-4 max-[480px]:w-5 max-[480px]:h-5" />
                        </button>
                      </div>
                    </form>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
}
