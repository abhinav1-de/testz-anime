import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBars,
  faRandom,
  faMagnifyingGlass,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";
import { useLanguage } from "@/src/context/LanguageContext";
import { Link, useLocation } from "react-router-dom";
import Sidebar from "../sidebar/Sidebar";
import { SearchProvider } from "@/src/context/SearchContext";
import WebSearch from "../searchbar/WebSearch";
import MobileSearch from "../searchbar/MobileSearch";

function Navbar() {
  const location = useLocation();
  const { language, toggleLanguage } = useLanguage();
  const [isNotHomePage, setIsNotHomePage] = useState(
    location.pathname !== "/" && location.pathname !== "/home"
  );
  const [isScrolled, setIsScrolled] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const handleHamburgerClick = () => {
    setIsSidebarOpen(true);
  };

  const handleCloseSidebar = () => {
    setIsSidebarOpen(false);
  };

  const handleRandomClick = () => {
    if (location.pathname === "/random") {
      window.location.reload();
    }
  };

  useEffect(() => {
    setIsNotHomePage(
      location.pathname !== "/" && location.pathname !== "/home"
    );
  }, [location.pathname]);

  return (
    <SearchProvider>
      <nav
        className={`fixed top-0 left-0 w-full z-[1000000] transition-all duration-300 ease-in-out bg-crunchyroll-dark border-b border-crunchyroll-gray
          ${isScrolled ? "bg-opacity-95 backdrop-blur-md shadow-lg" : "bg-opacity-100"}`}
      >
        <div className="max-w-[1920px] mx-auto px-4 h-16 flex items-center justify-between">
          {/* Left Section */}
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-6">
              <FontAwesomeIcon
                icon={faBars}
                className="text-xl text-crunchyroll-text-muted cursor-pointer hover:text-crunchyroll-orange transition-colors lg:hidden"
                onClick={handleHamburgerClick}
              />
              <Link to="/home" className="flex items-center">
                <img src="/logo.png" alt="JustAnime Logo" className="h-9 w-auto" />
              </Link>
              
              {/* Navigation Menu - Desktop */}
              <div className="hidden lg:flex items-center gap-6 ml-6">
                <Link to="/recently-added" className="text-crunchyroll-text-muted hover:text-crunchyroll-text transition-colors font-medium">
                  New
                </Link>
                <Link to="/most-popular" className="text-crunchyroll-text-muted hover:text-crunchyroll-text transition-colors font-medium">
                  Popular
                </Link>
                <Link to="/recently-updated" className="text-crunchyroll-text-muted hover:text-crunchyroll-text transition-colors font-medium">
                  Simulcast
                </Link>
                <div className="relative group">
                  <button className="text-crunchyroll-text-muted hover:text-crunchyroll-text transition-colors font-medium flex items-center gap-1">
                    Categories
                    <svg className="w-4 h-4 transition-transform duration-200 group-hover:rotate-180" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                  
                  {/* Categories Dropdown */}
                  <div className="absolute top-full left-0 mt-2 w-80 bg-crunchyroll-darker border border-crunchyroll-gray rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                    <div className="p-4">
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <h3 className="text-crunchyroll-text font-semibold text-sm mb-2 uppercase tracking-wide">Genres</h3>
                          <div className="space-y-1">
                            <Link to="/genre/action" className="block text-crunchyroll-text-muted hover:text-crunchyroll-orange text-sm py-1 transition-colors">Action</Link>
                            <Link to="/genre/adventure" className="block text-crunchyroll-text-muted hover:text-crunchyroll-orange text-sm py-1 transition-colors">Adventure</Link>
                            <Link to="/genre/comedy" className="block text-crunchyroll-text-muted hover:text-crunchyroll-orange text-sm py-1 transition-colors">Comedy</Link>
                            <Link to="/genre/drama" className="block text-crunchyroll-text-muted hover:text-crunchyroll-orange text-sm py-1 transition-colors">Drama</Link>
                            <Link to="/genre/fantasy" className="block text-crunchyroll-text-muted hover:text-crunchyroll-orange text-sm py-1 transition-colors">Fantasy</Link>
                            <Link to="/genre/romance" className="block text-crunchyroll-text-muted hover:text-crunchyroll-orange text-sm py-1 transition-colors">Romance</Link>
                            <Link to="/genre/sci-fi" className="block text-crunchyroll-text-muted hover:text-crunchyroll-orange text-sm py-1 transition-colors">Sci-Fi</Link>
                            <Link to="/genre/shounen" className="block text-crunchyroll-text-muted hover:text-crunchyroll-orange text-sm py-1 transition-colors">Shounen</Link>
                          </div>
                        </div>
                        <div>
                          <h3 className="text-crunchyroll-text font-semibold text-sm mb-2 uppercase tracking-wide">Categories</h3>
                          <div className="space-y-1">
                            <Link to="/top-airing" className="block text-crunchyroll-text-muted hover:text-crunchyroll-orange text-sm py-1 transition-colors">Top Airing</Link>
                            <Link to="/most-favorite" className="block text-crunchyroll-text-muted hover:text-crunchyroll-orange text-sm py-1 transition-colors">Most Favorite</Link>
                            <Link to="/completed" className="block text-crunchyroll-text-muted hover:text-crunchyroll-orange text-sm py-1 transition-colors">Completed</Link>
                            <Link to="/movie" className="block text-crunchyroll-text-muted hover:text-crunchyroll-orange text-sm py-1 transition-colors">Movies</Link>
                            <Link to="/ova" className="block text-crunchyroll-text-muted hover:text-crunchyroll-orange text-sm py-1 transition-colors">OVA</Link>
                            <Link to="/special" className="block text-crunchyroll-text-muted hover:text-crunchyroll-orange text-sm py-1 transition-colors">Special</Link>
                            <Link to="/subbed-anime" className="block text-crunchyroll-text-muted hover:text-crunchyroll-orange text-sm py-1 transition-colors">Subbed</Link>
                            <Link to="/dubbed-anime" className="block text-crunchyroll-text-muted hover:text-crunchyroll-orange text-sm py-1 transition-colors">Dubbed</Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <Link to="/schedule" className="text-crunchyroll-text-muted hover:text-crunchyroll-text transition-colors font-medium">
                  Schedule
                </Link>
              </div>
            </div>
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-4">
            {/* Premium Badge */}
            <div className="hidden lg:flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-yellow-500 to-yellow-400 rounded-full">
              <svg className="w-4 h-4 text-black" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <span className="text-black text-sm font-bold">TRY FREE</span>
            </div>

            {/* Search Icon - Desktop */}
            <div className="hidden md:flex">
              <WebSearch />
            </div>

            {/* Bookmark & Profile Icons */}
            <div className="hidden lg:flex items-center gap-2">
              <button className="p-2 text-crunchyroll-text-muted hover:text-crunchyroll-orange transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                </svg>
              </button>
              
              <Link
                to={location.pathname === "/random" ? "#" : "/random"}
                onClick={handleRandomClick}
                className="p-2 text-crunchyroll-text-muted hover:text-crunchyroll-orange transition-colors"
                title="Random Anime"
              >
                <FontAwesomeIcon icon={faRandom} className="text-lg" />
              </Link>

              <button className="p-2 text-crunchyroll-text-muted hover:text-crunchyroll-orange transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                </svg>
              </button>
            </div>

            {/* Language Toggle - Desktop */}
            <div className="hidden md:flex items-center gap-2 bg-crunchyroll-light-gray rounded-md p-1">
              {["EN", "JP"].map((lang) => (
                <button
                  key={lang}
                  onClick={() => toggleLanguage(lang)}
                  className={`px-3 py-1 text-sm font-medium rounded transition-colors ${
                    language === lang
                      ? "bg-crunchyroll-orange text-white"
                      : "text-crunchyroll-text-muted hover:text-crunchyroll-text"
                  }`}
                >
                  {lang}
                </button>
              ))}
            </div>
          </div>

          {/* Mobile Search Icon */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMobileSearchOpen(!isMobileSearchOpen)}
              className="p-2 text-crunchyroll-text-muted hover:text-crunchyroll-orange transition-colors"
              title={isMobileSearchOpen ? "Close Search" : "Search Anime"}
            >
              <FontAwesomeIcon 
                icon={isMobileSearchOpen ? faXmark : faMagnifyingGlass} 
                className="w-5 h-5 transition-transform duration-200"
                style={{ transform: isMobileSearchOpen ? 'rotate(90deg)' : 'rotate(0deg)' }}
              />
            </button>
          </div>
        </div>

        {/* Mobile Search Dropdown */}
        {isMobileSearchOpen && (
          <div className="md:hidden bg-crunchyroll-gray border-t border-crunchyroll-light-gray shadow-lg">
            <MobileSearch onClose={() => setIsMobileSearchOpen(false)} />
        </div>
        )}

        {/* Sidebar */}
        <Sidebar isOpen={isSidebarOpen} onClose={handleCloseSidebar} />
      </nav>
    </SearchProvider>
  );
}

export default Navbar;
