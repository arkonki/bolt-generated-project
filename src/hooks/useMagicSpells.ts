import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { DBSpell } from './useSpells';

export function useMagicSpells(magicSchool?: string) {
  const [tricks, setTricks] = useState<DBSpell[]>([]);
  const [spells, setSpells] = useState<DBSpell[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadSpells() {
      try {
        setLoading(true);
        setError(null);

        // Get magic tricks (rank 0 spells)
        const { data: tricksData, error: tricksError } = await supabase
          .from('game_spells')
          .select('*')
          .eq('rank', 0)
          .order('name');

        if (tricksError) throw tricksError;
        setTricks(tricksData || []);

        // Get rank 1 spells (both general and school-specific)
        const { data: spellsData, error: spellsError } = await supabase
          .from('game_spells')
          .select(`
            *,
            magic_schools (
              name
            )
          `)
          .eq('rank', 1)
          .or('school_id.is.null,school_id.eq.' + magicSchool)
          .order('name');

        if (spellsError) throw spellsError;
        setSpells(spellsData || []);

      } catch (err) {
        console.error('Error loading spells:', err);
        setError(err instanceof Error ? err.message : 'Failed to load spells');
      } finally {
        setLoading(false);
      }
    }

    loadSpells();
  }, [magicSchool]);

  return {
    tricks,
    spells,
    loading,
    error
  };
}
