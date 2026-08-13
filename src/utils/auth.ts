export const getStaffToken = (restaurantId: string, timeOffset: number = 0) => {
  // 5 dakikalık (300,000 ms) bloklar
  const timeBlock = Math.floor(Date.now() / (5 * 60 * 1000)) + timeOffset;
  // Kendine has token oluşturmak için restaurantId ve timeBlock'u birleştirip base64 ile encode ediyoruz
  return btoa(`${restaurantId}-STAFF-QR-${timeBlock}`);
};
