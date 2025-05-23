"use client";

import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { db } from '../firebase/firebase';
import { collection, query, where, getDocs, onSnapshot } from 'firebase/firestore';
import { usePathname } from 'next/navigation';
import { getUsernameByUID } from '../firebase/firebaseUtils';

interface ActiveGame {
  id: string;
  name: string;
}

export function useActiveGame() {
  const { user } = useAuth();
  const [activeGame, setActiveGame] = useState<ActiveGame | null>(null);
  const [loading, setLoading] = useState(true);
  const pathname = usePathname();
  const [username, setUsername] = useState<string | null>(null);
  
  // Check if current path is within the active game
  const isInActiveGame = activeGame ? pathname.includes(`/game/${activeGame.id}`) : false;

  // First get the username
  useEffect(() => {
    async function fetchUsername() {
      if (!user) {
        setUsername(null);
        return;
      }

      try {
        const usernameResult = await getUsernameByUID(user.uid);
        setUsername(usernameResult);
      } catch (error) {
        console.error('Error fetching username:', error);
        setUsername(null);
      }
    }

    fetchUsername();
  }, [user]);

  // Then use the username to find active games
  useEffect(() => {
    if (!username) {
      setActiveGame(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    
    // Query for active games where the current user is either the host OR a participant
    const gamesRef = collection(db, 'games');
    const activeGamesQuery = query(
      gamesRef, 
      where('status', '==', 'active')
    );

    // First get initial data
    const fetchActiveGame = async () => {
      try {
        const snapshot = await getDocs(activeGamesQuery);
        let foundGame = null;
        
        // Check each active game to see if user is host or participant
        snapshot.docs.forEach(doc => {
          const gameData = doc.data();
          const isHost = gameData.hostUsername === username;
          const isParticipant = gameData.playerUsernames && gameData.playerUsernames.includes(username);
          
          if (isHost || isParticipant) {
            foundGame = {
              id: doc.id,
              name: gameData.name
            };
          }
        });
        
        setActiveGame(foundGame);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching active game:', error);
        setLoading(false);
      }
    };

    fetchActiveGame();
    
    // Then subscribe to changes
    const unsubscribe = onSnapshot(activeGamesQuery, (snapshot) => {
      let foundGame = null;
      
      // Check each active game to see if user is host or participant
      snapshot.docs.forEach(doc => {
        const gameData = doc.data();
        const isHost = gameData.hostUsername === username;
        const isParticipant = gameData.playerUsernames && gameData.playerUsernames.includes(username);
        
        if (isHost || isParticipant) {
          foundGame = {
            id: doc.id,
            name: gameData.name
          };
        }
      });
      
      setActiveGame(foundGame);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [username]);

  return {
    activeGame,
    loading,
    isInActiveGame
  };
} 