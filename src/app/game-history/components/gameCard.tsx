import { useState, useEffect } from "react";
import { ChevronDown, ChevronUp, Clock, Users, Coins, TrendingUp, Award } from "lucide-react";
import type { GameCardData, PlayerDetail } from "@/types";
import { getCurrencySymbol } from "@/theme/theme";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/firebase";

// Props interface for our component
interface PokerGameCardProps {
  gameData: GameCardData;
}

export default function PokerGameCard({ gameData }: PokerGameCardProps) {
  const [detailsExpanded, setDetailsExpanded] = useState(false);
  const [displayNames, setDisplayNames] = useState<Record<string, string>>({});
  
  const toggleDetails = () => {
    setDetailsExpanded(!detailsExpanded);
  };

  // Fetch display names for all players when details are expanded
  useEffect(() => {
    if (!detailsExpanded) return;

    async function fetchDisplayNames() {
      const names: Record<string, string> = {};
      
      for (const player of gameData.playerDetails) {
        if (player.name === 'You') continue; // Skip fetching for current user
        
        try {
          const usernameDoc = await getDoc(doc(db, "usernames", player.name.toLowerCase()));
          if (!usernameDoc.exists()) {
            names[player.name] = player.name; // Fallback to username
            continue;
          }
          
          const uid = usernameDoc.data().uid;
          const playerDoc = await getDoc(doc(db, "players", uid));
          if (playerDoc.exists()) {
            const data = playerDoc.data();
            if (data.displayName) {
              names[player.name] = data.displayName;
            } else {
              names[player.name] = player.name; // Fallback to username
            }
          }
        } catch (error) {
          console.error("Error fetching display name:", error);
          names[player.name] = player.name; // Fallback to username on error
        }
      }
      
      setDisplayNames(names);
    }

    fetchDisplayNames();
  }, [detailsExpanded, gameData.playerDetails]);

  // Get currency symbol from game data
  const currencySymbol = getCurrencySymbol(gameData.currency);
  
  // Determine winning/losing status for styling
  const isWinning = gameData.currentUserWinnings > 0;
  const isGameActive = gameData.status === 'active';
  
  // Format currency with appropriate symbol
  const formatCurrency = (amount: number): string => {
    const prefix = amount >= 0 ? '+' : '-';
    return `${prefix}${currencySymbol}${Math.abs(amount).toLocaleString()}`;
  };

  // Format percentage with plus/minus sign
  const formatPercentage = (percentage: number): string => {
    const prefix = percentage >= 0 ? '+' : '';
    return `${prefix}${percentage.toFixed(1)}%`;
  };

  // Format duration as hours and minutes, or "Active" for in-progress games
  const formatDuration = (hours: number, minutes: number): string => {
    if (isGameActive) return "Active";
    if (hours === 0) return `${minutes}m`;
    return minutes === 0 ? `${hours}h` : `${hours}h ${minutes}m`;
  };
  
  return (
    <div className="max-w-sm mx-auto">
      <div className="bg-gradient-to-br from-slate-50 to-gray-100 rounded-2xl shadow-lg overflow-hidden border border-slate-200">
        {/* Game Banner with soft overlay */}
        <div className="relative bg-slate-200 h-24">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-800/70 to-white-700/70 flex items-end">
            <div className="p-5 w-full">
              <h3 className="text-xl font-bold text-white tracking-tight truncate">{gameData.name}</h3>
              <div className="flex items-center justify-between mt-1">
                <span className="text-sm text-slate-200 font-medium">{gameData.date}</span>
                <div className="flex items-center bg-slate-500/50 rounded-full px-2 py-0.5 text-slate-100 text-sm">
                  <Users size={15} className="mr-1" />
                  <span>{gameData.players} players</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Main Content */}
        <div className="bg-gradient-to-b from-white-100 to-grey-200 px-5 pt-3 pb-4">
          {/* User's Performance - Winnings and ROI side by side with gradient background */}
          <div 
            className={`rounded-xl p-4 mb-4 shadow-sm border ${
              isGameActive 
                ? 'border-slate-200' 
                : isWinning 
                  ? 'border-teal-200' 
                  : 'border-rose-200'
            }`}
            style={{
              background: isGameActive
                ? 'linear-gradient(135deg, rgb(255, 255, 255), rgba(241, 245, 249, 0.6))'
                : isWinning 
                  ? 'linear-gradient(135deg, rgb(255, 255, 255), rgba(209, 250, 229, 0.6))'
                  : 'linear-gradient(135deg, rgb(255, 255, 255), rgba(252, 231, 231, 0.6))'
            }}
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <span className={`text-sm font-medium ${
                  isGameActive 
                    ? 'text-slate-500' 
                    : isWinning 
                      ? 'text-teal-700' 
                      : 'text-rose-700'
                }`}>
                  Your Winnings
                </span>
                <span className={`text-xl font-bold block ${
                  isGameActive 
                    ? 'text-slate-400' 
                    : isWinning 
                      ? 'text-teal-600' 
                      : 'text-rose-600'
                }`}>
                  {isGameActive ? '--' : formatCurrency(gameData.currentUserWinnings)}
                </span>
              </div>
              <div className="flex-1 flex flex-col items-end">
                <span className={`text-sm font-medium ${
                  isGameActive 
                    ? 'text-slate-500' 
                    : isWinning 
                      ? 'text-teal-700' 
                      : 'text-rose-700'
                }`}>
                  ROI
                </span>
                <span className={`text-xl font-bold ${
                  isGameActive 
                    ? 'text-slate-400' 
                    : isWinning 
                      ? 'text-teal-600' 
                      : 'text-rose-600'
                }`}>
                  {isGameActive ? '--' : formatPercentage(gameData.roi)}
                </span>
              </div>
            </div>
          </div>
          
          {/* Key Stats Area */}
          <div className="flex items-center justify-between mb-4">
            <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100 flex-1 mr-3">
              <div className="flex items-center">
                <Coins size={16} className="text-slate-400 mr-1" />
                <span className="text-lg text-slate-500 font-medium">Total Pot</span>
              </div>
              <span className="text-slate-800 text-lg font-bold block mt-1">{currencySymbol}{gameData.potSize}</span>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100 flex-1">
              <div className="flex items-center">
                <Clock size={16} className="text-slate-400 mr-1" />
                <span className="text-lg text-slate-500 font-medium">Duration</span>
              </div>
              <span className="text-slate-800 text-lg font-bold block mt-1">
                {formatDuration(gameData.durationHours, gameData.durationMinutes)}
              </span>
            </div>
          </div>
        </div>
        
        {/* Details Button */}
        <div className="border-t border-slate-200">
          <button 
            onClick={toggleDetails}
            className="w-full flex items-center justify-center py-3 px-5 bg-transparent hover:bg-slate-100 transition-colors duration-200 text-slate-600 font-medium"
          >
            <span>Details</span>
            {detailsExpanded ? 
              <ChevronUp size={16} className="ml-1.5" /> : 
              <ChevronDown size={16} className="ml-1.5" />
            }
          </button>
        </div>
        
        {/* Expandable Details Section */}
        {detailsExpanded && (
          <div className="border-t border-slate-200 bg-white">
            <div className="px-5 py-3">
              <div className="flex justify-between text-xs font-medium text-slate-500 mb-2 px-1 pb-2 border-b border-slate-100">
                <span className="w-1/4">Player</span>
                <span className="w-1/4 text-right">Funds</span>
                <span className="w-1/4 text-right">Winnings</span>
                <span className="w-1/4 text-right">ROI</span>
              </div>
              
              <div className="space-y-1.5">
                {(() => {
                  // Sort players by winnings, highest to lowest
                  const sortedPlayers = [...gameData.playerDetails].sort((a, b) => b.winnings - a.winnings);
                  
                  return sortedPlayers.map((player, index) => {
                    const playerIsWinning = player.winnings > 0;
                    const isTopWinner = index === 0;
                    const isYou = player.name === 'You';
                    const displayName = isYou ? 'You' : displayNames[player.name] || player.name;
                    
                    return (
                      <div 
                        key={index} 
                        className={`flex justify-between items-center py-2 px-1 rounded-lg text-xs ${
                          isYou ? "bg-slate-100" : "hover:bg-slate-50 transition-colors duration-150"
                        }`}
                      >
                        <div className="w-1/4 font-medium text-slate-800 flex items-center">
                          {isTopWinner ? (
                            <>
                              <span className="h-4 w-4 rounded-full bg-amber-100 flex items-center justify-center mr-1.5">
                                <Award size={10} className="text-amber-600" />
                              </span>
                              <span>{displayName}</span>
                            </>
                          ) : (
                            <div className="flex items-center">
                              <span className="w-5.5 mr-1.5"></span> {/* Spacer for alignment */}
                              <span className={isYou ? "font-bold text-teal-600" : ""}>{displayName}</span>
                            </div>
                          )}
                        </div>
                        <span className="w-1/4 text-right font-medium text-slate-700">{currencySymbol}{player.netFunding}</span>
                        <span className={`w-1/4 text-right font-bold ${
                          isGameActive 
                            ? 'text-slate-400' 
                            : playerIsWinning 
                              ? 'text-teal-600' 
                              : 'text-rose-600'
                        }`}>
                          {isGameActive ? '--' : formatCurrency(player.winnings)}
                        </span>
                        <span className={`w-1/4 text-right font-bold ${
                          isGameActive 
                            ? 'text-slate-400' 
                            : playerIsWinning 
                              ? 'text-teal-600' 
                              : 'text-rose-600'
                        }`}>
                          {isGameActive ? '--' : formatPercentage(player.roi)}
                        </span>
                      </div>
                    );
                  });
                })()}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}