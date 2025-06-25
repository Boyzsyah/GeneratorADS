
import { AdStyleOption, TextPlacementOption, TextEffectOption, CameraOption } from './types';

export const AD_STYLES: AdStyleOption[] = [
  { 
    value: "Modern & Minimalis", 
    label: "Modern & Minimalis",
    description: "Desain bersih, palet warna terbatas, fokus pada fungsionalitas dan estetika sederhana." 
  },
  { 
    value: "Inspiratif & Menyentuh", 
    label: "Inspiratif & Menyentuh",
    description: "Cerita emosional, membangkitkan semangat, sering menggunakan musik yang menggugah."
  },
  { 
    value: "Humoris & Ringan", 
    label: "Humoris & Ringan",
    description: "Lucu, menghibur, mudah diingat, sering menggunakan situasi tak terduga atau karakter unik."
  },
  { 
    value: "Formal & Profesional", 
    label: "Formal & Profesional",
    description: "Pendekatan serius, informatif, menekankan kredibilitas dan keahlian, cocok untuk B2B."
  },
  { 
    value: "Mewah & Elegan", 
    label: "Mewah & Elegan",
    description: "Visual berkualitas tinggi, detail yang indah, menciptakan kesan eksklusif dan premium."
  },
  { 
    value: "Hangat & Kekeluargaan", 
    label: "Hangat & Kekeluargaan",
    description: "Menampilkan hubungan antar manusia, kebersamaan, cocok untuk produk keluarga atau rumah tangga."
  },
  { 
    value: "Energik & Sporty", 
    label: "Energik & Sporty",
    description: "Tempo cepat, visual dinamis, musik yang membangkitkan semangat, cocok untuk produk olahraga atau gaya hidup aktif."
  },
];

export const TEXT_PLACEMENT_OPTIONS: TextPlacementOption[] = [
  { value: "akhir", label: "Di Akhir Video" },
  { value: "tengah", label: "Di Tengah (Transisi)" },
];

export const TEXT_EFFECT_OPTIONS: TextEffectOption[] = [
  { value: "a subtle fade-in animation", label: "Subtle Fade In (Halus Masuk)" },
  { value: "a gentle rise-up animation", label: "Gentle Rise Up (Naik Perlahan)" },
  { value: "a minimalist glow animation", label: "Minimalist Glow (Bersinar Minimalis)" },
  { value: "a quick slide-in from left animation", label: "Slide In From Left (Geser dari Kiri Cepat)" },
  { value: "a typewriter effect, character by character", label: "Typewriter Effect (Efek Ketik)" },
  { value: "a zoom-in then fade-out animation", label: "Zoom In then Fade Out (Perbesar lalu Menghilang)" },
  { value: "a pop-up or bounce-in animation", label: "Pop-Up / Bounce In (Muncul Ceria)" },
  { value: "a kinetic typography snippet with dynamic word emphasis", label: "Kinetic Typography (Tipografi Bergerak)" },
  { value: "text revealed by a smooth mask wipe (e.g., circular or horizontal)", label: "Mask Reveal (Terungkap dengan Masker)" },
  { value: "a subtle glitch effect for a modern/tech feel", label: "Subtle Glitch (Efek Glitch Halus)" },
  { value: "text appearing with a soft blur then sharpening", label: "Blur In (Fokus dari Kabur)" },
  { value: "handwritten text appearing as if being drawn", label: "Handwritten Scribble (Tulisan Tangan Muncul)" },
  { value: "neon glow text animation (suitable for specific styles)", label: "Neon Glow (Bersinar Neon)" }
];

export const CAMERA_SHOT_OPTIONS_SHOT1: CameraOption[] = [
  { value: "Medium Shot", label: "Medium Shot" },
  { value: "Close-up", label: "Close-up" },
  { value: "Long Shot", label: "Long Shot" },
  { value: "Establishing Shot", label: "Establishing Shot" },
  { value: "Point of View (POV)", label: "Point of View (POV)" },
  { value: "Dolly-in", label: "Dolly-in" },
  { value: "Dolly Zoom", label: "Dolly Zoom" },
  { value: "Handheld", label: "Handheld (Stable)" },
  { value: "Crane Shot", label: "Crane Shot" },
  { value: "Over the Shoulder", label: "Over the Shoulder" },
  { value: "Low Angle", label: "Low Angle" },
  { value: "High Angle", label: "High Angle" },
  { value: "Dutch Angle", label: "Dutch Angle (for dynamism)"},
  { value: "Tracking Shot", label: "Tracking Shot (following action)"}
];

export const CAMERA_SHOT_OPTIONS_SHOT2: CameraOption[] = [
  { value: "Extreme Close-Up on Product", label: "Close-Up Produk: Fokus detail pada produk." },
  { value: "Product Hero Shot (clean background)", label: "Hero Shot Produk: Tampilan produk yang megah dengan latar bersih." },
  { value: "Lifestyle Shot (character enjoying product)", label: "Lifestyle: Menunjukkan kebahagiaan karakter saat menggunakan produk." },
  { value: "Benefit-driven Shot (showing result of use)", label: "Hasil Akhir (Benefit): Menampilkan manfaat nyata dari penggunaan produk." },
  { value: "Dynamic Product Showcase (product in action)", label: "Dynamic Product Showcase: Product in action or with animated elements." },
  { value: "Split Screen (product feature vs benefit)", label: "Split Screen (feature vs benefit)"},
  { value: "Slow Motion Product Detail", label: "Slow Motion Product Detail"}
];


export const DEFAULT_AD_STYLE: string = AD_STYLES[0].value;
export const DEFAULT_TEXT_PLACEMENT: string = TEXT_PLACEMENT_OPTIONS[0].value;
export const DEFAULT_TEXT_EFFECT: string = TEXT_EFFECT_OPTIONS[0].value;
export const DEFAULT_SHOT1_CAMERA: string = CAMERA_SHOT_OPTIONS_SHOT1[0].value;
export const DEFAULT_SHOT2_CAMERA: string = CAMERA_SHOT_OPTIONS_SHOT2[0].value;