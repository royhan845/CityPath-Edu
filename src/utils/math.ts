// Membatasi nilai agar tidak melebihi batas minimum dan maksimum
export const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

// Linear Interpolation untuk animasi pergerakan karakter yang halus
export const lerp = (start: number, end: number, t: number) => start * (1 - t) + end * t;