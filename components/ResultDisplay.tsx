import React, { useMemo } from 'react';
import { MapPin, ExternalLink, Navigation } from 'lucide-react';
import { AnalysisResult, MapLocation, Language, TRANSLATIONS } from '../types';
import MapVisualization from './MapVisualization';

interface ResultDisplayProps {
  result: AnalysisResult;
  language: Language;
}

const ResultDisplay: React.FC<ResultDisplayProps> = ({ result, language }) => {
  const t = TRANSLATIONS[language];

  // Helper to format text with bold headers if markdown is not fully parsed
  const formatText = (text: string) => {
    return text.split('\n').map((line, i) => {
      // Bold simple headers ending in colon
      if (line.trim().endsWith(':') || line.trim().startsWith('**')) {
         const cleanLine = line.replace(/\*\*/g, '');
         return <p key={i} className="font-bold text-emerald-400 mt-4 mb-1">{cleanLine}</p>;
      }
      return <p key={i} className="mb-1 text-slate-300 leading-relaxed">{line.replace(/\*\*/g, '')}</p>;
    });
  };

  const mapChunks = result.groundingChunks.filter(c => c.maps);

  // Combine explicit coordinates with grounding chunks
  const locations: MapLocation[] = useMemo(() => {
    const locs: MapLocation[] = [];
    
    // 1. Add the AI's "Best Guess" from JSON first (High priority)
    if (result.coordinates) {
      locs.push({
        lat: result.coordinates.lat,
        lng: result.coordinates.lng,
        title: result.coordinates.locationName || t.unknown,
        uri: `https://www.google.com/maps/search/?api=1&query=${result.coordinates.lat},${result.coordinates.lng}`
      });
    }

    // 2. Add Grounding Chunks
    const seen = new Set<string>();
    // Add the best guess to seen to avoid duplicates if grounding returns exact same
    if (result.coordinates) {
        seen.add(`${result.coordinates.lat.toFixed(3)},${result.coordinates.lng.toFixed(3)}`);
    }

    mapChunks.forEach(chunk => {
      const uri = chunk.maps?.uri;
      const title = chunk.maps?.title || t.unknown;
      
      if (!uri) return;

      let lat = 0;
      let lng = 0;
      let found = false;

      // Pattern 1: @lat,lng
      const atMatch = uri.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
      if (atMatch) {
        lat = parseFloat(atMatch[1]);
        lng = parseFloat(atMatch[2]);
        found = true;
      } 
      // Pattern 2: q=lat,lng or q=loc:lat,lng
      else {
        const qMatch = uri.match(/[?&]q=(?:loc:)?(-?\d+\.\d+),(-?\d+\.\d+)/);
        if (qMatch) {
          lat = parseFloat(qMatch[1]);
          lng = parseFloat(qMatch[2]);
          found = true;
        }
        else {
             const dataMatch = uri.match(/!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/);
             if (dataMatch) {
                lat = parseFloat(dataMatch[1]);
                lng = parseFloat(dataMatch[2]);
                found = true;
             }
        }
      }

      if (found) {
        const key = `${lat.toFixed(3)},${lng.toFixed(3)}`;
        if (!seen.has(key)) {
          seen.add(key);
          locs.push({ lat, lng, title, uri });
        }
      }
    });

    return locs;
  }, [mapChunks, result.coordinates, t.unknown]);

  return (
    <div className="w-full space-y-6 animate-fadeIn">
      {/* Map Visualization */}
      {locations.length > 0 && (
        <div className="animate-slideUp">
             <div className="flex items-center gap-2 mb-3">
                 <MapPin className="w-5 h-5 text-emerald-500" />
                 <h3 className="text-lg font-semibold text-slate-200">{t.mapVis}</h3>
             </div>
             <MapVisualization locations={locations} />
        </div>
      )}

      {/* Text Analysis */}
      <div className="bg-slate-800/80 border border-slate-700 rounded-xl p-6 shadow-xl backdrop-blur-sm">
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <Navigation className="w-5 h-5 text-emerald-400" />
          {t.analysisHeader}
        </h2>
        <div className="prose prose-invert prose-sm max-w-none text-slate-300 whitespace-pre-wrap">
          {formatText(result.text)}
        </div>
      </div>

      {/* Map Suggestions List */}
      {mapChunks.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-slate-200 flex items-center gap-2">
            <ExternalLink className="w-5 h-5 text-blue-400" />
            {t.linksHeader}
          </h3>
          <div className="grid grid-cols-1 gap-4">
            {mapChunks.map((chunk, idx) => (
              <a
                key={idx}
                href={chunk.maps?.uri}
                target="_blank"
                rel="noopener noreferrer"
                className="block group bg-slate-800 hover:bg-slate-750 border border-slate-700 hover:border-emerald-500/50 rounded-lg p-4 transition-all duration-200 shadow-md hover:shadow-emerald-900/20"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-bold text-emerald-300 group-hover:text-emerald-200 transition-colors">
                      {chunk.maps?.title || t.unknown}
                    </h4>
                    <p className="text-xs text-slate-500 mt-1 truncate max-w-[250px] sm:max-w-md">
                      {chunk.maps?.uri}
                    </p>
                  </div>
                  <ExternalLink className="w-4 h-4 text-slate-500 group-hover:text-white transition-colors" />
                </div>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ResultDisplay;