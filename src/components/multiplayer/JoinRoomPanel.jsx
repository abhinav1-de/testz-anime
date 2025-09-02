import { useState } from 'react';
import { useMultiplayer } from '@/src/context/MultiplayerContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUsers, faArrowRight, faTimes } from '@fortawesome/free-solid-svg-icons';

export default function JoinRoomPanel() {
  const [showPanel, setShowPanel] = useState(false);
  const [roomCode, setRoomCode] = useState('');
  const [username, setUsername] = useState('');
  const { joinRoom, roomError, isInRoom } = useMultiplayer();

  const handleJoinRoom = () => {
    if (roomCode.trim() && username.trim()) {
      joinRoom(roomCode.trim(), username.trim());
      setShowPanel(false);
    }
  };

  if (isInRoom) return null;

  return (
    <>
      {/* Join Room Button */}
      <div className="fixed bottom-4 left-4 z-40">
        <button
          onClick={() => setShowPanel(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-lg transition-colors"
          data-testid="button-join-room-home"
        >
          <FontAwesomeIcon icon={faUsers} className="w-4 h-4" />
          <span className="text-sm font-medium">Join Room</span>
        </button>
      </div>

      {/* Join Room Modal */}
      {showPanel && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[#1a1a1a] border border-gray-700 rounded-lg p-6 w-80 max-w-[90vw]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white text-lg font-semibold">Join Room</h3>
              <button
                onClick={() => setShowPanel(false)}
                className="text-gray-400 hover:text-white"
                data-testid="button-close-join-panel"
              >
                <FontAwesomeIcon icon={faTimes} className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-gray-300 text-sm mb-2">Your Username</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-800 text-white rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
                  placeholder="Enter your username"
                  data-testid="input-username-join"
                />
              </div>

              <div>
                <label className="block text-gray-300 text-sm mb-2">Room Code</label>
                <input
                  type="text"
                  value={roomCode}
                  onChange={(e) => setRoomCode(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-800 text-white rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
                  placeholder="Enter room code"
                  data-testid="input-room-code-join"
                />
              </div>

              <button
                onClick={handleJoinRoom}
                disabled={!roomCode.trim() || !username.trim()}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white py-2 px-4 rounded font-medium transition-colors flex items-center justify-center gap-2"
                data-testid="button-submit-join-room"
              >
                <span>Join Room</span>
                <FontAwesomeIcon icon={faArrowRight} className="w-4 h-4" />
              </button>

              {roomError && (
                <div className="text-red-400 text-sm text-center" data-testid="text-join-error">
                  {roomError}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}