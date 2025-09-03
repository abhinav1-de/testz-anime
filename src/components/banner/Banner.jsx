import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlay,
  faClosedCaptioning,
  faMicrophone,
  faCalendar,
  faClock,
} from "@fortawesome/free-solid-svg-icons";
import { Link } from "react-router-dom";
import { useLanguage } from "@/src/context/LanguageContext";
import "./Banner.css";

function Banner({ item, index }) {
  const { language } = useLanguage();
  return (
    <section className="spotlight w-full h-full relative rounded-2xl overflow-hidden">
      <img
        src={`${item.poster}`}
        alt={item.title}
        className="absolute inset-0 object-cover w-full h-full rounded-2xl"
      />
      <div className="spotlight-overlay absolute inset-0 z-[1] rounded-2xl"></div>
      
      <div className="absolute flex flex-col left-[40px] bottom-[60px] w-[55%] z-[2] max-[1390px]:w-[45%] max-[1390px]:left-[30px] max-[1300px]:w-[600px] max-[1120px]:w-[60%] max-md:w-[90%] max-md:bottom-[20px] max-md:left-[20px] max-[300px]:w-full">
        <h1 className="text-white text-[48px] font-bold leading-tight mb-4 max-[1390px]:text-[40px] max-[1300px]:text-[36px] max-md:text-[28px] max-[575px]:text-[24px]">
          {language === "EN" ? item.title : item.japanese_title}
        </h1>
        
        {/* Rating and metadata */}
        <div className="flex items-center gap-4 mb-4">
          <div className="flex items-center gap-1">
            {[...Array(5)].map((_, i) => (
              <svg key={i} className="w-4 h-4 text-yellow-400 fill-current" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
              </svg>
            ))}
          </div>
          <span className="text-white text-sm">Average Rating: <span className="font-bold">4.9 (227.1K)</span></span>
        </div>

        {/* Metadata tags */}
        <div className="flex flex-wrap items-center gap-2 mb-4 text-sm">
          <span className="bg-gray-700 text-white px-2 py-1 rounded text-xs">AI</span>
          <span className="text-gray-300">Sub | Dub</span>
          <span className="text-gray-300">Action, Drama, Romance, Shonen, Supernatural</span>
        </div>
        
        {/* Action Buttons */}
        <div className="flex items-center gap-3 mb-6">
          <Link
            to={`/watch/${item.id}`}
            className="bg-crunchyroll-orange hover:bg-crunchyroll-orange-hover text-white font-bold px-6 py-3 rounded-md transition-all duration-200 flex items-center gap-x-2 text-sm uppercase tracking-wide"
          >
            <FontAwesomeIcon icon={faPlay} className="text-xs" />
            <span>START WATCHING S1 E1</span>
          </Link>
          
          <Link
            to={`/${item.id}`}
            className="bg-gray-800 hover:bg-gray-700 border border-gray-600 text-white p-3 rounded-md transition-all duration-200 flex items-center justify-center"
            title="Add to Watchlist"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
            </svg>
          </Link>
          
          <button className="bg-gray-800 hover:bg-gray-700 border border-gray-600 text-white p-3 rounded-md transition-all duration-200 flex items-center justify-center">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z"/>
            </svg>
          </button>
          
          <button className="bg-gray-800 hover:bg-gray-700 border border-gray-600 text-white p-3 rounded-md transition-all duration-200 flex items-center justify-center">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z"/>
            </svg>
          </button>
        </div>

        {/* Description */}
        <div className="mb-6 max-w-[800px]">
          <p className="text-gray-300 text-sm leading-relaxed line-clamp-3">
            {item.description || "When high schooler Momo, from a family of spirit mediums, first meets her classmate Okarun, an occult geek, they argue—Momo believes in ghosts but denies aliens, and Okarun believes in aliens but denies ghosts. When it turns out both phenomena are real, Momo awakens a hidden power and Okarun gains the power of a curse. Together, they must challenge the paranormal forces threatening their world."}
          </p>
        </div>

        {/* Audio and Subtitles */}
        <div className="space-y-2 text-xs">
          <div>
            <span className="text-gray-400 font-medium">Audio: </span>
            <span className="text-gray-300">Japanese, English, Deutsch, Español (América Latina), Español (España), Français, Italiano, Português (Brasil), Русский, العربية</span>
          </div>
          <div>
            <span className="text-gray-400 font-medium">Subtitles: </span>
            <span className="text-gray-300">English, Bahasa Indonesia, Deutsch, Español (América Latina), Español (España), Français, Italiano, Português (Brasil), Русский, العربية, 한국어</span>
          </div>
        </div>

        {/* MORE DETAILS link */}
        <div className="mt-6">
          <Link 
            to={`/${item.id}`}
            className="text-crunchyroll-orange hover:text-crunchyroll-orange-hover font-bold text-sm uppercase tracking-wide transition-colors"
          >
            MORE DETAILS
          </Link>
        </div>
      </div>
    </section>
  );
}

export default Banner;
