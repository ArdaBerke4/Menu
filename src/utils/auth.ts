export const getStaffToken = (restaurantId: string, timeOffset: number = 0) => {
  const timeBlock = Math.floor(Date.now() / (5 * 60 * 1000)) + timeOffset;
  return btoa(`${restaurantId}-STAFF-QR-${timeBlock}`);
};

export const setStaffSession = (restaurantId: string, staffId: string, role: string) => {
  localStorage.setItem(`staff_session_${restaurantId}`, JSON.stringify({ id: staffId, role, timestamp: Date.now() }));
  localStorage.setItem(`staff_role_${restaurantId}`, role);
};

export const getStaffSession = (restaurantId: string) => {
  const data = localStorage.getItem(`staff_session_${restaurantId}`);
  if (!data) return null;
  try {
    return JSON.parse(data);
  } catch {
    return null;
  }
};

export const clearStaffSession = (restaurantId: string) => {
  localStorage.removeItem(`staff_session_${restaurantId}`);
  localStorage.removeItem(`staff_role_${restaurantId}`);
};
