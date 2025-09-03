import React, { useState, useRef, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faClosedCaptioning,
  faMicrophone,
  faPlay,
  faStar,
  faBookmark,
  faEllipsisH,
  faShare,
  faHeart,
  faPlus,
  faList
} from "@fortawesome/free-solid-svg-icons";
import { faBookmark as faBookmarkRegular } from "@fortawesome/free-regular-svg-icons";
import { useLanguage } from "@/src/context/LanguageContext";
import { Link, useNavigate } from "react-router-dom";

const AnimeCardWithHover = ({ item, path, index, onBookmark, onShare }) => {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [showOptionsMenu, setShowOptionsMenu] = useState(false);
  const hoverTimeoutRef = useRef(null);
  const cardRef = useRef(null);

  // Get bookmarked status from localStorage
  useEffect(() => {
    const bookmarkedItems = JSON.parse(localStorage.getItem('bookmarkedAnime') || '[]');
    setIsBookmarked(bookmarkedItems.some(bookmark => bookmark.id === item.id));
  }, [item.id]);

  const handleMouseEnter = () => {
    clearTimeout(hoverTimeoutRef.current);
    hoverTimeoutRef.current = setTimeout(() => {
      setIsHovered(true);
    }, 500); // 500ms delay before showing detailed panel
  };

  const handleMouseLeave = () => {
    clearTimeout(hoverTimeoutRef.current);
    setIsHovered(false);
    setShowOptionsMenu(false);
  };

  const handleBookmark = (e) => {
    e.stopPropagation();
    const bookmarkedItems = JSON.parse(localStorage.getItem('bookmarkedAnime') || '[]');
    
    if (isBookmarked) {
      // Remove from bookmarks
      const updatedBookmarks = bookmarkedItems.filter(bookmark => bookmark.id !== item.id);
      localStorage.setItem('bookmarkedAnime', JSON.stringify(updatedBookmarks));
      setIsBookmarked(false);
    } else {
      // Add to bookmarks
      const bookmarkData = {
        id: item.id,
        title: item.title,
        poster: item.poster,
        addedAt: new Date().toISOString()
      };
      bookmarkedItems.push(bookmarkData);
      localStorage.setItem('bookmarkedAnime', JSON.stringify(bookmarkedItems));
      setIsBookmarked(true);
    }
    
    if (onBookmark) onBookmark(item, !isBookmarked);
  };

  const handleShare = (e) => {
    e.stopPropagation();
    const shareData = {
      title: item.title,
      text: `Check out ${item.title} on JustAnime!`,
      url: `${window.location.origin}/${item.id}`
    };

    if (navigator.share) {
      navigator.share(shareData);
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(shareData.url);
      // You could show a toast notification here
    }
    
    if (onShare) onShare(item);
  };

  const handleOptionsMenu = (e) => {
    e.stopPropagation();
    setShowOptionsMenu(!showOptionsMenu);
  };

  const handleCardClick = () => {
    navigate(
      `${
        path === "top-upcoming"
          ? `/${item.id}`
          : `/watch/${item.id}`
      }`
    );
  };

  // Generate rating display
  const rating = item.score || item.rating || 4.5; // Fallback to 4.5 if no rating
  const totalViews = item.totalEpisodes ? `${item.totalEpisodes} Episodes` : '8 Episodes';
  const seasons = item.totalSeasons || '1 Season';

  return (
    <div
      ref={cardRef}
      className="relative flex flex-col transition-all duration-300 ease-in-out"
      style={{ height: "fit-content" }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Main Card */}
      <div className={`w-full h-auto pb-[140%] relative inline-block overflow-hidden rounded-lg shadow-lg group transition-all duration-300 ${isHovered ? 'scale-105 z-30' : ''}`}>
        <div
          className="inline-block bg-gray-900 absolute left-0 top-0 w-full h-full group hover:cursor-pointer"
          onClick={handleCardClick}
        >
          <img
            src={`${item.poster}`}
            alt={item.title}
            className={`block w-full h-full object-cover transition-all duration-500 ease-in-out ${isHovered ? 'scale-105 blur-sm' : 'group-hover:scale-105 group-hover:blur-sm'}`}
          />
          
          {/* Hover Overlay */}
          <div className={`absolute inset-0 bg-black/60 transition-all duration-300 flex items-center justify-center ${isHovered ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
            <div className={`transform transition-transform duration-300 ${isHovered ? 'translate-y-0' : 'translate-y-4 group-hover:translate-y-0'}`}>
              <FontAwesomeIcon
                icon={faPlay}
                className="text-[50px] text-white drop-shadow-lg max-[450px]:text-[36px]"
              />
            </div>
          </div>
        </div>

        {/* Age Rating Badge */}
        {(item.tvInfo?.rating === "18+" || item?.adultContent === true) && (
          <div className="text-white px-2 py-0.5 rounded-lg bg-red-600 absolute top-3 left-3 flex items-center justify-center text-[12px] font-bold z-10">
            18+
          </div>
        )}

        {/* Bottom Info Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/80 via-black/50 to-transparent">
          <div className="flex items-center justify-start w-full space-x-1 max-[478px]:space-x-0.5 z-[100] flex-wrap gap-y-1">
            {item.tvInfo?.sub && (
              <div className="flex space-x-0.5 justify-center items-center bg-[#2a2a2a] rounded-[2px] px-1.5 text-white py-0.5 max-[478px]:py-0.5 max-[478px]:px-1">
                <FontAwesomeIcon icon={faClosedCaptioning} className="text-[10px]" />
                <p className="text-[10px] font-medium">{item.tvInfo.sub}</p>
              </div>
            )}
            {item.tvInfo?.dub && (
              <div className="flex space-x-0.5 justify-center items-center bg-[#2a2a2a] rounded-[2px] px-1.5 text-white py-0.5 max-[478px]:py-0.5 max-[478px]:px-1">
                <FontAwesomeIcon icon={faMicrophone} className="text-[10px]" />
                <p className="text-[10px] font-medium">{item.tvInfo.dub}</p>
              </div>
            )}
            {item.tvInfo?.showType && (
              <div className="bg-[#2a2a2a] text-white rounded-[2px] px-1.5 py-0.5 text-[10px] font-medium max-[478px]:py-0.5 max-[478px]:px-1 max-[478px]:hidden">
                {item.tvInfo.showType.split(" ").shift()}
              </div>
            )}
            {item.releaseDate && (
              <div className="bg-[#2a2a2a] text-white rounded-[2px] px-1.5 py-0.5 text-[10px] font-medium max-[478px]:py-0.5 max-[478px]:px-1">
                {item.releaseDate}
              </div>
            )}
            {!item.tvInfo?.showType && item.type && (
              <div className="bg-[#2a2a2a] text-white rounded-[2px] px-1.5 py-0.5 text-[10px] font-medium max-[478px]:py-0.5 max-[478px]:px-1">
                {item.type}
              </div>
            )}
            {(item.tvInfo?.duration || item.duration) && (
              <div className="bg-[#2a2a2a] text-white rounded-[2px] px-1.5 py-0.5 text-[10px] font-medium max-[478px]:py-0.5 max-[478px]:px-1 max-[478px]:hidden">
                {item.tvInfo?.duration === "m" || item.tvInfo?.duration === "?" || item.duration === "m" || item.duration === "?" 
                  ? "N/A" 
                  : item.tvInfo?.duration || item.duration || "N/A"}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Enhanced Hover Panel */}
      {isHovered && (
        <div className="absolute top-0 left-full ml-2 w-80 bg-crunchyroll-darker border border-crunchyroll-gray rounded-lg shadow-2xl z-40 p-4 transform transition-all duration-300 ease-out">
          {/* Header */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <h3 className="text-white font-bold text-lg leading-tight mb-1 line-clamp-2">
                {language === "EN" ? item.title : item.japanese_title}
              </h3>
              <div className="flex items-center gap-2 text-sm text-crunchyroll-text-muted">
                <div className="flex items-center gap-1">
                  <FontAwesomeIcon icon={faStar} className="text-yellow-400 text-xs" />
                  <span className="font-medium">{rating}</span>
                  <span className="text-xs">({item.totalViews || '105.9K'})</span>
                </div>
              </div>
            </div>
          </div>

          {/* Metadata */}
          <div className="space-y-1 mb-3 text-sm text-crunchyroll-text-muted">
            <div>{seasons}</div>
            <div>{totalViews}</div>
          </div>

          {/* Description */}
          {item.description && (
            <p className="text-sm text-crunchyroll-text-muted line-clamp-4 mb-4 leading-relaxed">
              {item.description}
            </p>
          )}

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            {/* Play Button */}
            <button 
              onClick={handleCardClick}
              className="flex items-center gap-2 bg-crunchyroll-orange hover:bg-crunchyroll-orange/80 text-black font-medium px-4 py-2 rounded-md transition-colors duration-200"
            >
              <FontAwesomeIcon icon={faPlay} className="text-sm" />
            </button>

            {/* Bookmark Button */}
            <button
              onClick={handleBookmark}
              className={`p-2 rounded-md border transition-all duration-200 ${
                isBookmarked 
                  ? 'bg-crunchyroll-orange border-crunchyroll-orange text-black' 
                  : 'bg-crunchyroll-darker border-crunchyroll-gray text-crunchyroll-text-muted hover:border-crunchyroll-orange hover:text-crunchyroll-orange'
              }`}
            >
              <FontAwesomeIcon icon={isBookmarked ? faBookmark : faBookmarkRegular} className="text-sm" />
            </button>

            {/* More Options Button */}
            <div className="relative">
              <button
                onClick={handleOptionsMenu}
                className="p-2 rounded-md border border-crunchyroll-gray bg-crunchyroll-darker text-crunchyroll-text-muted hover:border-crunchyroll-orange hover:text-crunchyroll-orange transition-all duration-200"
              >
                <FontAwesomeIcon icon={faEllipsisH} className="text-sm" />
              </button>

              {/* Options Dropdown */}
              {showOptionsMenu && (
                <div className="absolute top-full left-0 mt-1 w-48 bg-crunchyroll-darker border border-crunchyroll-gray rounded-md shadow-xl z-50">
                  <div className="py-1">
                    <button
                      onClick={() => {/* Add to watchlist */}}
                      className="flex items-center gap-3 w-full px-3 py-2 text-sm text-crunchyroll-text-muted hover:text-crunchyroll-orange hover:bg-crunchyroll-gray/10 transition-colors"
                    >
                      <FontAwesomeIcon icon={faPlus} className="text-xs" />
                      Add to Watchlist
                    </button>
                    <button
                      onClick={() => {/* Add to list */}}
                      className="flex items-center gap-3 w-full px-3 py-2 text-sm text-crunchyroll-text-muted hover:text-crunchyroll-orange hover:bg-crunchyroll-gray/10 transition-colors"
                    >
                      <FontAwesomeIcon icon={faList} className="text-xs" />
                      Add to List
                    </button>
                    <button
                      onClick={() => {/* Mark as favorite */}}
                      className="flex items-center gap-3 w-full px-3 py-2 text-sm text-crunchyroll-text-muted hover:text-crunchyroll-orange hover:bg-crunchyroll-gray/10 transition-colors"
                    >
                      <FontAwesomeIcon icon={faHeart} className="text-xs" />
                      Add to Favorites
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Share Button */}
            <button
              onClick={handleShare}
              className="p-2 rounded-md border border-crunchyroll-gray bg-crunchyroll-darker text-crunchyroll-text-muted hover:border-crunchyroll-orange hover:text-crunchyroll-orange transition-all duration-200"
            >
              <FontAwesomeIcon icon={faShare} className="text-sm" />
            </button>
          </div>
        </div>
      )}

      {/* Title */}
      <Link
        to={`/${item.id}`}
        className="text-white font-semibold mt-3 item-title hover:text-white hover:cursor-pointer line-clamp-1"
      >
        {language === "EN" ? item.title : item.japanese_title}
      </Link>
    </div>
  );
};

export default AnimeCardWithHover;
