export const playSound = (path: string, volume: number = 1.0) => {
    if (typeof window !== 'undefined') {
        const audio = new Audio(path);
        audio.volume = volume;
        audio.play().catch(e => console.warn("Audio diblokir browser:", e));
    }
};