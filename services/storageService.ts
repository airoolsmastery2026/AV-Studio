
export const PERSISTENT_STATE_KEY = 'av_studio_active_missions';

export const saveMissionState = (state: any) => {
  localStorage.setItem(PERSISTENT_STATE_KEY, JSON.stringify({
    ...state,
    last_sync: Date.now()
  }));
};

export const getMissionState = () => {
  const saved = localStorage.getItem(PERSISTENT_STATE_KEY);
  if (!saved) return null;
  return JSON.parse(saved);
};

export const clearMissionState = () => {
  localStorage.removeItem(PERSISTENT_STATE_KEY);
};
