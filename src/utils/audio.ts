export const playSound = (src: string, volume: number = 0.5) => {
    // 1. Keamanan SSR (Server-Side Rendering) Next.js
    if (typeof window === 'undefined') return;

    try {
        // 2. Buat instance Audio baru setiap kali fungsi dipanggil.
        const audio = new Audio(src);
        audio.volume = volume;

        // 3. Tangkap error (Biasanya karena kebijakan Autoplay peramban)
        const playPromise = audio.play();
        
        if (playPromise !== undefined) {
            playPromise.catch((error) => {
                console.warn(`Audio autoplay diblokir oleh browser untuk: ${src}`);
            });
        }

        // 4. Bersihkan memori secara otomatis setelah suara selesai
        audio.onended = () => {
            audio.remove(); 
        };

    } catch (error) {
        console.error("Gagal memutar audio:", error);
    }
};