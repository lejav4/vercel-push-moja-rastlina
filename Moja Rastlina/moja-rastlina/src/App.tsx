import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Plus, Trash2, Sprout, Activity as ActivityIcon, TrendingUp, Settings as SettingsIcon, RotateCcw, Check, BarChart3, Zap, Calendar as CalendarIcon } from 'lucide-react';
import Calendar from './components/ui/calendar';
import { Button } from './components/ui/button';
import { Input } from './components/ui/input';
import { Label } from './components/ui/label';
import { AreaChart, Area, XAxis, Tooltip, ResponsiveContainer } from 'recharts';
import './App.css';

// Plant images - using import for proper bundling
import roseL1 from './assets/rose-l1.png';
import roseL2 from './assets/rose-l2.png';
import roseL3 from './assets/rose-l3.png';
import roseFinal from './assets/rose-final.png';
import sunflowerL1 from './assets/sunflower-l1.png';
import sunflowerL2 from './assets/sunflower-l2.png';
import sunflowerL3 from './assets/sunflower-l3.png';
import sunflowerL4 from './assets/sunflower-l4.png';
import sunflowerL5 from './assets/sunflower-l5.png';
import sunflowerFinal from './assets/sunflower-final.png';
import treeL1 from './assets/tree-l1.png';
import treeL2 from './assets/tree-l2.png';
import treeL3 from './assets/tree-l3.png';
import treeL4 from './assets/tree-l4.png';
import treeL5 from './assets/tree-l5.png';
import treeL6 from './assets/tree-l6.png';
import treeL7 from './assets/tree-l7.png';
import treeFinal from './assets/tree-final.png';
import sakuraL1 from './assets/sakura-l1.png';
import sakuraL2 from './assets/sakura-l2.png';
import sakuraL3 from './assets/sakura-l3.png';
import sakuraL4 from './assets/sakura-l4.png';
import sakuraL5 from './assets/sakura-l5.png';
import sakuraL6 from './assets/sakura-l6.png';
import sakuraL7 from './assets/sakura-l7.png';
import sakuraL8 from './assets/sakura-l8.png';
import sakuraL9 from './assets/sakura-l9.png';
import sakuraFinal from './assets/sakura-final.png';
import gardenL1 from './assets/garden-l1.png';
import gardenL2 from './assets/garden-l2.png';
import gardenL3 from './assets/garden-l3.png';
import gardenL4 from './assets/garden-l4.png';
import gardenL5 from './assets/garden-l5.png';
import gardenL6 from './assets/garden-l6.png';
import gardenL7 from './assets/garden-l7.png';
import gardenL8 from './assets/garden-l8.png';
import gardenL9 from './assets/garden-l9.png';
import gardenL10 from './assets/garden-l10.png';
import gardenL11 from './assets/garden-l11.png';
import gardenL12 from './assets/garden-l12.png';
import gardenL13 from './assets/garden-l13.png';
import gardenFinal from './assets/garden-final.png';



type ActivityCategory = 'exercise' | 'mental' | 'social' | 'health' | 'creative';
type ActivityDifficulty = 'easy' | 'medium' | 'hard';

type ActivityType = {
  id: number;
  text: string;
  points: number;
  isCustom: boolean;
  category?: ActivityCategory;
  difficulty?: ActivityDifficulty;
  streak?: number;
};

type PlantType = {
  id: string;
  name: string;
  months: number;
  levels: number;
  emoji: string[];
  final?: string; // optional final celebratory stage (emoji or img:path)
  customName?: string;
};

type ActivityTemplate = {
  id: string;
  name: string;
  description: string;
  activities: Omit<ActivityType, 'id' | 'isCustom'>[];
};

type Goal = {
  id: string;
  name: string;
  target: number;
  current: number;
  period: 'weekly' | 'monthly';
};

type ActivityStreak = {
  activityId: number;
  streak: number;
  lastActivityDate: string;
};

