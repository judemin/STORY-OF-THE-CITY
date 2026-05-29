import { supabase } from './supabase.js';

function adjDate(offsetDays = 0) {
  const d = new Date(Date.now() - 6 * 3600 * 1000 - offsetDays * 86400 * 1000);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export async function saveDailyFocus(userId, totalSecs) {
  const { error } = await supabase
    .from('daily_focus')
    .upsert(
      { user_id: userId, date: adjDate(), total_secs: totalSecs, updated_at: new Date().toISOString() },
      { onConflict: 'user_id,date' }
    );
  if (error) console.warn('[db] saveDailyFocus:', error.message);
}

export async function loadTodayFocus(userId) {
  const { data, error } = await supabase
    .from('daily_focus')
    .select('total_secs')
    .eq('user_id', userId)
    .eq('date', adjDate())
    .maybeSingle();
  if (error) { console.warn('[db] loadTodayFocus:', error.message); return 0; }
  return data?.total_secs ?? 0;
}

export async function getWeeklyStats(userId) {
  const dates = Array.from({ length: 7 }, (_, i) => adjDate(6 - i));
  const { data, error } = await supabase
    .from('daily_focus')
    .select('date, total_secs')
    .eq('user_id', userId)
    .in('date', dates);
  if (error) { console.warn('[db] getWeeklyStats:', error.message); return []; }
  return dates.map(date => ({
    date,
    total_secs: data?.find(r => r.date === date)?.total_secs ?? 0,
  }));
}

export async function getMonthlyStats(userId, year, month) {
  // month: 1-indexed
  const from = `${year}-${String(month).padStart(2, '0')}-01`;
  const lastDay = new Date(year, month, 0).getDate();
  const to   = `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;

  const { data, error } = await supabase
    .from('daily_focus')
    .select('date, total_secs')
    .eq('user_id', userId)
    .gte('date', from)
    .lte('date', to);
  if (error) { console.warn('[db] getMonthlyStats:', error.message); return []; }
  return data || [];
}
