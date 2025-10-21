import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Sprout, Activity as ActivityIcon, TrendingUp, ArrowRight, Settings as SettingsIcon, RotateCcw, Check } from 'lucide-react';
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

type ActivityType = {
  id: number;
  text: string;
  points: number;
  isCustom: boolean;
};

type PlantType = {
  id: string;
  name: string;
  months: number;
  levels: number;
  emoji: string[];
  final?: string; // optional final celebratory stage (emoji or img:path)
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

  const STORAGE_ACTIVITIES = 'mr_activities_v1';
  const STORAGE_ACTIVITY_HISTORY = 'mr_activity_history_v1';
  const STORAGE_LAST_ACTIVITY_DATE = 'mr_last_activity_date_v1';
  const STORAGE_SELECTED_PLANT = 'mr_selected_plant_v1';

  const [activities, setActivities] = useState<ActivityType[]>([
    { id: 1, text: '🚶 Sprehod 15min', points: 1, isCustom: false },
    { id: 2, text: '🚶 Sprehod 30min', points: 2, isCustom: false },
    { id: 3, text: '🏃 Tek 20min', points: 3, isCustom: false },
    { id: 4, text: '💪 Vadba doma', points: 2, isCustom: false },
    { id: 5, text: '🏆 Tekmovanje', points: 3, isCustom: false },
    { id: 6, text: '🏋️ Trening', points: 3, isCustom: false },
    { id: 7, text: '🤸 Telovadba', points: 2, isCustom: false },
    { id: 8, text: '💃 Plesne', points: 2, isCustom: false },
  ]);

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

  // Hydrate activity history from localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_ACTIVITY_HISTORY);
      if (raw) {
        const parsed: Record<string, DayActivity> = JSON.parse(raw);
        if (parsed && typeof parsed === 'object') {
          setActivityHistory(parsed);
        }
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
    { id: 'tree', name: '🌳 Drevo', months: 3, levels: 90, emoji: ['🌱', '🌿', '🪴', '🌲', '🌳'], final: '🌳' },
    { id: 'sakura', name: '🌸 Češnja', months: 4, levels: 120, emoji: ['🌱', '🌿', '🪴', '🌺', '🌸'], final: '🌸' },
    { id: 'garden', name: '🏡 Cel Vrt', months: 6, levels: 180, emoji: ['🌱', '🌿', '🪴', '🌳', '🏡'], final: '🏡' },
  ];

  // Non-null assertion: trenutno izbrana rastlina vedno obstaja
  const currentPlant = plants.find(p => p.id === selectedPlant)!;

  // Zahteve za nivo: 1→5, 2→10, nato stalno 15
  const pointsToNextLevel = level === 1 ? 5 : level === 2 ? 10 : 15;
  const maxRunPoints = currentPlant.months * 30; // npr. Vrtnica: 30
  const progress = (points / pointsToNextLevel) * 100;

  // Preveri nov dan in resetiraj completedToday
  useEffect(() => {
    const today = new Date().toDateString();
    if (today !== currentDate) {
      setCurrentDate(today);
      setCompletedToday([]);
    }
  }, [currentDate]);

  // Test helper: allow ArrowRight key to add a point
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') {
        addTestPoint();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [points]);

  // Inicialni podatki: ponedeljek 13. oktober 2025 (telovadba), torek 14. oktober 2025 (sprehod 15min)
  useEffect(() => {
    if (Object.keys(activityHistory).length === 0) {
      const mon = new Date(2025, 9, 13).toDateString(); // months 0-based, 9 = October
      const tue = new Date(2025, 9, 14).toDateString();
      const wed = new Date(2025, 9, 15).toDateString();
      const fri = new Date(2025, 9, 17).toDateString(); // 17. okt: sprehod 15 min (1)
      const sat = new Date(2025, 9, 18).toDateString(); // 18. okt: tekmovanje (3)
      const sun = new Date(2025, 9, 19).toDateString(); // 19. okt: sprehod 30 min (2)
      setActivityHistory({
        [mon]: { total: 2, items: ['Telovadba'] },
        [tue]: { total: 1, items: ['Sprehod 15min'] },
        [wed]: { total: 3, items: ['Trening'] },
        [fri]: { total: 1, items: ['Sprehod 15min'] },
        [sat]: { total: 3, items: ['Tekmovanje'] },
        [sun]: { total: 2, items: ['Sprehod 30min'] },
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  const completeActivity = (id: number, activityPoints: number) => {
    if (hasCompletedRun || level >= currentPlant.levels || runPoints >= maxRunPoints) return;
    const add = Math.min(activityPoints, Math.max(0, maxRunPoints - runPoints));
    setPoints(points + add);
    setRunPoints(rp => Math.min(maxRunPoints, rp + add));
    const today = new Date().toDateString();
    setLastActiveDate(today);
    setTodayPoints(prev => prev + activityPoints); // Dodaj točke za današnji dan

    const activity = activities.find(a => a.id === id);
    const prev = activityHistory[today] || { total: 0, items: [] };
    setActivityHistory({
      ...activityHistory,
      [today]: { total: prev.total + activityPoints, items: [...prev.items, activity ? activity.text.replace(/^\S+\s/, '') : 'Aktivnost'] },
    });
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
      setShowAddActivity(false);
  };

  // (No cross-device sync by design) — data persists per device via localStorage

  const deleteActivity = (id: number) => {
    setActivities(activities.filter(a => a.id !== id));
    setCompletedToday(completedToday.filter(cid => cid !== id));
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

  // Odstrani aktivnost za današnji dan
  const removeTodayActivity = (activityName: string) => {
    const today = new Date().toDateString();
    const todayHistory = activityHistory[today];
    if (!todayHistory) return;

    const activity = activities.find(a => a.text.replace(/^\S+\s/, '') === activityName);
    if (!activity) return;

    const updatedItems = todayHistory.items.filter(item => item !== activityName);
    const newTotal = todayHistory.total - activity.points;
    
    setActivityHistory({
      ...activityHistory,
      [today]: {
        total: newTotal,
        items: updatedItems
      }
    });

    // Odštej točke
    setPoints(prev => Math.max(0, prev - activity.points));
    setRunPoints(prev => Math.max(0, prev - activity.points));
    setTodayPoints(prev => Math.max(0, prev - activity.points));
  };

  // Potrdi aktivnost za današnji dan (dodaj v completedToday)
  const confirmTodayActivity = (activityName: string) => {
    const activity = activities.find(a => a.text.replace(/^\S+\s/, '') === activityName);
    if (!activity) return;
    
    setCompletedToday(prev => [...prev, activity.id]);
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

  const addTestPoint = () => {
    if (hasCompletedRun || level >= currentPlant.levels || completedPlants.includes(selectedPlant) || runPoints >= maxRunPoints) return;
    const today = new Date().toDateString();
    setPoints(p => Math.min(pointsToNextLevel, p + 1));
    setRunPoints(rp => Math.min(maxRunPoints, rp + 1));
    setLastActiveDate(today);
  };

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
        return <img src={src} alt="plant-final" className="plant-img" />;
      }
      return fin as unknown as React.ReactNode;
    }

    // If the first N stages are explicit images, map level 1..N directly to those images
    const imageStagesCount = stages.filter(s => typeof s === 'string' && (s as string).startsWith('img:')).length;
    if (level <= imageStagesCount) {
      const directStage = stages[level - 1];
      if (typeof directStage === 'string' && directStage.startsWith('img:')) {
        const src = directStage.replace('img:', '');
        return <img src={src} alt="plant-stage" className="plant-img" />;
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
      return <img src={src} alt="plant-stage" className="plant-img" />;
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

  // Helper function to render plant emoji/image for selection modal
  const renderPlantEmoji = (plant: PlantType): React.ReactNode => {
    // For plants with all image stages, show the emoji from the plant name instead
    if (plant.id === 'sunflower' || plant.id === 'rose') {
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
  const getDailyData = () => {
    // Show full current month (e.g. October: 1–31)
    const today = new Date();
    const first = new Date(today.getFullYear(), today.getMonth(), 1);
    const last = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    const days: string[] = [];
    for (let d = new Date(first); d <= last; d.setDate(d.getDate() + 1)) {
      days.push(new Date(d).toDateString());
    }
    return days.map(d => ({
      label: new Date(d).getDate().toString(),
      value: (activityHistory[d]?.total) || 0,
      items: activityHistory[d]?.items || [],
      isToday: new Date(d).toDateString() === new Date().toDateString(),
      date: new Date(d),
    }));
  };
  const getWeeklyData = () => {
    // 5 tednov, prvi: 19. sep – 5. okt
    const weeksBase: { start: Date; end: Date; label: string }[] = [
      { start: new Date(2025, 8, 29), end: new Date(2025, 9, 5), label: '29. sep – 5. okt' },
      { start: new Date(2025, 9, 6), end: new Date(2025, 9, 12), label: '6. okt – 12. okt' },
      { start: new Date(2025, 9, 13), end: new Date(2025, 9, 19), label: '13. okt – 19. okt' },
      { start: new Date(2025, 9, 20), end: new Date(2025, 9, 26), label: '20. okt – 26. okt' },
      { start: new Date(2025, 9, 27), end: new Date(2025, 10, 2), label: '27. okt – 2. nov' },
    ];
    const weeks = weeksBase.map((w) => ({ ...w, label: w.label }));

    return weeks.map(w => {
      let sum = 0;
      const items: string[] = [];
      Object.keys(activityHistory).forEach(key => {
        const date = new Date(key);
        if (date >= w.start && date <= w.end) {
          sum += activityHistory[key]?.total || 0;
          items.push(...(activityHistory[key]?.items || []));
        }
      });
      return { label: w.label, value: sum, items };
    });
  };
  const getMonthlyData = () => {
    // All months starting from October 2025 (inclusive), for 12 months
    const start = new Date(2025, 9, 1); // October = 9 (0-based)
    const months: { month: number; year: number; label: string }[] = [];
    for (let i = 0; i < 12; i++) {
      const d = new Date(start.getFullYear(), start.getMonth() + i, 1);
      months.push({ month: d.getMonth(), year: d.getFullYear(), label: d.toLocaleDateString('sl-SI', { month: 'short' }) });
    }
    return months.map((m) => {
      let sum = 0;
      const items: string[] = [];
      Object.keys(activityHistory).forEach(key => {
        const date = new Date(key);
        if (date.getMonth() === m.month && date.getFullYear() === m.year) {
          sum += activityHistory[key]?.total || 0;
          items.push(...(activityHistory[key]?.items || []));
        }
      });
      return { label: m.label, value: sum, items, monthDate: new Date(m.year, m.month, 1) };
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
            <div className="plant-title">{currentPlant.name}</div>
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

          <div className="plant-stage" style={{ fontSize: getPlantSize() }}>
            {getPlantStage()}
          </div>
          <h2 className="level">{isCompleted ? 'Končano' : `Nivo ${level}`}</h2>

          <div className="progress-head">
            <span className="progress-title">{isCompleted ? 'Rastlina je dokončana' : 'Napredek do naslednjega nivoja'}</span>
            <span className="progress-count" style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
              {isCompleted ? '✓' : `${points} / ${pointsToNextLevel}`}
              {!isCompleted && (
                <button className="btn-test" onClick={addTestPoint} title="Dodaj točko (→)">
                  <ArrowRight size={16} />
                </button>
              )}
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
            <button className="btn-round" onClick={() => setShowAddActivity(v => !v)} title="Dodaj">
              <Plus size={18} />
            </button>
          </div>

          {showAddActivity && (
            <div className="form-inline">
              <input
                className="input input-narrow"
                placeholder="Ime aktivnosti"
                value={customActivityName}
                onChange={(e) => setCustomActivityName(e.target.value)}
              />
              <div className="points-row">
                <input
                  type="number"
                  className="points-input"
                  min={1}
                  max={3}
                  value={customActivityPoints}
                  onChange={(e) => setCustomActivityPoints(Math.max(1, Math.min(3, Number(e.target.value))))}
                />
                <span className="points-hint">točk (max 3)</span>
              </div>
              <button className="btn-primary" onClick={addCustomActivity}>Dodaj</button>
            </div>
          )}

          <div className="grid">
            {activities.map(a => (
                <div key={a.id} className="activity-row">
                  <button
                    className="activity"
                    onClick={() => completeActivity(a.id, a.points)}
                  >
                    <div className="activity-text">{a.text}</div>
                    <div className="activity-points">+{a.points}</div>
                  </button>
                  {allowDeleteActivities && (
                    <button className="btn-icon" aria-label="Izbriši" onClick={(e) => { e.stopPropagation(); deleteActivity(a.id); }}>
                      <Trash2 size={18} />
                    </button>
                  )}
                </div>
              ))}
          </div>
        </section>

        {/* Today's completed activities */}
        {activityHistory[new Date().toDateString()] && activityHistory[new Date().toDateString()].items.length > 0 && (
          <section className="card">
            <div className="section-title">
              <span>✅ Dokončane danes ({todayPoints} točk)</span>
            </div>
            <div className="grid">
              {activityHistory[new Date().toDateString()].items.map((item, index) => (
                <div key={index} className="activity-row">
                  <div className="activity completed">
                    <div className="activity-text">{item}</div>
                    <div className="activity-points">
                      +{activities.find(a => a.text.replace(/^\S+\s/, '') === item)?.points || 0}
                    </div>
                  </div>
                  <div className="activity-actions">
                    <select 
                      className="activity-select" 
                      onChange={(e) => editTodayActivity(item, Number(e.target.value))}
                      value=""
                    >
                      <option value="">Uredi</option>
                      {activities.map(a => (
                        <option key={a.id} value={a.id}>{a.text}</option>
                      ))}
                    </select>
                    <button 
                      className="btn-icon btn-icon-small btn-confirm" 
                      onClick={() => confirmTodayActivity(item)}
                      title="Potrdi"
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
              ))}
            </div>
          </section>
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
                <p style={{ textAlign: 'center' }}>Uspešno si dokončal/a rastlino {plants.find(p => p.id === selectedPlant)?.name}. Dokončanja: {plantCompletions[selectedPlant] || 1}</p>
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
        <section className="card">
          <div className="section-title">
            <span>📊 Aktivnost</span>
            <div className="tabs">
              <button className={`tab ${graphView === 'days' ? 'active' : ''}`} onClick={() => setGraphView('days')}>Dnevi</button>
              <button className={`tab ${graphView === 'weeks' ? 'active' : ''}`} onClick={() => setGraphView('weeks')}>Tedni</button>
              <button className={`tab ${graphView === 'months' ? 'active' : ''}`} onClick={() => setGraphView('months')}>Meseci</button>
            </div>
          </div>

          <div style={{ width: '100%', height: 240 }}>
            <ResponsiveContainer>
              <AreaChart data={graphView === 'days' ? getDailyData() : graphView === 'weeks' ? getWeeklyData() : getMonthlyData()}>
                <defs>
                  <linearGradient id="colorArea" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.6}/>
                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0.05}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="label" tickLine={false} axisLine={false} />
                <Tooltip cursor={{ stroke: '#a7f3d0', strokeWidth: 2 }} separator="" formatter={(value: number, _name: string, props: any) => {
                  const items = props?.payload?.items || [];
                  return [`${value} ${items.length ? '- ' + items.join(', ') : ''}`, ''];
                }} labelFormatter={(_label: string, payload: any) => {
                  const p = payload && payload[0] && payload[0].payload;
                  const dayDt: Date | undefined = p && p.date;
                  const monthDt: Date | undefined = p && p.monthDate;
                  if (dayDt) return dayDt.toLocaleDateString('sl-SI', { day: 'numeric', month: 'short' });
                  if (monthDt) return monthDt.toLocaleDateString('sl-SI', { month: 'long' });
                  return (p && p.label) || '';
                }} />
                <Area type="monotone" dataKey="value" stroke="#22c55e" strokeWidth={2} fillOpacity={1} fill="url(#colorArea)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* chart caption removed; moved into XAxis labels */}

          <div className="legend">
            <span className="legend-item legend-active">Aktivno</span>
            <span className="legend-item">Neaktivno</span>
          </div>
        </section>

        {/* Plants summary table */}
        <section className="card">
          <div className="section-title"><span>📋 Povzetek rastlin (slike/stadiji)</span></div>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
            <thead>
              <tr style={{ textAlign: 'left', color: '#6b7280' }}>
                <th style={{ padding: '8px 4px' }}>Rastlina</th>
                <th style={{ padding: '8px 4px' }}>Skupno nivojev</th>
                <th style={{ padding: '8px 4px' }}>Slike (ena na nivo)</th>
                <th style={{ padding: '8px 4px' }}>Točke na nivo</th>
                <th style={{ padding: '8px 4px' }}>Skupaj točk</th>
              </tr>
            </thead>
            <tbody>
              {plants.slice(0, 5).map(p => {
                // Ciljne skupne točke: 30 za en mesec, sorazmerno z meseci
                const totalPoints = p.months * 30;
                // Izračun nivojev iz skupnih točk (1:5, 2:10, 3+:15)
                let computedLevels = 0;
                if (totalPoints > 0) {
                  if (totalPoints <= 5) computedLevels = 1;
                  else if (totalPoints <= 15) computedLevels = 2;
                  else computedLevels = 2 + Math.ceil((totalPoints - 15) / 15);
                }
                return (
                  <tr key={p.id}>
                    <td style={{ padding: '8px 4px' }}>{p.name}</td>
                    <td style={{ padding: '8px 4px' }}>{computedLevels}</td>
                    <td style={{ padding: '8px 4px' }}>{computedLevels}</td>
                    <td style={{ padding: '8px 4px' }}>1:5, 2:10, 3+:15</td>
                    <td style={{ padding: '8px 4px' }}>{totalPoints}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
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
                <p style={{ textAlign: 'center' }}>Uspešno si dokončal/a svojo {plantCompletions[selectedPlant] || 1} {currentPlant.name}.</p>
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
                        <div className="plant-name">{p.name}</div>
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
            </div>
          </div>
        )}
      </div>
    </div>
  );
}