export default function PlantGrowthTracker() {
  const [level, setLevel] = useState(1);
  const [points, setPoints] = useState(0);
  const [lastActiveDate, setLastActiveDate] = useState(new Date().toDateString());
  const [currentDate, setCurrentDate] = useState(new Date().toDateString());
  const [customActivityName, setCustomActivityName] = useState('');
  const [customActivityPoints, setCustomActivityPoints] = useState(1);
  const [showAddActivity, setShowAddActivity] = useState(false);
  const [showPlantMenu, setShowPlantMenu] = useState(false);
  const [selectedPlant, setSelectedPlant] = useState('rose');
  const [completedToday, setCompletedToday] = useState<number[]>([]);
  const [completedPlants, setCompletedPlants] = useState<string[]>([]);
  const [plantCompletions, setPlantCompletions] = useState<Record<string, number>>({});
  type DayActivity = { total: number; items: string[] };
  const [activityHistory, setActivityHistory] = useState<Record<string, DayActivity>>({});
  const [graphView, setGraphView] = useState<'days' | 'weeks' | 'months'>('days');
  const [showCongrats, setShowCongrats] = useState(false);
  const [runPoints, setRunPoints] = useState(0); // skupne točke trenutnega cikla rastline
  const [hasCompletedRun, setHasCompletedRun] = useState(false);
  const [allowDeleteActivities, setAllowDeleteActivities] = useState(true);
  const [showSettingsMenu, setShowSettingsMenu] = useState(false);
  const [todayPoints, setTodayPoints] = useState(0); // točke za današnji dan
  const [lastActivityDate, setLastActivityDate] = useState<string>(''); // zadnji dan z aktivnostjo
  
  // New features state
  const [showConfetti, setShowConfetti] = useState(false);
  const [plantAnimationClass, setPlantAnimationClass] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [activityStreaks, setActivityStreaks] = useState<ActivityStreak[]>([]);
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [enableActivitySuggestions, setEnableActivitySuggestions] = useState(false);
  const plantStageRef = useRef<HTMLDivElement>(null);
  const lastClickRef = useRef<{ id: number | null; timestamp: number }>({ id: null, timestamp: 0 });
  const [customActivityDate, setCustomActivityDate] = useState<string>(() => {
    const d = new Date();
    const iso = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate())).toISOString().slice(0,10);
    return iso; // yyyy-mm-dd
  });
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [errors, setErrors] = useState<{ name?: string; points?: string; date?: string }>({});
  const [dateEditIndex, setDateEditIndex] = useState<number | null>(null);
  const [dateEditValue, setDateEditValue] = useState<string>('');
  const [pendingDates, setPendingDates] = useState<Record<number, string>>(() => {
    try {
      const raw = localStorage.getItem('mr_pending_dates_v1');
      return raw ? JSON.parse(raw) : {};
    } catch { return {}; }
  });
  // Shrani datum po imenu aktivnosti (namesto po indeksu), da se pravilno resetira ob dodajanju nove aktivnosti
  const [pendingDatesByActivity, setPendingDatesByActivity] = useState<Record<string, string>>(() => {
    try {
      const raw = localStorage.getItem('mr_pending_dates_by_activity_v1');
      return raw ? JSON.parse(raw) : {};
    } catch { return {}; }
  });
  const [confirmedByDate, setConfirmedByDate] = useState<Record<string, string[]>>(() => {
    try {
      const raw = localStorage.getItem('mr_confirmed_by_date_v1');
      return raw ? JSON.parse(raw) : {};
    } catch { return {}; }
  });
  // Začasni seznam aktivnosti za današnji dan, ki čakajo na potrditev (ne gre v activityHistory do potrditve)
  const [pendingActivitiesToday, setPendingActivitiesToday] = useState<string[]>([]);

  const STORAGE_ACTIVITIES = 'mr_activities_v1';
  const STORAGE_ACTIVITY_HISTORY = 'mr_activity_history_v1';
  const STORAGE_LAST_ACTIVITY_DATE = 'mr_last_activity_date_v1';
  const STORAGE_SELECTED_PLANT = 'mr_selected_plant_v1';
  const STORAGE_START_DATE = 'mr_start_date_v1';
  const STORAGE_REMOVE_SPECIFIC6_DONE = 'mr_remove_specific6_done_v1';
  const STORAGE_TEMP_SEED_10D_DONE = 'mr_temp_seed_10days_done_v1';
  const STORAGE_APPLIED_TEMPLATES = 'mr_applied_templates_v1';

  const [activities, setActivities] = useState<ActivityType[]>([
    { id: 1, text: '🚶 Sprehod 15min', points: 1, isCustom: false, category: 'exercise', difficulty: 'easy' },
    { id: 2, text: '🚶 Sprehod 30min', points: 2, isCustom: false, category: 'exercise', difficulty: 'medium' },
    { id: 3, text: '🏃 Tek 20min', points: 3, isCustom: false, category: 'exercise', difficulty: 'hard' },
    { id: 4, text: '💪 Vadba doma', points: 2, isCustom: false, category: 'exercise', difficulty: 'medium' },
    { id: 5, text: '🏆 Tekmovanje', points: 3, isCustom: false, category: 'exercise', difficulty: 'hard' },
    { id: 6, text: '🏋️ Trening', points: 3, isCustom: false, category: 'exercise', difficulty: 'hard' },
    { id: 7, text: '🤸 Telovadba', points: 2, isCustom: false, category: 'exercise', difficulty: 'medium' },
    { id: 8, text: '💃 Plesne', points: 2, isCustom: false, category: 'exercise', difficulty: 'medium' },
  ]);

  const activityTemplates: ActivityTemplate[] = [
    {
      id: 'fitness',
      name: '💪 Fitness',
      description: 'Osnovni fitness aktivnosti',
      activities: [
        { text: '🚶 Sprehod 15min', points: 1, category: 'exercise', difficulty: 'easy' },
        { text: '🏃 Tek 20min', points: 3, category: 'exercise', difficulty: 'hard' },
        { text: '💪 Vadba doma', points: 2, category: 'exercise', difficulty: 'medium' },
        { text: '🏋️ Trening', points: 3, category: 'exercise', difficulty: 'hard' },
      ]
    },
    {
      id: 'wellness',
      name: '🧘 Wellness',
      description: 'Mentalno in fizično zdravje',
      activities: [
        { text: '🧠 Meditacija 15min', points: 2, category: 'mental', difficulty: 'medium' },
        { text: '📚 Branje 30min', points: 2, category: 'mental', difficulty: 'easy' },
        { text: '💤 8h spanja', points: 2, category: 'health', difficulty: 'medium' },
        { text: '🥗 Zdrava hrana', points: 1, category: 'health', difficulty: 'easy' },
      ]
    },
    {
      id: 'creative',
      name: '🎨 Kreativnost',
      description: 'Kreativne in umetniške aktivnosti',
      activities: [
        { text: '🎨 Risba/Slikarstvo', points: 2, category: 'creative', difficulty: 'medium' },
        { text: '🎵 Glasba', points: 2, category: 'creative', difficulty: 'medium' },
        { text: '✍️ Pisanje', points: 2, category: 'creative', difficulty: 'medium' },
        { text: '📸 Fotografiranje', points: 1, category: 'creative', difficulty: 'easy' },
      ]
    },
    {
      id: 'social',
      name: '👥 Socialne',
      description: 'Druženje in socialne aktivnosti',
      activities: [
        { text: '👥 Druženje s prijatelji', points: 2, category: 'social', difficulty: 'easy' },
        { text: '📞 Klic družini', points: 1, category: 'social', difficulty: 'easy' },
        { text: '🎉 Organizacija dogodka', points: 3, category: 'social', difficulty: 'hard' },
        { text: '🤝 Prostovoljstvo', points: 3, category: 'social', difficulty: 'hard' },
      ]
    }
  ];

  const [appliedTemplates, setAppliedTemplates] = useState<string[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_APPLIED_TEMPLATES);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_APPLIED_TEMPLATES, JSON.stringify(appliedTemplates));
    } catch {}
  }, [appliedTemplates]);

  // Hydrate activities from localStorage (acts as simple local DB)
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_ACTIVITIES);
      if (raw) {
        const parsed: ActivityType[] = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length) {
          setActivities(parsed);
        }
      } else {
        // seed defaults on first run
        localStorage.setItem(STORAGE_ACTIVITIES, JSON.stringify(activities));
      }
    } catch (e) {
      // ignore corrupt storage
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // One-time removal of specific six activities (IDs 9..14), if present from earlier sessions
  useEffect(() => {
    try {
      const done = localStorage.getItem(STORAGE_REMOVE_SPECIFIC6_DONE);
      if (done) return;
      setActivities(prev => {
        const filtered = prev.filter(a => ![9,10,11,12,13,14].includes(a.id));
        try { localStorage.setItem(STORAGE_ACTIVITIES, JSON.stringify(filtered)); } catch {}
        localStorage.setItem(STORAGE_REMOVE_SPECIFIC6_DONE, '1');
        return filtered;
      });
    } catch {}
  }, []);

  // Migration: ensure default activity '🏆 Tekmovanje' exists if it was removed earlier
  useEffect(() => {
    setActivities(prev => {
      const exists = prev.some(a => a.text === '🏆 Tekmovanje');
      if (exists) return prev;
      const restored = [
        ...prev,
        { id: Date.now(), text: '🏆 Tekmovanje', points: 3, isCustom: false, category: 'exercise' as ActivityCategory, difficulty: 'hard' as ActivityDifficulty }
      ];
      try { localStorage.setItem(STORAGE_ACTIVITIES, JSON.stringify(restored)); } catch {}
      return restored;
    });
  }, []);

  // Hydrate activity history from localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_ACTIVITY_HISTORY);
      if (raw) {
        const parsed: Record<string, DayActivity> = JSON.parse(raw);
        if (parsed && typeof parsed === 'object') {
          setActivityHistory(parsed);
        }
      } else {
        // First run: set start date to today and empty history
        const today = new Date().toDateString();
        localStorage.setItem(STORAGE_ACTIVITY_HISTORY, JSON.stringify({}));
        localStorage.setItem(STORAGE_START_DATE, today);
        setStartDate(new Date(today));
      }
    } catch (e) {
      // ignore corrupt storage
    }
  }, []);

  // Hydrate last activity date from localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_LAST_ACTIVITY_DATE);
      if (raw) {
        setLastActivityDate(raw);
      }
    } catch (e) {
      // ignore corrupt storage
    }
  }, []);

  // Hydrate selected plant from localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_SELECTED_PLANT);
      if (raw) {
        setSelectedPlant(raw);
      }
      const sd = localStorage.getItem(STORAGE_START_DATE);
      if (sd) setStartDate(new Date(sd));
    } catch (e) {
      // ignore corrupt storage
    }
  }, []);

  // Persist activities whenever they change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_ACTIVITIES, JSON.stringify(activities));
    } catch {}
  }, [activities]);

  // Persist activity history whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_ACTIVITY_HISTORY, JSON.stringify(activityHistory));
    } catch {}
  }, [activityHistory]);

  // TEMP: Seed last 10 days with sample running data (Tek) for demo/testing
  useEffect(() => {
    try {
      const already = localStorage.getItem(STORAGE_TEMP_SEED_10D_DONE);
      if (already) return;
      const raw = localStorage.getItem(STORAGE_ACTIVITY_HISTORY) || '{}';
      const hist: Record<string, { total: number; items: string[] }> = JSON.parse(raw) || {};
      for (let i = 9; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const key = d.toDateString();
        // vary points 1..3
        const pts = ((i % 3) + 1);
        hist[key] = { total: pts, items: ['Tek 20min'] };
      }
      localStorage.setItem(STORAGE_ACTIVITY_HISTORY, JSON.stringify(hist));
      setActivityHistory(hist);
      // ensure start date exists
      if (!localStorage.getItem(STORAGE_START_DATE)) {
        localStorage.setItem(STORAGE_START_DATE, new Date().toDateString());
      }
      localStorage.setItem(STORAGE_TEMP_SEED_10D_DONE, '1');
    } catch {}
  }, []);

  // Persist last activity date whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_LAST_ACTIVITY_DATE, lastActivityDate);
    } catch {}
  }, [lastActivityDate]);

  // Persist selected plant whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_SELECTED_PLANT, selectedPlant);
    } catch {}
  }, [selectedPlant]);

  const plants: PlantType[] = [
    // Vrtnica: uporabi uvožene slike za prve 3 nivoje
    { id: 'rose', name: '🌹 Vrtnica', months: 1, levels: 30, emoji: [`img:${roseL1}`, `img:${roseL2}`, `img:${roseL3}`, '🌺', '🌹'], final: `img:${roseFinal}` },
    { id: 'sunflower', name: '🌻 Sončnica', months: 2, levels: 60, emoji: [`img:${sunflowerL1}`, `img:${sunflowerL2}`, `img:${sunflowerL3}`, `img:${sunflowerL4}`, `img:${sunflowerL5}`], final: `img:${sunflowerFinal}` },
    { id: 'tree', name: '🌳 Drevo', months: 3, levels: 90, emoji: [`img:${treeL1}`, `img:${treeL2}`, `img:${treeL3}`, `img:${treeL4}`, `img:${treeL5}`, `img:${treeL6}`, `img:${treeL7}`], final: `img:${treeFinal}` },
    { id: 'sakura', name: '🌸 Češnja', months: 4, levels: 120, emoji: [`img:${sakuraL1}`, `img:${sakuraL2}`, `img:${sakuraL3}`, `img:${sakuraL4}`, `img:${sakuraL5}`, `img:${sakuraL6}`, `img:${sakuraL7}`, `img:${sakuraL8}`, `img:${sakuraL9}`], final: `img:${sakuraFinal}` },
    { id: 'garden', name: '🏡 Cel Vrt', months: 6, levels: 180, emoji: [`img:${gardenL1}`, `img:${gardenL2}`, `img:${gardenL3}`, `img:${gardenL4}`, `img:${gardenL5}`, `img:${gardenL6}`, `img:${gardenL7}`, `img:${gardenL8}`, `img:${gardenL9}`, `img:${gardenL10}`, `img:${gardenL11}`, `img:${gardenL12}`, `img:${gardenL13}`], final: `img:${gardenFinal}` },
  ];

  // Non-null assertion: trenutno izbrana rastlina vedno obstaja
  const currentPlant = plants.find(p => p.id === selectedPlant)!;

  // Zahteve za nivo: 1→5, 2→10, nato stalno 15
  const pointsToNextLevel = level === 1 ? 5 : level === 2 ? 10 : 15;
  const maxRunPoints = currentPlant.months * 30; // npr. Vrtnica: 30
  const progress = (points / pointsToNextLevel) * 100;

  // Preveri nov dan in resetiraj completedToday in pendingActivitiesToday (potrjene hranimo v localStorage po datumih)
  useEffect(() => {
    const today = new Date().toDateString();
    if (today !== currentDate) {
      setCurrentDate(today);
      setCompletedToday([]);
      setPendingActivitiesToday([]); // Resetiraj začasni seznam ob novem dnevu
    }
  }, [currentDate]);

  // Persist helpers
  useEffect(() => {
    try { localStorage.setItem('mr_pending_dates_v1', JSON.stringify(pendingDates)); } catch {}
  }, [pendingDates]);
  useEffect(() => {
    try { localStorage.setItem('mr_confirmed_by_date_v1', JSON.stringify(confirmedByDate)); } catch {}
  }, [confirmedByDate]);
  useEffect(() => {
    try { localStorage.setItem('mr_pending_dates_by_activity_v1', JSON.stringify(pendingDatesByActivity)); } catch {}
  }, [pendingDatesByActivity]);

  // (Removed) test helper for adding points via keyboard

  // Od prvega zagona ne dodajamo demo podatkov — graf se začne z današnjim dnem
  useEffect(() => {
    // no-op: zgodovina ostane prazna, se polni sproti
  }, []);

  // Preveri za neaktivne dneve in odštej točke
  useEffect(() => {
    const today = new Date().toDateString();
    const lastDate = new Date(lastActiveDate);
    const todayDate = new Date(today);
    const diffTime = todayDate.getTime() - lastDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays > 0) {
      const penalty = diffDays;
      const newPoints = Math.max(0, points - penalty);
      if (points !== newPoints) {
        setPoints(newPoints);
      }
    }
  }, [lastActiveDate, points]);

  // Dnevni sistem kazni: vsak dan brez aktivnosti = -1 točka
  useEffect(() => {
    const today = new Date().toDateString();
    const hasActivityToday = activityHistory[today] && activityHistory[today].total > 0;
    
    if (!hasActivityToday && lastActivityDate && lastActivityDate !== today) {
      // Preveri, ali je bil včeraj aktivnost
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toDateString();
      const hadActivityYesterday = activityHistory[yesterdayStr] && activityHistory[yesterdayStr].total > 0;
      
      if (!hadActivityYesterday) {
        // Včeraj ni bilo aktivnosti, odštej točko
        setPoints(prev => Math.max(0, prev - 1));
        setLastActivityDate(today); // Posodobi zadnji aktivni dan
      }
    }
  }, [activityHistory, lastActivityDate]);

  useEffect(() => {
    // napredovanje po nivojih dokler ne končamo
    if (points >= pointsToNextLevel && !hasCompletedRun) {
      const newLevel = level + 1;
      if (newLevel > currentPlant.levels) {
        setLevel(currentPlant.levels);
        setPoints(0);
        // zaključek ob preseženem max levelu: označi končano v unified effectu nižje
      } else {
        setLevel(newLevel);
        setPoints(0);
      }
    }
  }, [points, level, pointsToNextLevel, currentPlant, hasCompletedRun]);

  // Enoten zaključni efekt - sproži se samo enkrat na cikel
  useEffect(() => {
    const reachedMaxPoints = runPoints >= maxRunPoints;
    const reachedMaxLevel = level >= currentPlant.levels;
    if ((reachedMaxPoints || reachedMaxLevel) && !hasCompletedRun) {
      setHasCompletedRun(true);
        if (!completedPlants.includes(selectedPlant)) {
          setCompletedPlants([...completedPlants, selectedPlant]);
        }
      setPlantCompletions(prev => ({ ...prev, [selectedPlant]: (prev[selectedPlant] || 0) + 1 }));
      setShowCongrats(true);
    }
  }, [runPoints, maxRunPoints, level, currentPlant, hasCompletedRun, completedPlants, selectedPlant]);

  // Če dosežemo maksimalni nivo, zaključimo tudi brez dodatnih točk
  useEffect(() => {
    if (level >= currentPlant.levels && !completedPlants.includes(selectedPlant)) {
      setCompletedPlants([...completedPlants, selectedPlant]);
      setPlantCompletions(prev => ({ ...prev, [selectedPlant]: (prev[selectedPlant] || 0) + 1 }));
      setShowCongrats(true);
    }
  }, [level, currentPlant, completedPlants, selectedPlant]);

  // Confetti effect function
  const triggerConfetti = () => {
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 3000);
  };

  // Plant animation functions
  const triggerPlantAnimation = (type: 'grow' | 'level-up' | 'shimmer') => {
    setPlantAnimationClass(type);
    setTimeout(() => setPlantAnimationClass(''), 1000);
  };

  // Activity streak management
  const updateActivityStreak = (activityId: number) => {
    const today = new Date().toDateString();
    const existingStreak = activityStreaks.find(s => s.activityId === activityId);
    
    if (existingStreak) {
      const lastDate = new Date(existingStreak.lastActivityDate);
      const todayDate = new Date(today);
      const diffDays = Math.floor((todayDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (diffDays === 1) {
        // Consecutive day - increment streak
        setActivityStreaks(prev => prev.map(s => 
          s.activityId === activityId 
            ? { ...s, streak: s.streak + 1, lastActivityDate: today }
            : s
        ));
      } else if (diffDays > 1) {
        // Gap in days - reset streak
        setActivityStreaks(prev => prev.map(s => 
          s.activityId === activityId 
            ? { ...s, streak: 1, lastActivityDate: today }
            : s
        ));
      }
    } else {
      // New streak
      setActivityStreaks(prev => [...prev, { activityId, streak: 1, lastActivityDate: today }]);
    }
  };

  // Get activity streak
  const getActivityStreak = (activityId: number): number => {
    const streak = activityStreaks.find(s => s.activityId === activityId);
    return streak ? streak.streak : 0;
  };

  // Apply activity template
  const applyTemplate = (templateId: string) => {
    const template = activityTemplates.find(t => t.id === templateId);
    if (!template) return;
    if (appliedTemplates.includes(templateId)) return; // already applied
    
    const newActivities = template.activities.map((activity, index) => ({
      ...activity,
      id: Date.now() + index,
      isCustom: true
    }));
    
    setActivities(prev => [...prev, ...newActivities]);
    setSelectedTemplate(templateId);
    setAppliedTemplates(prev => [...prev, templateId]);
  };

  // Quick add activity
  const quickAddActivity = () => {
    const quickActivities = [
      { text: '🚶 Sprehod', points: 1, category: 'exercise' as ActivityCategory, difficulty: 'easy' as ActivityDifficulty },
      { text: '📚 Branje', points: 2, category: 'mental' as ActivityCategory, difficulty: 'easy' as ActivityDifficulty },
      { text: '💪 Vadba', points: 2, category: 'exercise' as ActivityCategory, difficulty: 'medium' as ActivityDifficulty },
    ];
    
    const randomActivity = quickActivities[Math.floor(Math.random() * quickActivities.length)];
    const newActivity: ActivityType = {
      id: Date.now(),
      text: randomActivity.text,
      points: randomActivity.points,
      isCustom: true,
      category: randomActivity.category,
      difficulty: randomActivity.difficulty
    };
    
    setActivities(prev => [...prev, newActivity]);
    setShowQuickAdd(false);
  };

  // Resetiraj današnje vnose (kot da danes še nisi nič dodal)
  const resetTodayEntries = () => {
    const today = new Date().toDateString();
    const updated = { ...activityHistory };
    updated[today] = { total: 0, items: [] };
    setActivityHistory(updated);
    setTodayPoints(0);
    setCompletedToday([]);
    setPendingActivitiesToday([]); // Počisti tudi začasni seznam
    setConfirmedByDate(prev => {
      const next = { ...prev } as Record<string, string[]>;
      delete next[today];
      return next;
    });
  };

  // Resetiraj VSE vnose aktivnosti (pobriše vso zgodovino aktivnosti in vse točke)
  const resetAllActivityEntries = () => {
    if (!window.confirm('Ali ste prepričani, da želite izbrisati vso zgodovino aktivnosti in vse pridobljene točke? To dejanje ni mogoče razveljaviti.')) {
      return;
    }
    // Počisti vse localStorage podatke za aktivnosti
    try {
      localStorage.removeItem(STORAGE_ACTIVITY_HISTORY);
      localStorage.removeItem('mr_pending_dates_v1');
      localStorage.removeItem('mr_pending_dates_by_activity_v1');
      localStorage.removeItem('mr_confirmed_by_date_v1');
      localStorage.removeItem(STORAGE_LAST_ACTIVITY_DATE);
      localStorage.removeItem(STORAGE_START_DATE);
      localStorage.removeItem(STORAGE_TEMP_SEED_10D_DONE);
    } catch {}
    // Resetiraj vse state za aktivnosti
    setActivityHistory({});
    setTodayPoints(0);
    setCompletedToday([]);
    setPendingActivitiesToday([]);
    setPendingDates({});
    setPendingDatesByActivity({});
    setConfirmedByDate({});
    setLastActivityDate('');
    setStartDate(null);
    // Resetiraj vse točke in napredek
    setLevel(1);
    setPoints(0);
    setRunPoints(0);
    setHasCompletedRun(false);
    setCompletedPlants([]);
    setPlantCompletions({});
    setLastActiveDate(new Date().toDateString());
    // Zapri nastavitve po resetiranju
    setShowSettingsMenu(false);
    alert('Vsi vnosi aktivnosti in vse pridobljene točke so bili izbrisani.');
  };

  // URL helper: ?resetToday=1 ponastavi današnje vnose ob osvežitvi strani
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      if (params.get('resetToday') === '1') {
        resetTodayEntries();
        const cleanUrl = window.location.origin + window.location.pathname;
        window.history.replaceState({}, '', cleanUrl);
      }
      // Resetiraj vse vnose ob osvežitvi, če je parameter ?resetAll=1
      if (params.get('resetAll') === '1') {
        resetAllActivityEntries();
        const cleanUrl = window.location.origin + window.location.pathname;
        window.history.replaceState({}, '', cleanUrl);
      }
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Get display name for plant
  const getPlantDisplayName = (plant: PlantType): string => {
    return plant.name;
  };

  const completeActivity = (id: number, activityPoints: number) => {
    if (hasCompletedRun || level >= currentPlant.levels || runPoints >= maxRunPoints) return;
    
    // Prepreči večkratno dodajanje iste aktivnosti naenkrat (v 500ms)
    const now = Date.now();
    if (lastClickRef.current.id === id && now - lastClickRef.current.timestamp < 500) {
      return; // Prepreči večkratno dodajanje naenkrat
    }
    lastClickRef.current = { id, timestamp: now };
    
    const today = new Date().toDateString();

    // Ne dodaj točk takoj – samo zabeleži postavko za današnji dan
    const activity = activities.find(a => a.id === id);
    if (!activity) return;
    
    const cleanName = activity.text.replace(/^\S+\s/, '');
    
    // DODAJ aktivnost le v začasen seznam (pendingActivitiesToday), NE v activityHistory
    // Aktivnost se doda v activityHistory šele ob potrditvi v confirmTodayActivity
    setPendingActivitiesToday(prev => [...prev, cleanName]);
    
    // Resetiraj datum na današnji dan za novo dodano aktivnost
    // (če je bila aktivnost že v seznamu z drugim datumom, se resetira na današnji dan)
    const todayIso = new Date().toISOString().slice(0, 10);
    setPendingDatesByActivity(prev => {
      const updated = { ...prev };
      // Poišči vse aktivnosti z istim imenom in resetiraj njihov datum na današnji dan
      // Vendar za to specifično aktivnost nastavimo današnji dan
      updated[cleanName] = todayIso;
      return updated;
    });
    
    // Reset ref po 500ms, da dovolimo ponovno dodajanje zaporedoma
    setTimeout(() => {
      if (lastClickRef.current.id === id && Date.now() - lastClickRef.current.timestamp >= 500) {
        lastClickRef.current = { id: null, timestamp: 0 };
      }
    }, 500);

    // animacija rasti kot feedback na izbiro
    triggerPlantAnimation('grow');
  };

  const addCustomActivity = () => {
    if (!customActivityName.trim()) return;
      const newActivity: ActivityType = {
        id: Date.now(),
        text: customActivityName,
        points: customActivityPoints,
        isCustom: true,
      };
      setActivities([...activities, newActivity]);
      setCustomActivityName('');
      setCustomActivityPoints(1);
      // Log to selected date in history
      logActivityForDate(newActivity.text, newActivity.points, customActivityDate);
      setShowAddActivity(false);
  };

  const validateAndSubmit = () => {
    const nextErrors: { name?: string; points?: string; date?: string } = {};
    if (!customActivityName.trim()) nextErrors.name = 'Ime je obvezno.';
    if (!customActivityPoints || customActivityPoints < 1 || customActivityPoints > 3) nextErrors.points = 'Točke morajo biti med 1 in 3.';
    if (!customActivityDate) nextErrors.date = 'Datum je obvezen.';
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length === 0) {
      addCustomActivity();
    }
  };

  const logActivityForDate = (name: string, pts: number, isoDate: string) => {
    try {
      const keyDate = new Date(isoDate + 'T00:00:00Z');
      const key = keyDate.toDateString();
      const prev = activityHistory[key] || { total: 0, items: [] };
      const cleanName = name.replace(/^\S+\s/, '');
      const updated = {
        ...activityHistory,
        [key]: { total: prev.total + pts, items: [...prev.items, cleanName] }
      };
      setActivityHistory(updated);
      // Only update today's counters if logging for today
      const todayKey = new Date().toDateString();
      if (key === todayKey) {
        setTodayPoints(prev => prev + pts);
        setLastActiveDate(todayKey);
      }
    } catch {}
  };

  // (No cross-device sync by design) — data persists per device via localStorage

  const deleteActivity = (id: number) => {
    const toDelete = activities.find(a => a.id === id);
    setActivities(activities.filter(a => a.id !== id));
    setCompletedToday(completedToday.filter(cid => cid !== id));
    // Also remove any pending instance for today to avoid duplicate-block on re-adding later
    if (toDelete) {
      const todayKey = new Date().toDateString();
      const todayHistory = activityHistory[todayKey];
      const cleanName = toDelete.text.replace(/^\S+\s/, '');
      if (todayHistory && todayHistory.items.includes(cleanName)) {
        setActivityHistory({
          ...activityHistory,
          [todayKey]: {
            total: todayHistory.total,
            items: todayHistory.items.filter(item => item !== cleanName)
          }
        });
        // If it was marked confirmed-by-name for today, clear that mark too
        if ((confirmedByDate[todayKey] || []).includes(cleanName)) {
          setConfirmedByDate(prev => ({
            ...prev,
            [todayKey]: (prev[todayKey] || []).filter(n => n !== cleanName)
          }));
        }
      }
    }
  };

  // Uredi aktivnost za današnji dan
  const editTodayActivity = (oldActivityName: string, newActivityId: number) => {
    const today = new Date().toDateString();
    const todayHistory = activityHistory[today];
    if (!todayHistory) return;

    const newActivity = activities.find(a => a.id === newActivityId);
    if (!newActivity) return;

    // Odstrani staro aktivnost
    const updatedItems = todayHistory.items.filter(item => item !== oldActivityName);
    const oldActivity = activities.find(a => a.text.replace(/^\S+\s/, '') === oldActivityName);
    const oldPoints = oldActivity ? oldActivity.points : 0;
    
    // Dodaj novo aktivnost
    const newActivityName = newActivity.text.replace(/^\S+\s/, '');
    const newTotal = todayHistory.total - oldPoints + newActivity.points;
    
    setActivityHistory({
      ...activityHistory,
      [today]: {
        total: newTotal,
        items: [...updatedItems, newActivityName]
      }
    });

    // Posodobi točke
    const pointDiff = newActivity.points - oldPoints;
    setPoints(prev => prev + pointDiff);
    setRunPoints(prev => Math.min(maxRunPoints, prev + pointDiff));
    setTodayPoints(prev => prev + pointDiff);
  };

  // Odstrani aktivnost za današnji dan (iz začasnega seznama, ker še ni bila potrjena)
  const removeTodayActivity = (activityName: string) => {
    // Odstrani aktivnost iz začasnega seznama (pendingActivitiesToday)
    // Aktivnost še ni bila potrjena, zato ni v activityHistory
    setPendingActivitiesToday(prev => prev.filter(item => item !== activityName));
    // Odstrani tudi datum iz pendingDatesByActivity
    setPendingDatesByActivity(prev => {
      const updated = { ...prev };
      delete updated[activityName];
      return updated;
    });
  };

  // Spremeni datum današnje aktivnosti na drug dan
  const changeTodayActivityDate = (activityName: string, targetIsoDate: string) => {
    const todayKey = new Date().toDateString();
    const act = activities.find(a => a.text.replace(/^\S+\s/, '') === activityName);
    const isConfirmed = act ? completedToday.includes(act.id) : false;

    if (isConfirmed) {
      // Aktivnost je že potrjena - premakni v activityHistory
      const todayHistory = activityHistory[todayKey];
      if (!todayHistory) return;

      const pointsForAct = act?.points || 0;
      const updatedTodayItems = todayHistory.items.filter(i => i !== activityName);

      // compute target key (use UTC midnight for stability)
      const d = new Date(targetIsoDate + 'T00:00:00Z');
      const targetKey = d.toDateString();
      const prevTarget = activityHistory[targetKey] || { total: 0, items: [] };

      // move item; adjust totals only if activity was potrjena (confirmed)
      const newTodayTotal = Math.max(0, todayHistory.total - pointsForAct);
      const newTargetTotal = prevTarget.total + pointsForAct;

      const updated: Record<string, { total: number; items: string[] }> = {
        ...activityHistory,
        [todayKey]: { total: newTodayTotal, items: updatedTodayItems },
        [targetKey]: { total: newTargetTotal, items: [...prevTarget.items, activityName] }
      };

      setActivityHistory(updated);

      // če se premakne proč od danes, tudi todayPoints zmanjša
      if (targetKey !== todayKey) {
        setTodayPoints(prev => Math.max(0, prev - pointsForAct));
      }
    } else {
      // Aktivnost še ni potrjena - samo posodobi pendingDatesByActivity
      // (aktivnost ostane v pendingActivitiesToday, vendar bo ob potrditvi uporabljena targetIsoDate)
      setPendingDatesByActivity(prev => ({ ...prev, [activityName]: targetIsoDate }));
    }
  };

  // Potrdi aktivnost za današnji dan: dodaj v activityHistory in odstrani iz začasnega seznama
  const confirmTodayActivity = (activityName: string, index: number) => {
    const today = new Date().toDateString();

    const activity = activities.find(a => a.text.replace(/^\S+\s/, '') === activityName);
    if (!activity) return;

    // Če je že potrjeno, ne dodajaj še enkrat
    if (completedToday.includes(activity.id)) return;

    // Uporabi pending datum za to postavko; sicer danes
    // Uporabi pendingDatesByActivity za pravilno uporabo datuma po imenu aktivnosti
    const targetIso = pendingDatesByActivity[activityName] || pendingDates[index] || null;
    const targetKey = targetIso ? new Date(targetIso + 'T00:00:00Z').toDateString() : today;

    // Dodaj točke šele ob potrditvi
    const add = Math.min(activity.points, Math.max(0, maxRunPoints - runPoints));
    const newPoints = points + add;
    setPoints(newPoints);
    setRunPoints(rp => Math.min(maxRunPoints, rp + add));
    if (targetKey === today) {
      setTodayPoints(prev => prev + activity.points);
      setLastActiveDate(today);
    }

    // posodobi streak
    updateActivityStreak(activity.id);

    // animacije
    if (newPoints >= pointsToNextLevel) {
      triggerPlantAnimation('level-up');
      triggerConfetti();
    } else {
      triggerPlantAnimation('grow');
    }

    // Zabeleži točke v pravilen dan in dodaj aktivnost v activityHistory (za tooltip grafa)
    // To je prvič, ko se aktivnost doda v activityHistory - šele ob potrditvi!
    const prevTarget = activityHistory[targetKey] || { total: 0, items: [] };
    const cleanName = activity.text.replace(/^\S+\s/, '');
    const updated: Record<string, { total: number; items: string[] }> = { ...activityHistory };
    // Allow multiple instances; we'll aggregate duplicates only in the tooltip display
    updated[targetKey] = { total: prevTarget.total + activity.points, items: [...prevTarget.items, cleanName] };
    setActivityHistory(updated);

    // Odstrani aktivnost iz začasnega seznama (pendingActivitiesToday) - aktivnost je sedaj potrjena
    setPendingActivitiesToday(prev => prev.filter(item => item !== activityName));

    // označi kot potrjeno
    // Če je aktivnost potrjena za današnji dan, jo dodaj v completedToday
    if (targetKey === today) {
      setCompletedToday(prev => [...prev, activity.id]);
    }
    // Dodaj aktivnost v confirmedByDate za pravilen datum (targetKey, ne danes!)
    // POMEMBNO: Aktivnost se mora dodati SAMO za izbrani datum (targetKey)
    setConfirmedByDate(prev => {
      const updated = { ...prev };
      // Dodaj aktivnost za pravilen datum
      updated[targetKey] = [ ...(updated[targetKey] || []), activityName ];
      // Če je aktivnost dodana za pretekli datum, jo ODSTRANI iz danes (če je tam)
      if (targetKey !== today && updated[today] && updated[today].includes(activityName)) {
        updated[today] = updated[today].filter(item => item !== activityName);
        // Če je seznam prazen, ga odstrani
        if (updated[today].length === 0) {
          delete updated[today];
        }
      }
      return updated;
    });

    // počisti pending izbirnik
    if (dateEditIndex === index) { setDateEditIndex(null); setDateEditValue(''); }
    
    // Odstrani datum iz pendingDatesByActivity po potrditvi (aktivnost je sedaj v activityHistory)
    setPendingDatesByActivity(prev => {
      const updated = { ...prev };
      delete updated[activityName];
      return updated;
    });
  };

  const resetPlantCompletion = (plantId: string) => {
    // Ponastavi števec in ponovno zaženi cikel izbrane rastline
    setPlantCompletions(prev => ({ ...prev, [plantId]: 0 }));
    restartPlantCycle(plantId);
  };

  const restartPlantCycle = (plantId: string) => {
    setSelectedPlant(plantId);
    setLevel(1);
    setPoints(0);
    setRunPoints(0);
    setHasCompletedRun(false);
    setShowCongrats(false);
    setCompletedPlants(prev => prev.filter(p => p !== plantId));
    setShowPlantMenu(false);
  };

  // (Removed) addTestPoint helper

  const changePlant = (plantId: string) => {
    setSelectedPlant(plantId);
    setLevel(1);
    setPoints(0);
    setRunPoints(0);
    setHasCompletedRun(false);
    setShowCongrats(false);
    // start fresh cycle for this plant but keep completion history
    setCompletedPlants(prev => prev.filter(p => p !== plantId));
    setShowPlantMenu(false);
  };

  const getPlantStage = (): React.ReactNode => {
    const stages = currentPlant.emoji;

    // If plant is completed, show the final celebratory stage if provided
    if (level > currentPlant.levels || completedPlants.includes(selectedPlant) || runPoints >= maxRunPoints) {
      const fin = currentPlant.final ?? stages[stages.length - 1];
      if (typeof fin === 'string' && fin.startsWith('img:')) {
        const src = fin.replace('img:', '');
        return <img src={src} alt="plant-final" className={`plant-img ${plantAnimationClass === 'shimmer' ? 'shimmer' : ''}`} />;
      }
      return fin as unknown as React.ReactNode;
    }

    // If the first N stages are explicit images, map level 1..N directly to those images
    const imageStagesCount = stages.filter(s => typeof s === 'string' && (s as string).startsWith('img:')).length;
    if (level <= imageStagesCount) {
      const directStage = stages[level - 1];
      if (typeof directStage === 'string' && directStage.startsWith('img:')) {
        const src = directStage.replace('img:', '');
        return <img src={src} alt="plant-stage" className={`plant-img ${plantAnimationClass === 'shimmer' ? 'shimmer' : ''}`} />;
      }
      return directStage as unknown as React.ReactNode;
    }

    // Distribute remaining levels across remaining stages
    const remainingStages = stages.slice(imageStagesCount);
    const remainingStageCount = remainingStages.length;
    const levelsRemaining = Math.max(1, currentPlant.levels - imageStagesCount);
    const idxWithin = Math.min(
      Math.floor((level - imageStagesCount - 1) / Math.max(1, levelsRemaining / remainingStageCount)),
      remainingStageCount - 1
    );
    const stage = remainingStages[idxWithin];
    if (typeof stage === 'string' && stage.startsWith('img:')) {
      const src = stage.replace('img:', '');
      return <img src={src} alt="plant-stage" className={`plant-img ${plantAnimationClass === 'shimmer' ? 'shimmer' : ''}`} />;
    }
    return stage as unknown as React.ReactNode;
  };

  const getPlantSize = () => Math.min(200, 80 + level * 2);

  // Helper function to get the current plant stage image source
  const getCurrentPlantStageSrc = (): string | null => {
    const stages = currentPlant.emoji;

    // If plant is completed, show the final celebratory stage if provided
    if (level > currentPlant.levels || completedPlants.includes(selectedPlant) || runPoints >= maxRunPoints) {
      const fin = currentPlant.final ?? stages[stages.length - 1];
      if (typeof fin === 'string' && fin.startsWith('img:')) {
        return fin.replace('img:', '');
      }
      return null;
    }

    // If the first N stages are explicit images, map level 1..N directly to those images
    const imageStagesCount = stages.filter(s => typeof s === 'string' && (s as string).startsWith('img:')).length;
    if (level <= imageStagesCount) {
      const directStage = stages[level - 1];
      if (typeof directStage === 'string' && directStage.startsWith('img:')) {
        return directStage.replace('img:', '');
      }
      return null;
    }

    // Distribute remaining levels across remaining stages
    const remainingStages = stages.slice(imageStagesCount);
    const remainingStageCount = remainingStages.length;
    const levelsRemaining = Math.max(1, currentPlant.levels - imageStagesCount);
    const idxWithin = Math.min(
      Math.floor((level - imageStagesCount - 1) / Math.max(1, levelsRemaining / remainingStageCount)),
      remainingStageCount - 1
    );
    const stage = remainingStages[idxWithin];
    if (typeof stage === 'string' && stage.startsWith('img:')) {
      return stage.replace('img:', '');
    }
    return null;
  };

  // Vrni seznam današnjih postavk, ki še čakajo na potrditev
  // Uporabi useMemo za memoizacijo in zagotovitev, da se izračuna z najnovejšim state-om
  const pendingItemsForToday = useMemo(() => {
    // Vrnimo aktivnosti iz pendingActivitiesToday (ki čakajo na potrditev)
    // Aktivnosti iz activityHistory se prikažejo le v tooltip-u grafa po potrditvi
    return pendingActivitiesToday;
  }, [pendingActivitiesToday]);

  // Helper function to render plant emoji/image for selection modal
  const renderPlantEmoji = (plant: PlantType): React.ReactNode => {
    // For plants with all image stages, show the emoji from the plant name instead
    if (plant.id === 'sunflower' || plant.id === 'rose' || plant.id === 'tree' || plant.id === 'sakura' || plant.id === 'garden') {
      // Extract emoji from plant name (e.g., "🌻 Sončnica" -> "🌻")
      const nameEmoji = plant.name.split(' ')[0];
      return <span style={{ fontSize: 24 }}>{nameEmoji}</span>;
    }
    
    const lastStage = plant.emoji[plant.emoji.length - 1];
    if (typeof lastStage === 'string' && lastStage.startsWith('img:')) {
      const src = lastStage.replace('img:', '');
      return <img src={src} alt="plant" style={{ width: 32, height: 32, objectFit: 'contain' }} />;
    }
    return <span style={{ fontSize: 24 }}>{lastStage as unknown as string}</span>;
  };

  // Graf funkcije
  const getLast30Days = () => {
    const days: string[] = [];
    const today = new Date();
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      days.push(date.toDateString());
    }
    return days;
  };

  const getLast12Weeks = () => {
    const weeks: { start: Date; end: Date; label: string }[] = [];
    const today = new Date();
    for (let i = 11; i >= 0; i--) {
      const startDate = new Date(today);
      startDate.setDate(today.getDate() - i * 7 - 6);
      const endDate = new Date(today);
      endDate.setDate(today.getDate() - i * 7);
      weeks.push({ start: startDate, end: endDate, label: `T${12 - i}` });
    }
    return weeks;
  };

  const getLast12Months = () => {
    const months: { date: Date; label: string }[] = [];
    const today = new Date();
    for (let i = 11; i >= 0; i--) {
      const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
      months.push({
        date,
        label: date.toLocaleDateString('sl-SI', { month: 'short' }),
      });
    }
    return months;
  };

  // Build datasets for charts
  // Helpers to compute first activity date
  const getFirstActivityDate = (): Date | null => {
    const keys = Object.keys(activityHistory);
    if (!keys.length) return null;
    const dates = keys
      .map(k => new Date(k))
      .sort((a,b) => a.getTime() - b.getTime());
    return dates[0] || null;
  };

  const getDailyData = () => {
    const today = new Date();
    const first = getFirstActivityDate();
    if (!first) return [];
    const days: string[] = [];
    // Logika: do 15. v mesecu prikazuj 1..15; po 15. prikazuj cel mesec.
    // Če je prva aktivnost po 15. dnevu v mesecu, pokaži cel mesec takoj.
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    const cutoff = new Date(today.getFullYear(), today.getMonth(), 15);
    const showFullMonth = today.getDate() > 15 || first.getDate() > 15 || first < monthStart;
    const rangeEnd = showFullMonth ? monthEnd : cutoff;
    for (let d = new Date(monthStart); d <= rangeEnd; d.setDate(d.getDate() + 1)) {
      days.push(new Date(d).toDateString());
    }
    return days.map(d => ({
      label: new Date(d).getDate().toString(), // Samo številka dneva (1, 2, 3...)
      value: (activityHistory[d]?.total) || 0,
      date: new Date(d),
    }));
  };
  const getWeeklyData = () => {
    const today = new Date();
    const first = getFirstActivityDate();
    if (!first) return [];
    const weeks: { start: Date; end: Date; label: string; weekIndex: number }[] = [];
    // celoten trenutni mesec (tedni poravnani na ponedeljek)
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const start = new Date(monthStart);
    start.setDate(start.getDate() - ((start.getDay() + 6) % 7));
    const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    const end = new Date(monthEnd);
    end.setDate(end.getDate() + (6 - ((end.getDay() + 6) % 7)));
    let idx = 1;
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 7)) {
      const wStart = new Date(d);
      const wEnd = new Date(d);
      wEnd.setDate(wEnd.getDate() + 6);
      weeks.push({ start: wStart, end: wEnd, label: `${idx}. teden`, weekIndex: idx });
      idx += 1;
    }
    return weeks.map(w => {
      let sum = 0;
      Object.keys(activityHistory).forEach(key => {
        const date = new Date(key);
        if (date >= w.start && date <= w.end) {
          sum += activityHistory[key]?.total || 0;
        }
      });
      return { label: w.label, value: sum, start: w.start, end: w.end, weekIndex: w.weekIndex };
    });
  };
  const getMonthlyData = () => {
    const today = new Date();
    const first = getFirstActivityDate();
    if (!first) return [];
    const months: { month: number; year: number; label: string }[] = [];
    // začni z mesecem začetka; najprej prikaži 6 mesecev; po 6 mesecih prikaži 12 mesecev
    const startMonth = new Date(first.getFullYear(), first.getMonth(), 1);
    const monthsSinceStart = (today.getFullYear() - startMonth.getFullYear()) * 12 + (today.getMonth() - startMonth.getMonth());
    const showCount = monthsSinceStart >= 6 ? 12 : 6;
    for (let i = 0; i < showCount; i++) {
      const d = new Date(startMonth.getFullYear(), startMonth.getMonth() + i, 1);
      months.push({ month: d.getMonth(), year: d.getFullYear(), label: d.toLocaleDateString('sl-SI', { month: 'short' }) });
    }
    return months.map((m) => {
      let sum = 0;
      Object.keys(activityHistory).forEach(key => {
        const date = new Date(key);
        if (date.getMonth() === m.month && date.getFullYear() === m.year) {
          sum += activityHistory[key]?.total || 0;
        }
      });
      return { label: m.label, value: sum, monthDate: new Date(m.year, m.month, 1) };
    });
  };

  const isCompleted = hasCompletedRun || runPoints >= maxRunPoints || completedPlants.includes(selectedPlant);

  return (
    <div className="app-bg">
      <div className="container">
        {/* Header */}
        <header className="header">
          <div className="logo">🌱 Moja Rastlina</div>
        </header>

        {/* Plant Card */}
        <section className="card">
          <div className="card-top">
            <div className="plant-title">{getPlantDisplayName(currentPlant)}</div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn-change" onClick={() => setShowSettingsMenu(true)}>
                <SettingsIcon size={16} className="icon-left" />
                <span className="btn-text">Nastavitve</span>
              </button>
              <button className="btn-change" onClick={() => setShowPlantMenu(true)}>
                <Sprout size={16} className="icon-left" />
                Spremeni
              </button>
              {/* (Sync controls removed by request) */}
            </div>
          </div>

          <div className={`plant-stage ${plantAnimationClass}`} style={{ fontSize: getPlantSize() }} ref={plantStageRef}>
            {getPlantStage()}
          </div>
          <h2 className="level">{isCompleted ? 'Končano' : `Nivo ${level}`}</h2>

          <div className="progress-head">
            <span className="progress-title">{isCompleted ? 'Rastlina je dokončana' : 'Napredek do naslednjega nivoja'}</span>
            <span className="progress-count" style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
              {isCompleted ? '✓' : `${points} / ${pointsToNextLevel}`}
            </span>
          </div>
          <div className="progress">
            <div className="progress-bar" style={{ width: `${isCompleted ? 100 : Math.min(100, Math.max(0, progress))}%` }} />
          </div>

          <div className="stats">
            <div className="stat stat-green">
              <ActivityIcon size={28} className="stat-icon stat-icon-green" />
              <div className="stat-value">{runPoints}</div>
              <div className="stat-label">Točke</div>
            </div>
            <div className="stat stat-blue">
              <TrendingUp size={28} className="stat-icon stat-icon-blue" />
              <div className="stat-value">{level}</div>
              <div className="stat-label">Nivo</div>
            </div>
          </div>
        </section>

        {/* Activities */}
        <section className="card">
          <div className="section-title">
            <span>📋 Današnje aktivnosti</span>
            <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn-round" onClick={() => setShowAddActivity(v => !v)} title="Dodaj">
              <Plus size={18} />
            </button>
              <button className="btn-round" onClick={() => setShowAnalytics(!showAnalytics)} title="Analitika">
                <BarChart3 size={18} />
              </button>
            </div>
          </div>

          {/* (removed month badge) */}

          {/* Activity Templates (optional) */}
          {enableActivitySuggestions && (
          <div className="template-grid">
              {activityTemplates.map(template => {
                const isApplied = appliedTemplates.includes(template.id);
                return (
              <div 
                key={template.id} 
                    className={`template-card ${selectedTemplate === template.id ? 'active' : ''} ${isApplied ? 'disabled' : ''}`}
                    onClick={() => !isApplied && applyTemplate(template.id)}
                    title={isApplied ? 'Že dodano' : 'Dodaj aktivnosti'}
                    aria-disabled={isApplied}
                    style={{ opacity: isApplied ? 0.6 : 1, cursor: isApplied ? 'not-allowed' : 'pointer' }}
              >
                <div className="template-title">{template.name}</div>
                <div className="template-description">{template.description}</div>
                    <div className="template-activities">{template.activities.length} aktivnosti {isApplied ? '(dodano)' : ''}</div>
              </div>
                );
              })}
          </div>
          )}

          {showAddActivity && (
            <div className="form-inline">
              <input
                className="input input-narrow"
                placeholder="Ime aktivnosti"
                value={customActivityName}
                onChange={(e) => { setCustomActivityName(e.target.value); if (errors.name) setErrors({ ...errors, name: undefined }); }}
              />
              <div className="points-row">
                <input
                  type="number"
                  className="points-input"
                  min={1}
                  max={3}
                  value={customActivityPoints}
                  onChange={(e) => {
                    const val = Math.max(1, Math.min(3, Number(e.target.value)));
                    setCustomActivityPoints(val);
                    if (errors.points) setErrors({ ...errors, points: undefined });
                  }}
                />
                <span className="points-hint">točk (max 3)</span>
              </div>
              <button className="btn-primary" onClick={validateAndSubmit}>Dodaj</button>
            </div>
          )}

          <div className="grid">
            {activities.map(a => {
              return (
                <div key={a.id} className="activity-row">
                  <button
                    className="activity"
                    onClick={() => completeActivity(a.id, a.points)}
                  >
                    <div className="activity-content">
                    <div className="activity-text">{a.text}</div>
                    </div>
                    <div className="activity-points">+{a.points}</div>
                  </button>
                  {allowDeleteActivities && (
                    <button className="btn-icon" aria-label="Izbriši" onClick={(e) => { e.stopPropagation(); deleteActivity(a.id); }}>
                      <Trash2 size={18} />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* Today's completed activities */}
        {pendingItemsForToday.length > 0 && (
          <section className="card">
            <div className="section-title">
              <span>✅ Dokončane danes ({todayPoints} točk)</span>
            </div>
            <div className="grid">
              {pendingItemsForToday.map((item, index) => {
                const act = activities.find(a => a.text.replace(/^\S+\s/, '') === item);
                const isConfirmed = act ? completedToday.includes(act.id) : false;
                return (
                  <div key={index} className="activity-row">
                    <div className="activity completed">
                      <div className="activity-text">{item}</div>
                      <div className="activity-points">
                        +{act?.points || 0}
                      </div>
                    </div>
                    <div className="activity-actions">
                      <button 
                        className={`btn-icon btn-icon-small btn-calendar ${dateEditIndex === index && dateEditValue ? 'active' : ''}`}
                        title="Spremeni datum"
                        onClick={() => {
                          setDateEditIndex(index);
                          // Uporabi pendingDatesByActivity za pravilno uporabo datuma po imenu aktivnosti
                          const existing = pendingDatesByActivity[item] || pendingDates[index];
                          if (existing) {
                            setDateEditValue(existing);
                          } else {
                            const d = new Date();
                            const iso = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate())).toISOString().slice(0,10);
                            setDateEditValue(iso);
                            setPendingDatesByActivity(prev => ({ ...prev, [item]: iso }));
                          }
                        }}
                      >
                        <CalendarIcon size={16} />
                      </button>
                      {dateEditIndex === index && (
                        <div className="calendar-pop">
                          <Calendar
                            selected={(pendingDatesByActivity[item] || pendingDates[index] || dateEditValue) ? new Date((pendingDatesByActivity[item] || pendingDates[index] || dateEditValue) + 'T00:00:00Z') : undefined}
                            onSelect={(d) => {
                              if (!d) {
                                // Če je uporabnik kliknil že izbran datum (deselection), samo zapri koledar
                                setDateEditIndex(null);
                                return;
                              }
                              const iso = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate())).toISOString().slice(0,10);
                              setDateEditValue(iso);
                              // Shrani datum po imenu aktivnosti
                              setPendingDatesByActivity(prev => ({ ...prev, [item]: iso }));
                              // zapri koledar po izbiri datuma
                              setDateEditIndex(null);
                            }}
                          />
                        </div>
                      )}
                      {/* date badge removed per request */}
                      <button 
                        className="btn-icon btn-icon-small btn-confirm" 
                        onClick={() => confirmTodayActivity(item, index)}
                        title={isConfirmed ? "Potrjeno" : "Potrdi"}
                        disabled={isConfirmed}
                        aria-disabled={isConfirmed}
                      >
                        <Check size={16} />
                      </button>
                      <button 
                        className="btn-icon btn-icon-small" 
                        onClick={() => removeTodayActivity(item)}
                        title="Odstrani"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Analytics Section */}
        {showAnalytics && (
          <section className="card">
            <div className="section-title">
              <span>📊 Analitika in cilji</span>
              <button className="btn-round" onClick={() => setShowAnalytics(false)} title="Zapri">
                ✕
              </button>
            </div>

            {/* Goals Section removed on request */}

            {/* Activity Heatmap */}
            <div style={{ marginTop: '16px' }}>
              <h3 style={{ margin: '0 0 12px 0', color: '#166534' }}>📅 Aktivnost zadnjih tednov</h3>
              <div className="heatmap-container">
                <div className="heatmap">
                  {Array.from({ length: 365 }, (_, i) => {
                    const date = new Date();
                    date.setDate(date.getDate() - (364 - i));
                    const dateStr = date.toDateString();
                    const activity = activityHistory[dateStr];
                    const level = activity ? Math.min(5, Math.ceil(activity.total / 2)) : 0;
                    return (
                      <div 
                        key={i} 
                        className={`heatmap-day level-${level}`}
                        title={`${date.toLocaleDateString('sl-SI')}: ${activity?.total || 0} točk`}
                      ></div>
                    );
                  })}
                </div>
              </div>
              <div style={{ display: 'flex', gap: '16px', marginTop: '8px', fontSize: '12px', color: '#6b7280' }}>
                <span>Manj</span>
                <div style={{ display: 'flex', gap: '2px' }}>
                  <div className="heatmap-day level-0"></div>
                  <div className="heatmap-day level-1"></div>
                  <div className="heatmap-day level-2"></div>
                  <div className="heatmap-day level-3"></div>
                  <div className="heatmap-day level-4"></div>
                  <div className="heatmap-day level-5"></div>
                </div>
                <span>Več</span>
              </div>
            </div>

            {/* Enhanced Stats */}
            {(() => {
              const today = new Date();
              const currentMonth = today.getMonth();
              const currentYear = today.getFullYear();
              const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
              const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;
              
              // Calculate stats for current month
              const currentMonthData = Object.keys(activityHistory).filter(key => {
                const date = new Date(key);
                return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
              });
              const currentMonthDays = currentMonthData.length;
              
              // Calculate stats for last month
              const lastMonthData = Object.keys(activityHistory).filter(key => {
                const date = new Date(key);
                return date.getMonth() === lastMonth && date.getFullYear() === lastMonthYear;
              });
              const lastMonthDays = lastMonthData.length;
              
              // Calculate month-over-month change
              const monthChange = lastMonthDays > 0 
                ? Math.round(((currentMonthDays - lastMonthDays) / lastMonthDays) * 100) 
                : currentMonthDays > 0 ? 100 : 0;
              
              // Calculate average per day
              const totalPoints = Object.values(activityHistory).reduce((sum, d) => sum + d.total, 0);
              const totalDays = Object.keys(activityHistory).length;
              const avgPerDay = totalDays > 0 ? Math.round((totalPoints / totalDays) * 10) / 10 : 0;
              
              // Calculate last month average for comparison
              const lastMonthPoints = lastMonthData.reduce((sum, key) => {
                return sum + (activityHistory[key]?.total || 0);
              }, 0);
              const lastMonthAvg = lastMonthDays > 0 ? Math.round((lastMonthPoints / lastMonthDays) * 10) / 10 : 0;
              const avgChange = lastMonthAvg > 0 ? (Math.round((avgPerDay - lastMonthAvg) * 10) / 10) : avgPerDay;
              
              return (
            <div className="stats-grid">
              <div className="stat-card">
                    <div className="stat-card-value">{totalDays}</div>
                <div className="stat-card-label">Aktivni dnevi</div>
                    {monthChange !== 0 && (
                      <div className={`stat-card-trend ${monthChange > 0 ? 'trend-up' : 'trend-down'}`}>
                        {monthChange > 0 ? '+' : ''}{monthChange}% ta mesec
                      </div>
                    )}
              </div>
              <div className="stat-card">
                <div className="stat-card-value">{Math.max(...Object.values(activityHistory).map(d => d.total), 0)}</div>
                <div className="stat-card-label">Najboljši dan</div>
                <div className="stat-card-trend trend-neutral">Točke</div>
              </div>
              <div className="stat-card">
                    <div className="stat-card-value">{avgPerDay}</div>
                <div className="stat-card-label">Povprečje/dan</div>
                    {avgChange !== 0 && lastMonthDays > 0 && (
                      <div className={`stat-card-trend ${avgChange > 0 ? 'trend-up' : 'trend-down'}`}>
                        {avgChange > 0 ? '+' : ''}{avgChange.toFixed(1)}
                      </div>
                    )}
              </div>
              <div className="stat-card">
                <div className="stat-card-value">{activityStreaks.reduce((max, s) => Math.max(max, s.streak), 0)}</div>
                <div className="stat-card-label">Najdaljši niz</div>
                    {activityStreaks.length > 0 && (
                <div className="stat-card-trend trend-up">🔥</div>
                    )}
              </div>
            </div>
              );
            })()}
          </section>
        )}

        {/* Confetti Effect */}
        {showConfetti && (
          <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 1000 }}>
            {Array.from({ length: 50 }, (_, i) => (
              <div
                key={i}
                className="confetti"
                style={{
                  left: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 2}s`,
                  transform: `rotate(${Math.random() * 360}deg)`,
                }}
              />
            ))}
          </div>
        )}

        {/* Quick Add Button */}
        <button 
          className="quick-add-btn" 
          onClick={() => setShowQuickAdd(true)}
          title="Hitro dodaj aktivnost"
        >
          <Zap size={24} />
        </button>

        {/* Quick Add Modal */}
        {showQuickAdd && (
          <div className="modal-backdrop" onClick={() => setShowQuickAdd(false)}>
            <div className="modal modal-square" onClick={e => e.stopPropagation()}>
              <div className="section-title">
                <span>⚡ Hitro dodaj</span>
                <button className="btn-close" onClick={() => setShowQuickAdd(false)}>✕</button>
              </div>
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <p style={{ marginBottom: '20px' }}>Dodaj naključno aktivnost za hitro napredovanje</p>
                <button className="btn-primary" onClick={quickAddActivity}>
                  Dodaj aktivnost
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Congrats modal */}
        {showCongrats && (
          <div className="modal-backdrop" onClick={() => setShowCongrats(false)}>
            <div className="modal modal-square" onClick={e => e.stopPropagation()}>
              <div className="section-title"><span>Čestitke! 🌟</span></div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
                <div>
                  {(() => {
                    const currentStageSrc = getCurrentPlantStageSrc();
                    if (currentStageSrc) {
                      return <img src={currentStageSrc} alt="final" className="plant-img" />;
                    }
                    // Fallback to emoji if no image
                    const plant = plants.find(p => p.id === selectedPlant);
                    if (!plant) return null;
                    const fin = plant.final ?? plant.emoji[plant.emoji.length - 1];
                    return <span style={{ fontSize: 64 }}>{fin as unknown as string}</span>;
                  })()}
                </div>
                <p style={{ textAlign: 'center' }}>Uspešno si dokončal/a rastlino {getPlantDisplayName(plants.find(p => p.id === selectedPlant)!)}. Dokončanja: {plantCompletions[selectedPlant] || 1}</p>
              </div>
              <div style={{ display: 'flex', gap: 12, marginTop: 12 }}>
                <button className="btn-primary btn-40" onClick={() => setShowCongrats(false)}>Zapri</button>
                <button className="btn-change btn-40" onClick={() => {
                  setShowCongrats(false);
                  setLevel(1);
                  setPoints(0);
                  setRunPoints(0);
                  setCompletedPlants(prev => prev.filter(p => p !== selectedPlant));
                }}>Začni znova</button>
              </div>
            </div>
          </div>
        )}

        {/* Warning */}
        <div className="banner">⚠️ Vsak dan brez aktivnosti = -1 točka</div>

        {/* Activity History */}
        <section className="card card-chart">
          <div className="section-title">
            <span>📊 Aktivnost</span>
            <div className="tabs">
              <button className={`tab ${graphView === 'days' ? 'active' : ''}`} onClick={() => setGraphView('days')}>Dnevi</button>
              <button className={`tab ${graphView === 'weeks' ? 'active' : ''}`} onClick={() => setGraphView('weeks')}>Tedni</button>
              <button className={`tab ${graphView === 'months' ? 'active' : ''}`} onClick={() => setGraphView('months')}>Meseci</button>
            </div>
          </div>

          {/* (removed start label and range filter UI) */}

          <div style={{ width: '100%', height: 140 }} role="img" aria-label="Graf točk skozi čas">
            {(() => {
              const data = graphView === 'days' ? getDailyData() : graphView === 'weeks' ? getWeeklyData() : getMonthlyData();
              if (!data.length) return <div style={{display:'flex',alignItems:'center',justifyContent:'center',height:'100%',color:'#6b7280'}}>Ni podatkov za prikaz</div>;
              return (
            <ResponsiveContainer>
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorArea" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.6}/>
                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0.05}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="label" tickLine={false} axisLine={false} />
                <Tooltip cursor={{ stroke: '#a7f3d0', strokeWidth: 2 }} content={({label, payload}) => {
                  const p = payload && payload[0] && payload[0].payload;
                  if (!p) return null;
                  if (graphView === 'days') {
                    const key = p.date && p.date.toDateString && p.date.toDateString();
                    const todayKey = new Date().toDateString();
                    // Tooltip naj prikaže SAMO potrjene postavke za danes; za ostale dni
                    // so v activityHistory že samo potrjene postavke.
                    const baseItems = key === todayKey
                      ? (confirmedByDate[todayKey] || [])
                      : ((key && activityHistory[key]?.items) || []);
                    // Izračunaj skupne točke in prikaži aktivnosti z vejico
                    let totalPoints = 0;
                    const activityCounts: Record<string, number> = {};
                    (baseItems as string[]).forEach((name: string) => {
                      const activity = activities.find(a => a.text.replace(/^\S+\s/, '') === name);
                      const points = activity?.points || 0;
                      totalPoints += points;
                      activityCounts[name] = (activityCounts[name] || 0) + 1;
                    });
                    
                    // Prikaži aktivnosti z vejico (brez števila, ker seštevamo točke)
                    const activityList = Object.keys(activityCounts);
                    
                    return (
                      <div className="recharts-default-tooltip">
                        <div className="recharts-tooltip-label">{p.date.toLocaleDateString('sl-SI', { day: 'numeric', month: 'long' })}</div>
                        {baseItems.length > 0 && (
                          <div className="recharts-tooltip-item">{totalPoints}t - {activityList.join(', ')}</div>
                        )}
                      </div>
                    );
                  }
                  if (graphView === 'weeks') {
                    const start = p.start as Date; const end = p.end as Date;
                    const range = `${start.getDate()}. ${start.toLocaleDateString('sl-SI', { month: 'numeric' })}. — ${end.getDate()}. ${end.toLocaleDateString('sl-SI', { month: 'numeric' })}.`;
                    return (
                      <div className="recharts-default-tooltip">
                        <div className="recharts-tooltip-label">{range}</div>
                        <div className="recharts-tooltip-item">Točke: {p.value}</div>
                      </div>
                    );
                  }
                  // months
                  return (
                    <div className="recharts-default-tooltip">
                      <div className="recharts-tooltip-label">{p.monthDate.toLocaleDateString('sl-SI', { month: 'long', year: 'numeric' })}</div>
                      <div className="recharts-tooltip-item">Točke: {p.value}</div>
                    </div>
                  );
                }} />
                <Area type="monotone" dataKey="value" stroke="#22c55e" strokeWidth={2} fillOpacity={1} fill="url(#colorArea)" />
              </AreaChart>
            </ResponsiveContainer>
              );
            })()}
          </div>

          {/* chart caption removed; moved into XAxis labels */}

          <div className="legend">
            <span className="legend-item legend-active">Aktivno</span>
            <span className="legend-item">Neaktivno</span>
          </div>
        </section>

        {/* Plants summary table (enhanced with shadcn/ui style) */}
        <section className="card">
          <div className="section-title"><span>📋 Povzetek rastlin</span></div>
          <div className="plants-summary" style={{ 
            border: '1px solid #e5e7eb', 
            borderRadius: '8px', 
            overflow: 'auto',
            backgroundColor: '#ffffff'
          }}>
            <table className="plants-summary-table" style={{ 
              width: '100%', 
              borderCollapse: 'collapse', 
              fontSize: '14px'
            }}>
            <thead>
                <tr style={{ 
                  backgroundColor: '#f9fafb',
                  borderBottom: '1px solid #e5e7eb'
                }}>
                  <th style={{ 
                    padding: '12px 16px', 
                    textAlign: 'left', 
                    color: '#374151',
                    fontWeight: '500',
                    fontSize: '12px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em'
                  }}>Rastlina</th>
                  <th style={{ 
                    padding: '12px 16px', 
                    textAlign: 'left', 
                    color: '#374151',
                    fontWeight: '500',
                    fontSize: '12px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em'
                  }}>Nivoji</th>
                  <th style={{ 
                    padding: '12px 16px', 
                    textAlign: 'left', 
                    color: '#374151',
                    fontWeight: '500',
                    fontSize: '12px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em'
                  }}>Trajanje</th>
                  <th style={{ 
                    padding: '12px 16px', 
                    textAlign: 'left', 
                    color: '#374151',
                    fontWeight: '500',
                    fontSize: '12px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em'
                  }}>Točke</th>
              </tr>
            </thead>
            <tbody>
                {plants.slice(0, 5).map((p, idx) => {
                // Ciljne skupne točke: 30 za en mesec, sorazmerno z meseci
                const totalPoints = p.months * 30;
                // Izračun nivojev iz skupnih točk (1:5, 2:10, 3+:15)
                let computedLevels = 0;
                if (totalPoints > 0) {
                  if (totalPoints <= 5) computedLevels = 1;
                  else if (totalPoints <= 15) computedLevels = 2;
                  else computedLevels = 2 + Math.ceil((totalPoints - 15) / 15);
                }
                  // Ocena trajanja: meseci -> tedni (pribl. 4–5 tednov/mesec)
                  const minWeeks = p.months * 4;
                  const maxWeeks = p.months * 5;
                  const durationLabel = minWeeks < 8
                    ? `≈ ${minWeeks}–${maxWeeks} tednov`
                    : `≈ ${Math.round(minWeeks/4)}–${Math.round(maxWeeks/4)} mesecev`;
                  const isSelected = p.id === selectedPlant;
                  const completions = plantCompletions[p.id] || 0;
                return (
                    <tr 
                      key={p.id}
                      style={{ 
                        borderBottom: idx < plants.slice(0, 5).length - 1 ? '1px solid #f3f4f6' : 'none',
                        backgroundColor: isSelected ? '#f0fdf4' : 'transparent',
                        transition: 'background-color 0.15s ease'
                      }}
                      onMouseEnter={(e) => {
                        if (!isSelected) e.currentTarget.style.backgroundColor = '#f9fafb';
                      }}
                      onMouseLeave={(e) => {
                        if (!isSelected) e.currentTarget.style.backgroundColor = 'transparent';
                      }}
                    >
                      <td style={{ 
                        padding: '14px 16px',
                        color: '#111827',
                        fontWeight: isSelected ? '600' : '400'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '18px' }}>{p.name.split(' ')[0]}</span>
                          <span>{p.name.replace(/^\S+\s/, '')}</span>
                          {isSelected && (
                            <span style={{
                              fontSize: '11px',
                              padding: '2px 6px',
                              backgroundColor: '#22c55e',
                              color: 'white',
                              borderRadius: '4px',
                              fontWeight: '500'
                            }}>Aktivno</span>
                          )}
                          {completions > 0 && (
                            <span style={{ 
                              color: '#7c3aed',
                              fontSize: '12px',
                              fontWeight: '500'
                            }}>
                              {'★'.repeat(Math.min(completions, 5))}
                            </span>
                          )}
                        </div>
                      </td>
                      <td style={{ 
                        padding: '14px 16px',
                        color: '#6b7280'
                      }}>
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          padding: '4px 8px',
                          backgroundColor: '#f3f4f6',
                          borderRadius: '4px',
                          fontWeight: '500',
                          fontSize: '13px'
                        }}>
                          {computedLevels}
                        </span>
                      </td>
                      <td style={{ 
                        padding: '14px 16px',
                        color: '#6b7280'
                      }}>
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          padding: '4px 8px',
                          backgroundColor: '#eef2ff',
                          color: '#3730a3',
                          borderRadius: '4px',
                          fontWeight: '600',
                          fontSize: '13px'
                        }}>
                          {durationLabel}
                        </span>
                      </td>
                      <td style={{ 
                        padding: '14px 16px',
                        color: '#6b7280'
                      }}>
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          padding: '4px 8px',
                          backgroundColor: '#ecfdf5',
                          color: '#166534',
                          borderRadius: '4px',
                          fontWeight: '600',
                          fontSize: '13px'
                        }}>
                          {totalPoints}
                        </span>
                      </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          </div>
        </section>

        {/* Congrats Modal */}
        {showCongrats && (
          <div className="modal-backdrop" onClick={() => setShowCongrats(false)}>
            <div className="modal modal-square" onClick={e => e.stopPropagation()}>
              <div className="section-title" style={{ justifyContent: 'space-between' }}>
                <span>Čestitke! 🌟</span>
                <button type="button" className="btn-close" onClick={() => setShowCongrats(false)}>✕</button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
                <div>
                  {(() => {
                    const currentStageSrc = getCurrentPlantStageSrc();
                    if (currentStageSrc) {
                      return <img src={currentStageSrc} alt="final" className="plant-img" />;
                    }
                    // Fallback to emoji if no image
                    const plant = plants.find(p => p.id === selectedPlant);
                    if (!plant) return null;
                    const fin = plant.final ?? plant.emoji[plant.emoji.length - 1];
                    return <span style={{ fontSize: 64 }}>{fin as unknown as string}</span>;
                  })()}
                </div>
                <p style={{ textAlign: 'center' }}>Uspešno si dokončal/a svojo {plantCompletions[selectedPlant] || 1} {getPlantDisplayName(currentPlant)}.</p>
              </div>
              <div style={{ display: 'flex', gap: 12, marginTop: 12, justifyContent: 'center' }}>
                <button type="button" className="btn-change btn-40" onClick={() => {
                  setShowCongrats(false);
                  setLevel(1);
                  setPoints(0);
                  setRunPoints(0);
                  setHasCompletedRun(false);
                  setCompletedPlants(prev => prev.filter(p => p !== selectedPlant));
                }}>Začni znova</button>
                <button type="button" className="btn-change btn-40" onClick={() => {
                  setShowCongrats(false);
                  setShowPlantMenu(true);
                }}>Izberi drugo rastlino</button>
              </div>
            </div>
          </div>
        )}

        {/* Add Activity Modal removed in favor of inline form */}

        {/* Plant Select Modal */}
        {showPlantMenu && (
          <div className="modal-backdrop" onClick={() => setShowPlantMenu(false)}>
            <div className="modal" onClick={e => e.stopPropagation()}>
              <div className="section-title"><span>Izberi rastlino</span></div>
              <div className="plant-list">
                {plants.map((p) => (
                  <button
                    key={p.id}
                    className={`plant-item ${selectedPlant === p.id ? 'active' : ''}`}
                    onClick={() => changePlant(p.id)}
                  >
                    <div className="plant-item-left">
                      <span className="plant-emoji">{renderPlantEmoji(p)}</span>
                      <div>
                        <div className="plant-name">{getPlantDisplayName(p)}</div>
                        <div className="plant-sub">{p.months} mese{p.months === 1 ? 'c' : 'ca'} aktivnosti <span style={{ color: '#7c3aed' }}>• {Array((plantCompletions[p.id] || 0)).fill('★').join('')}</span></div>
                      </div>
                    </div>
                    <button
                      type="button"
                      className="btn-change btn-40"
                      onClick={(e) => { e.stopPropagation(); resetPlantCompletion(p.id); }}
                      title="Reset in začni znova"
                    >
                      <RotateCcw size={16} className="icon-left" />
                      <span className="btn-text">Reset</span>
                    </button>
                  </button>
                ))}
              </div>
              <div className="hint">💡 Sprememba rastline resetira napredek</div>
            </div>
          </div>
        )}

        {/* Settings Modal */}
        {showSettingsMenu && (
          <div className="modal-backdrop" onClick={() => setShowSettingsMenu(false)}>
            <div className="modal" onClick={e => e.stopPropagation()}>
              <div className="section-title" style={{ justifyContent: 'space-between' }}>
                <span>Nastavitve</span>
                <button className="btn-close" onClick={() => setShowSettingsMenu(false)}>✕</button>
              </div>
              <div className="settings-row" style={{ marginBottom: 12, justifyContent:'space-between' }}>
                <label htmlFor="toggle-del">Dovoli brisanje aktivnosti</label>
                <label className="toggle">
                  <input id="toggle-del" type="checkbox" checked={allowDeleteActivities} onChange={(e) => setAllowDeleteActivities(e.target.checked)} />
                  <span className="slider" />
                </label>
              </div>
              <div className="settings-row" style={{ marginBottom: 12, justifyContent:'space-between' }}>
                <label htmlFor="toggle-suggest">Predlogi aktivnosti (templates)</label>
                <label className="toggle">
                  <input id="toggle-suggest" type="checkbox" checked={enableActivitySuggestions} onChange={(e) => setEnableActivitySuggestions(e.target.checked)} />
                  <span className="slider" />
                </label>
              </div>
              <div style={{ marginTop: 24, paddingTop: 24, borderTop: '1px solid #e5e7eb' }}>
                <button 
                  className="btn-primary" 
                  onClick={resetAllActivityEntries}
                  style={{ width: '100%' }}
                >
                  Resetiraj vse vnose aktivnosti
                </button>
                <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '8px', textAlign: 'center' }}>
                  Izbriše vso zgodovino aktivnosti, grafe in vse pridobljene točke
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}