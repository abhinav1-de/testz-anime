import axios from "axios";

// Shizuru API endpoints for different providers
const SHIZURU_ENDPOINTS = {
  zuko: 'https://api.shizuru.app/api/streaming/zuko',
  suki: 'https://api.shizuru.app/api/streaming/suki', 
  holyshit: 'https://api.shizuru.app/api/streaming/holyshit'
};

/**
 * Fetch streaming data from Shizuru API
 * @param {string} provider - Provider name (zuko, suki, holyshit)
 * @param {string} idType - ID type (mal, anilist)
 * @param {string} animeId - Anime ID
 * @param {string} episodeNum - Episode number
 * @returns {Promise<Object>} Streaming data with sources
 */
export async function getShizuruStream(provider, idType, animeId, episodeNum) {
  try {
    const endpoint = SHIZURU_ENDPOINTS[provider.toLowerCase()];
    if (!endpoint) {
      throw new Error(`Unknown provider: ${provider}`);
    }

    const url = `${endpoint}/${idType}/${animeId}/${episodeNum}`;
    console.log(`Fetching from Shizuru ${provider}:`, url);
    console.log('Request details:', { provider, idType, animeId, episodeNum });
    
    const response = await axios.get(url, {
      timeout: 10000, // 10 second timeout
      headers: {
        'User-Agent': 'JustAnime/1.0'
      }
    });

    if (response.data?.success && response.data?.data?.sources) {
      return {
        success: true,
        sources: response.data.data.sources,
        metadata: response.data.data.metadata
      };
    } else {
      throw new Error('Invalid response format');
    }
  } catch (error) {
    console.error(`Error fetching ${provider} stream:`, error);
    return {
      success: false,
      error: error.message,
      sources: []
    };
  }
}

/**
 * Get all available streams from Shizuru providers
 * @param {string} malId - MyAnimeList ID
 * @param {string} anilistId - AniList ID  
 * @param {string} episodeNum - Episode number
 * @returns {Promise<Array>} Array of server objects
 */
export async function getAllShizuruStreams(malId, anilistId, episodeNum) {
  const servers = [];
  const providers = [
    { name: 'zuko', idType: 'mal', id: malId },
    { name: 'suki', idType: 'anilist', id: anilistId },
    { name: 'holyshit', idType: 'mal', id: malId }
  ];

  // Fetch from all providers in parallel
  const promises = providers.map(async (provider) => {
    if (!provider.id) return null;
    
    const result = await getShizuruStream(provider.name, provider.idType, provider.id, episodeNum);
    if (result.success && result.sources.length > 0) {
      return {
        provider: provider.name,
        sources: result.sources,
        metadata: result.metadata
      };
    }
    return null;
  });

  const results = await Promise.all(promises);
  
  // Process results and create server objects
  results.forEach((result, index) => {
    if (result && result.sources) {
      const provider = providers[index];
      
      result.sources.forEach((source, sourceIndex) => {
        // Determine server type based on source info
        let serverType = 'sub'; // default
        const serverName = source.server || `${provider.name.toUpperCase()} ${sourceIndex + 1}`;
        
        if (serverName.toLowerCase().includes('dub') || serverName.toLowerCase().includes('english')) {
          serverType = 'dub';
        } else if (serverName.toLowerCase().includes('sub') || serverName.toLowerCase().includes('japanese')) {
          serverType = 'sub';
        }
        
        servers.push({
          type: serverType,
          serverName: serverName,
          data_id: `shizuru-${provider.name}-${sourceIndex}`,
          server_id: `shizuru-${provider.name}-${sourceIndex}`,
          provider: provider.name,
          source: source,
          streamUrl: source.url,
          quality: source.quality || 'HD',
          streamType: source.type || 'hls'
        });
      });
    }
  });

  console.log('Shizuru servers found:', servers);
  return servers;
}

export default { getShizuruStream, getAllShizuruStreams };
