export const playSound = (src: string, volume: number = 0.5) => {
    try {
        const audio = new Audio(src);
        audio.volume = volume;
        audio.play().catch(() => {
        });
    } catch (error) {
        console.warn("Gagal memutar audio:", error);
    }
};