
import React, { useState, useCallback, useRef, ChangeEvent, DragEvent, useEffect } from 'react';
import { 
    AD_STYLES, 
    TEXT_PLACEMENT_OPTIONS, 
    TEXT_EFFECT_OPTIONS, 
    CAMERA_SHOT_OPTIONS_SHOT1,
    CAMERA_SHOT_OPTIONS_SHOT2,
    DEFAULT_AD_STYLE, 
    DEFAULT_TEXT_PLACEMENT,     
    DEFAULT_TEXT_EFFECT,
    DEFAULT_SHOT1_CAMERA,
    DEFAULT_SHOT2_CAMERA
} from './constants';
import { AdConceptData, GeneratedPromptsData } from './types';
import { callGeminiAPI, GeminiPayload } from './services/geminiService';
import SpinnerIcon from './components/SpinnerIcon'; // Updated import path

const UploadCloudIcon: React.FC<{className?: string}> = ({ className = "w-12 h-12" }) => ( 
    <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.2} stroke="currentColor"> 
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.338-2.32 5.75 5.75 0 01-1.046 11.098A1.5 1.5 0 018.25 15.75a1.5 1.5 0 01-1.5 1.5H6.75z" />
    </svg>
);

const CloseIcon: React.FC<{className?: string}> = ({ className = "w-5 h-5" }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
);


const App: React.FC = () => {
  const [base64ProductImageData, setBase64ProductImageData] = useState<string | null>(null);
  const [productImagePreview, setProductImagePreview] = useState<string | null>(null);
  const [productMimeType, setProductMimeType] = useState<string | null>(null);
  const [productFileName, setProductFileName] = useState<string>('');
  const [isDraggingProduct, setIsDraggingProduct] = useState<boolean>(false);
  const productImageUploadInputRef = useRef<HTMLInputElement>(null);

  const [base64AvatarData, setBase64AvatarData] = useState<string | null>(null);
  const [avatarMimeType, setAvatarMimeType] = useState<string | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarFileName, setAvatarFileName] = useState<string>('');
  const [isDraggingAvatar, setIsDraggingAvatar] = useState<boolean>(false);
  const avatarImageUploadInputRef = useRef<HTMLInputElement>(null);
  
  const [adStyle, setAdStyle] = useState<string>(DEFAULT_AD_STYLE);
  const [selectedAdStyleDescription, setSelectedAdStyleDescription] = useState<string>(
    AD_STYLES.find(style => style.value === DEFAULT_AD_STYLE)?.description || ''
  );
  
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [isGeneratingPrompt, setIsGeneratingPrompt] = useState<boolean>(false);

  const [showKonsepContainer, setShowKonsepContainer] = useState<boolean>(false);
  const [showOutputContainer, setShowOutputContainer] = useState<boolean>(false);
  const [outputPlaceholderVisible, setOutputPlaceholderVisible] = useState<boolean>(true);
  const [outputLoadingVisible, setOutputLoadingVisible] = useState<boolean>(false);

  const konsepDetailsRef = useRef<HTMLDivElement>(null);
  const outputDetailsParentRef = useRef<HTMLDivElement>(null);

  const [productName, setProductName] = useState<string>('');
  const [productDetails, setProductDetails] = useState<string>('');
  const [locationDetails, setLocationDetails] = useState<string>('');
  const [characterDetailsText, setCharacterDetailsText] = useState<string>('');
  const [shot1Camera, setShot1Camera] = useState<string>(DEFAULT_SHOT1_CAMERA);
  const [shot1Action, setShot1Action] = useState<string>('');
  const [shot2Camera, setShot2Camera] = useState<string>(DEFAULT_SHOT2_CAMERA);
  const [shot2Action, setShot2Action] = useState<string>('');
  const [dialogueDetails, setDialogueDetails] = useState<string>('');
  const [visualDetails, setVisualDetails] = useState<string>('');
  
  // State for on-screen text options
  const [useOnScreenText, setUseOnScreenText] = useState<boolean>(true);
  const [endTitleDetails, setEndTitleDetails] = useState<string>('');
  const [textPlacement, setTextPlacement] = useState<string>(DEFAULT_TEXT_PLACEMENT);
  const [textEffect, setTextEffect] = useState<string>(DEFAULT_TEXT_EFFECT);

  const [promptEn, setPromptEn] = useState<string>('');
  const [promptId, setPromptId] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'en' | 'id'>('en');
  
  const [showNotification, setShowNotification] = useState<boolean>(false);

  useEffect(() => {
    if (showKonsepContainer && konsepDetailsRef.current) {
        setTimeout(() => { // Timeout to allow layout to settle before scrolling
            konsepDetailsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }, 100); 
    }
  }, [showKonsepContainer]);

  useEffect(() => {
    if (showOutputContainer && outputDetailsParentRef.current) {
        setTimeout(() => {
            outputDetailsParentRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }, 100);
    }
  }, [showOutputContainer]);


  const handleFile = useCallback((
    file: File, 
    setPreview: React.Dispatch<React.SetStateAction<string | null>>,
    setBase64Data: React.Dispatch<React.SetStateAction<string | null>>,
    setMimeType: React.Dispatch<React.SetStateAction<string | null>>,
    setFileNameState: React.Dispatch<React.SetStateAction<string>>
    ) => {
    if (!file.type.startsWith('image/')) {
      alert('Hanya file gambar yang diizinkan!');
      return;
    }
    setFileNameState(file.name);
    setMimeType(file.type);
    const reader = new FileReader();
    reader.onload = e => {
      if (e.target?.result) {
        const resultStr = e.target.result as string;
        setPreview(resultStr);
        setBase64Data(resultStr.split(',')[1]);
      }
    };
    reader.readAsDataURL(file);
  }, []);

  const createHandleRemoveImage = (
    setPreview: React.Dispatch<React.SetStateAction<string | null>>,
    setBase64Data: React.Dispatch<React.SetStateAction<string | null>>,
    setMimeType: React.Dispatch<React.SetStateAction<string | null>>,
    setFileNameState: React.Dispatch<React.SetStateAction<string>>
  ) => () => {
    setPreview(null);
    setBase64Data(null);
    setMimeType(null);
    setFileNameState('');
  };

  const handleRemoveProductImage = createHandleRemoveImage(setProductImagePreview, setBase64ProductImageData, setProductMimeType, setProductFileName);
  const handleRemoveAvatarImage = createHandleRemoveImage(setAvatarPreview, setBase64AvatarData, setAvatarMimeType, setAvatarFileName);


  const handleProductDropZoneClick = () => productImageUploadInputRef.current?.click();
  const handleProductDragOver = (e: DragEvent<HTMLDivElement>) => { e.preventDefault(); setIsDraggingProduct(true); };
  const handleProductDragLeave = (e: DragEvent<HTMLDivElement>) => { e.preventDefault(); setIsDraggingProduct(false); };
  const handleProductDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDraggingProduct(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0], setProductImagePreview, setBase64ProductImageData, setProductMimeType, setProductFileName);
      e.dataTransfer.clearData();
    }
  };
  const handleProductFileInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFile(e.target.files[0], setProductImagePreview, setBase64ProductImageData, setProductMimeType, setProductFileName);
    }
  };

  const handleAvatarDropZoneClick = () => avatarImageUploadInputRef.current?.click();
  const handleAvatarDragOver = (e: DragEvent<HTMLDivElement>) => { e.preventDefault(); setIsDraggingAvatar(true); };
  const handleAvatarDragLeave = (e: DragEvent<HTMLDivElement>) => { e.preventDefault(); setIsDraggingAvatar(false); };
  const handleAvatarDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDraggingAvatar(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0], setAvatarPreview, setBase64AvatarData, setAvatarMimeType, setAvatarFileName);
      e.dataTransfer.clearData();
    }
  };
  const handleAvatarFileInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFile(e.target.files[0], setAvatarPreview, setBase64AvatarData, setAvatarMimeType, setAvatarFileName);
    }
  };

  const handleAdStyleChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const selectedValue = e.target.value;
    setAdStyle(selectedValue);
    const styleObj = AD_STYLES.find(style => style.value === selectedValue);
    setSelectedAdStyleDescription(styleObj?.description || '');
  };

  const parseJsonFromApi = (jsonString: string): any => {
    let parsableString = jsonString.trim();
    const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
    const match = parsableString.match(fenceRegex);
    if (match && match[2]) {
      parsableString = match[2].trim();
    }
    try {
      return JSON.parse(parsableString);
    } catch (e) {
      console.error("Failed to parse JSON response:", parsableString, e);
      throw new Error("Invalid JSON response from AI.");
    }
  };

  const analyzeAndCreateConcept = async () => {
    if (!base64ProductImageData || !productMimeType) {
      alert('Silakan unggah gambar produk terlebih dahulu.');
      return;
    }
    setIsAnalyzing(true);
    setShowKonsepContainer(false);
    setShowOutputContainer(false);
    setOutputPlaceholderVisible(true);
    setOutputLoadingVisible(false);

    let characterInstructionPrompt = `
        -   \`characterDetails\`: Create a highly detailed description for a character suitable for the product (from Image 1) and ad style "${adStyle}". This description is CRITICAL for visual consistency in the final video. Include:
            *   **Apparent Age Range & Gender Presentation:** (e.g., "A woman appearing to be in her early 30s", "A man who looks about 45-50 years old").
            *   **Key Facial Features:** Suggest specific and vivid details (e.g., "She has kind, almond-shaped brown eyes, a button nose, and a warm smile. Her dark brown hair is styled in a neat bob.").
            *   **Clothing Style & Specifics:** Describe the type of clothing, colors, patterns, and overall style that would fit the character and ad (e.g., "Wearing a crisp white linen shirt, well-fitted dark blue jeans, and minimalist silver earrings. Her style is modern-casual.").
            *   **Accessories (if any):** Mention relevant accessories (e.g., "Wears thin-framed glasses", "A simple leather wristwatch").
            *   **Overall Vibe/Demeanor:** (e.g., "Exudes a calm, confident professionalism", "Has a friendly and approachable demeanor", "Appears energetic and focused").
            Make this description as visually rich as possible to guide the video generation.
    `;
    if (base64AvatarData && avatarMimeType) {
        characterInstructionPrompt = `
        -   \`characterDetails\`: Based *STRICTLY AND METICULOUSLY* on Image 2 (the character avatar), provide an EXTREMELY detailed physical description. This is CRITICAL for visual consistency in the final video. Include:
            *   **Apparent Age Range & Gender Presentation:** (e.g., "Appears to be a young woman in her mid-20s", "A man who looks to be in his late 40s").
            *   **Key Facial Features:** Describe discernible eye color, hair style and color, eyebrow shape, nose shape, lip shape, jawline, and any unique marks like moles or freckles if clearly visible (e.g., "She has bright blue eyes, a sharp nose, and full lips. Her blonde hair is shoulder-length and wavy. A small beauty mark is visible above her right eyebrow.").
            *   **Clothing Details (Item by Item):** For each visible piece of clothing (top, bottom, outerwear, shoes if visible), describe its type (e.g., t-shirt, blazer, jeans, skirt), color(s), pattern (e.g., solid, striped, floral), texture (e.g., cotton, silk, denim, knit - if discernible), and fit (e.g., loose, fitted, oversized).
            *   **Accessories:** Detail every visible accessory, such as glasses (frame style and color), earrings, necklaces, bracelets, rings, watches, belts, hats, scarves, bags.
            *   **Pose & Expression:** Describe the character's posture, how they are holding themselves, and their facial expression in Image 2 (e.g., "Standing confidently with a slight smile", "Seated, looking thoughtfully towards the left", "Laughing openly").
            *   **Overall Vibe/Demeanor:** Summarize the character's perceived personality or style from the image (e.g., "Projects an image of sophisticated elegance", "Appears casual, friendly, and down-to-earth", "Looks artistic and introspective").
            If Image 2 is not a clear character or is an object, state "Image 2 is not a discernible human character." and then proceed to generate a detailed character description suitable for the product (from Image 1) and ad style "${adStyle}" as if no avatar was provided, following the detailed point-form instructions for character creation.
        `;
    }

    const conceptPrompt = `
        You are a professional creative director. Your task is to generate a complete advertising concept based on the provided image(s) and ad style.
        Image 1 is the PRODUCT. ${base64AvatarData ? 'Image 2 is the CHARACTER AVATAR.' : 'No character avatar image provided.'}
        
        **Primary Rules:**
        1.  **Analyze Product (Image 1):** Generate a hyper-realistic, detailed physical description of the product from Image 1. Be forensic about its material, color, shape, texture, and key visual features. This description is for unwavering visual consistency and MUST NOT be altered.
        2.  **Contextual Location:** Based on the detailed product description (from Image 1) and the selected ad style ("${adStyle}"), determine the most suitable, realistic, and appealing location. Example: a gaming headset -> modern gaming room. Acceptable locations: modern studio, cozy home, professional office, clean kitchen, stylish apartment, organized workshop. **Strictly avoid fantastical or futuristic settings.**
        3.  **Generate a JSON object** with keys: "productName", "productDetails", "locationDetails", "characterDetails", "shot1Action", "shot2Action", "dialogueDetails", "visualDetails", "endTitleDetails".

        **JSON Key Instructions (All text values must be in natural Indonesian):**
        -   \`productName\`: Suggest a catchy, brandable name for the product (from Image 1).
        -   \`productDetails\`: The forensic physical description from Rule #1 (from Image 1).
        ${characterInstructionPrompt}
        -   \`locationDetails\`: Determine the most suitable location based on the product and ad style.
        -   \`shot1Action\`: Describe the scene and character action for the first shot (the introduction). This shot should set the scene and introduce the product or the problem it solves, fitting the ad style "${adStyle}".
        -   \`shot2Action\`: Describe the scene and character action for the second shot (the payoff/product focus). This shot should highlight the product in use, its key benefit, or a satisfying outcome, fitting the ad style "${adStyle}".
        -   \`dialogueDetails\`: A short, powerful dialogue (1-2 sentences total) that could be used as a voiceover or character line, fitting the ad style "${adStyle}". Split into two parts if natural.
        -   \`visualDetails\`: A professional visual style (e.g., cinematic, bright and airy), camera work notes (e.g., smooth tracking shots), and lighting (e.g., natural light) that complements the location and ad style "${adStyle}".
        -   \`endTitleDetails\`: A strong, concise final on-screen text or slogan. This field may be empty if the user opts out of on-screen text.
        
        Return ONLY the raw JSON object. Ensure the JSON is valid.
    `;
    
    const apiPayload: GeminiPayload = {
      prompt: conceptPrompt,
      productImageData: base64ProductImageData,
      productMimeType: productMimeType,
    };

    if (base64AvatarData && avatarMimeType) {
      apiPayload.avatarImageData = base64AvatarData;
      apiPayload.avatarMimeType = avatarMimeType;
    }

    try {
      const resultText = await callGeminiAPI(apiPayload);
      const concept: AdConceptData = parseJsonFromApi(resultText);

      setProductName(concept.productName || '');
      setProductDetails(concept.productDetails || '');
      setLocationDetails(concept.locationDetails || '');
      setCharacterDetailsText(concept.characterDetails || '');
      setShot1Action(concept.shot1Action || '');
      setShot1Camera(DEFAULT_SHOT1_CAMERA); 
      setShot2Action(concept.shot2Action || '');
      setShot2Camera(DEFAULT_SHOT2_CAMERA);
      setDialogueDetails(concept.dialogueDetails || '');
      setVisualDetails(concept.visualDetails || '');
      setEndTitleDetails(concept.endTitleDetails || ''); 
      
      setShowKonsepContainer(true);
    } catch (error) {
      alert(`Gagal membuat konsep: ${error instanceof Error ? error.message : String(error)}`);
      console.error(error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const generateFinalPrompt = async () => {
    setOutputPlaceholderVisible(false);
    setOutputLoadingVisible(true);
    setShowOutputContainer(false);
    setIsGeneratingPrompt(true);
    
    const dialogueParts = (dialogueDetails.match(/[^.!?]+[.!?]+/g) || [dialogueDetails, ""]);
    const dialogue1 = dialogueParts[0]?.trim() || "";
    const dialogue2 = dialogueParts.slice(1).join(' ').trim() || "";

    let textBlockContent = "";
    let transitionBlockContent = `[TRANSITION: Suggest a smooth and contextually appropriate camera transition, e.g., cross-dissolve, match cut, or a dynamic wipe if the style allows. Ensure no on-screen text appears if not explicitly requested below.]`;

    if (useOnScreenText && endTitleDetails.trim() !== "") {
        textBlockContent = `
[ON-SCREEN TEXT]
Style: [Suggest a clean, elegant font, centered, with the animation style: "${textEffect}". Consider font pairing if applicable.]
Text: "${endTitleDetails.trim()}"
Location: Display this text ${textPlacement === 'tengah' ? 'during the mid-transition' : 'at the very end of the video'}.
        `.trim();

        if (textPlacement === 'tengah') {
            transitionBlockContent = `
[TRANSITION & TEXT OVERLAY: During a smooth ${adStyle === "Modern & Minimalis" || adStyle === "Mewah & Elegan" ? "cross-dissolve or a clean wipe" : "dynamic transition"}, the following text appears overlaid with the animation style: "${textEffect}". Ensure the text is highly legible over the transitioning footage.]
Text: "${endTitleDetails.trim()}"
            `.trim();
            textBlockContent = ""; 
        }
    } else {
        textBlockContent = "[ON-SCREEN TEXT: None requested. Do not display any on-screen text or slogan.]";
        if (textPlacement === 'tengah') {
             transitionBlockContent = `[TRANSITION: Suggest a smooth and contextually appropriate camera transition. No on-screen text will be displayed during this transition.]`;
        }
    }


    const finalPromptGen = `
You are a world-class prompt engineer for AI video generators. Your task is to generate two distinct video ad prompts (one in English, one in Indonesian) based on the provided ad concept.
Output a single JSON object with two keys: "englishPrompt" and "indonesianPrompt".

**Ad Concept Details (Source Data - Primarily in Indonesian):**
- Product Name: ${productName}
- Detailed Product Description (for visual consistency): ${productDetails}
- Detailed Character Description (Indonesian): ${characterDetailsText} // This is the 'characterDetailsText' referred to below.
- Selected Ad Style: ${adStyle}
- Shot 1 Camera: ${shot1Camera}
- Shot 1 Action: ${shot1Action}
- Shot 2 Camera: ${shot2Camera}
- Shot 2 Action: ${shot2Action}
- Dialogue Part 1 (Indonesian): ${dialogue1}
- Dialogue Part 2 (CTA, Indonesian): ${dialogue2}
- Location & Atmosphere: ${locationDetails}
- Visual Style: ${visualDetails}
- Use On-Screen Text: ${useOnScreenText}
- Final On-Screen Text Content: ${useOnScreenText ? endTitleDetails : "Not Used"}
- Text Placement: ${useOnScreenText ? textPlacement : "Not Used"}
- Text Animation Effect: ${useOnScreenText ? textEffect : "Not Used"}

**Instructions for Populating the '--- PROMPT STRUCTURE ---' for each language version:**

1.  **For "englishPrompt":**
    *   The entire prompt, including all structural text and descriptive content, MUST be in English, EXCEPT for the dialogue.
    *   When filling the '--- PROMPT STRUCTURE ---' below for the "englishPrompt":
        *   Translate the values of the following placeholders from Indonesian (from "Ad Concept Details") into natural, fluent English: \`productName\`, \`productDetails\`, \`locationDetails\`, \`adStyle\`, \`shot1Action\`, \`shot2Action\`, \`visualDetails\`, \`endTitleDetails\`.
        *   The dialogue sections (\`"${dialogue1}"\` and \`"${dialogue2}"\`) MUST remain in their original Indonesian.
        *   For the \`[CHARACTERS]\` section within the structure, the placeholder \`"${characterDetailsText}"\` MUST be replaced with a highly detailed ENGLISH translation of the original Indonesian character description.
        *   For the \`[NEGATIVE PROMPT]\` section: Use the following English text directly: "Avoid any automatic, unintended subtitles or captions embedded in the video frames. All character movements must be exceptionally natural, fluid, and smooth. Avoid any stiff, jerky, or robotic animations. Ensure realistic human-like motion."

2.  **For "indonesianPrompt":**
    *   This prompt MUST be entirely in Indonesian.
    *   It should be a full, natural Indonesian translation of the generated "englishPrompt" (meaning all English text from "englishPrompt", including translated product names, locations, actions, etc., gets translated back to or remains Indonesian).
    *   **Crucial Exception for [CHARACTERS]:** For the \`[CHARACTERS]\` section, instead of translating the English character description from "englishPrompt", you MUST use the original Indonesian \`"${characterDetailsText}"\` directly, as provided in "Ad Concept Details".
    *   Dialogue naturally remains Indonesian.
    *   For the \`[NEGATIVE PROMPT]\` section: Use the following Indonesian text directly: "Hindari subtitle atau takarir otomatis yang tidak diinginkan yang disematkan dalam frame video. Semua gerakan karakter harus luar biasa alami, luwes, dan halus. Hindari animasi yang kaku, tersentak-sentak, atau robotik. Pastikan gerakan menyerupai manusia yang realistis."


**Core Rules for Video Generation (These are for the AI video generator that will use these prompts):**
1.  **Product Visual Accuracy:** The generated video MUST strictly match the [PRODUCT DESCRIPTION].
2.  **Character Visual Accuracy:** The generated video MUST STRICTLY AND ACCURATELY match the description in [CHARACTERS].
3.  **On-Screen Text:** If requested via the '[ON-SCREEN TEXT]' block, adhere to specs. If "[ON-SCREEN TEXT: None requested]", generate no such text.
4.  **Negative Prompts:** Strictly adhere to all instructions in [NEGATIVE PROMPT].

--- PROMPT STRUCTURE ---
[MAIN PROMPT]
Generate a short, two-shot video in a realistic, ${adStyle} advertising style. Within a ${locationDetails} setting, a character effectively demonstrates the ${productName}.

[PRODUCT DESCRIPTION]
**Crucial for visual accuracy:** The product is ${productDetails}. The generated video must strictly adhere to this description in all visual aspects (color, material, shape, texture).

[VISUAL STYLE & ATMOSPHERE]
Overall Style: ${visualDetails}
Camera Work: Utilize dynamic camera movements. Shot 1 should employ a ${shot1Camera}. Shot 2 should use a ${shot2Camera}.
Lighting: [Suggest specific lighting that enhances the "${visualDetails}" mood and complements the "${locationDetails}" setting, e.g., soft natural light through a window, bright studio lighting, warm ambient glow.]
Location Details: ${locationDetails}

[NEGATIVE PROMPT]
[This section will be populated with specific negative prompt text for each language version as per instructions above.]

[SOUND DESIGN GUIDE]
Ambient Sounds: [Suggest subtle ambient sounds appropriate for "${locationDetails}", e.g., distant city hum for an office, gentle kitchen clatter, quiet nature sounds for an outdoor scene.]
Dialogue Delivery: Voiceover or character dialogue must be delivered with a clear, natural Indonesian accent.
Music: [Suggest an optional background music genre or style that aligns with the "${adStyle}" and enhances the overall mood, e.g., upbeat electronic, gentle acoustic, inspiring orchestral piece.]

[CHARACTERS]
Main Character: [For English prompt, translate this to English with extreme detail: "${characterDetailsText}". For Indonesian prompt, use as is with extreme detail: "${characterDetailsText}"]
The video MUST render this character with precise adherence to all described features (age, gender, facial details, hair, clothing specifics, accessories, vibe).

[SCENE SEQUENCE (2 SHOTS)]
SHOT 1: The Introduction
Camera: ${shot1Camera}
Action: ${shot1Action}
Dialogue & Voice Tone (Natural Indonesian Accent): "${dialogue1}"

${transitionBlockContent}

SHOT 2: The Payoff
Camera: ${shot2Camera}
Action: ${shot2Action}
Dialogue & Voice Tone (Natural Indonesian Accent): "${dialogue2}"

${textBlockContent} 
--- END OF STRUCTURE ---

Return ONLY the raw JSON object. Ensure the JSON is valid.
    `;

    try {
      const resultText = await callGeminiAPI({ prompt: finalPromptGen.trim() });
      const prompts: GeneratedPromptsData = parseJsonFromApi(resultText);

      setPromptEn(prompts.englishPrompt?.trim() || 'Gagal membuat prompt Bahasa Inggris.');
      setPromptId(prompts.indonesianPrompt?.trim() || 'Gagal membuat prompt Bahasa Indonesia.');

      setOutputLoadingVisible(false);
      setShowOutputContainer(true);
    } catch(error) {
      alert(`Gagal membuat prompt final: ${error instanceof Error ? error.message : String(error)}`);
      console.error(error);
      setOutputLoadingVisible(false);
      setOutputPlaceholderVisible(true);
    } finally {
      setIsGeneratingPrompt(false);
    }
  };
  
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setShowNotification(true);
      setTimeout(() => setShowNotification(false), 2500);
    }).catch(err => {
      console.error('Gagal menyalin: ', err);
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed'; 
      textarea.style.left = '-9999px';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      try {
        document.execCommand('copy');
        setShowNotification(true);
        setTimeout(() => setShowNotification(false), 2500);
      } catch(e) {
         console.error('Gagal menyalin dengan fallback:', e);
         alert('Gagal menyalin teks. Silakan coba salin manual.');
      }
      document.body.removeChild(textarea);
    });
  };

  const InputLabel: React.FC<{ htmlFor: string; children: React.ReactNode; className?: string }> = ({ htmlFor, children, className }) => (
    <label htmlFor={htmlFor} className={`block text-sm font-semibold text-slate-700 mb-2 ${className}`}>
      {children}
    </label>
  );

  const SectionTitle: React.FC<{ step?: string | number; title: string; isSubStep?: boolean; className?: string; isInsideFrame?: boolean }> = 
    ({ step, title, isSubStep = false, className ="", isInsideFrame = false }) => (
    <h2 className={`font-bold flex items-center ${isSubStep ? 'text-slate-700 mt-1 text-lg' : 'text-slate-800 text-2xl'} ${isInsideFrame ? 'mb-0' : 'mb-4'} ${className}`}>
        {step && (
          <span className={`bg-indigo-600 text-white rounded-full w-8 h-8 inline-flex items-center justify-center mr-3 text-sm font-bold shadow-md`}>
            {step}
          </span>
        )}
        {title}
    </h2>
  );
  
  const DropZoneComponent: React.FC<{
    id: string;
    isDragging: boolean;
    handleDropZoneClick: () => void;
    handleDragOver: (e: DragEvent<HTMLDivElement>) => void;
    handleDragLeave: (e: DragEvent<HTMLDivElement>) => void;
    handleDrop: (e: DragEvent<HTMLDivElement>) => void;
    imagePreview: string | null;
    fileName: string;
    inputRef: React.RefObject<HTMLInputElement>;
    handleFileInputChange: (e: ChangeEvent<HTMLInputElement>) => void;
    onRemoveImage?: () => void; 
    dropZoneText: string;
    ariaLabel: string;
  }> = ({ id, isDragging, handleDropZoneClick, handleDragOver, handleDragLeave, handleDrop, imagePreview, fileName, inputRef, handleFileInputChange, onRemoveImage, dropZoneText, ariaLabel }) => (
    <div 
        id={id}
        className={`relative flex flex-col items-center justify-center w-full min-h-[180px] p-4 border-2 border-dashed rounded-lg cursor-pointer transition-all duration-200 ease-in-out group ${isDragging ? 'border-indigo-500 bg-indigo-50/70 shadow-inner' : 'border-slate-300 hover:border-indigo-400 hover:bg-slate-50/70'}`}
        onClick={imagePreview ? undefined : handleDropZoneClick} 
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        aria-label={ariaLabel}
        role="button"
        tabIndex={imagePreview ? -1 : 0} 
        onKeyDown={(e) => { if (!imagePreview && (e.key === 'Enter' || e.key === ' ')) handleDropZoneClick();}}
    >
        {!imagePreview && (
        <div className="text-center text-slate-500 pointer-events-none space-y-1">
            <UploadCloudIcon className="mx-auto h-10 w-10 text-slate-400 group-hover:text-indigo-500 transition-colors duration-200 mb-1" />
            <p className="font-semibold text-sm text-slate-600 group-hover:text-indigo-600 transition-colors duration-200">{dropZoneText}</p>
            <p className="text-xs text-slate-500">atau klik untuk memilih file</p>
            {fileName && <p className="text-xs mt-1.5 text-indigo-700 font-medium truncate max-w-[200px] bg-indigo-100 px-2 py-0.5 rounded">{fileName}</p>}
        </div>
        )}
        {imagePreview && (
          <>
            <img src={imagePreview} alt={fileName || "Preview gambar"} className="absolute top-0 left-0 w-full h-full object-contain rounded-md p-1 bg-white" />
            {onRemoveImage && (
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); onRemoveImage(); }}
                className="absolute top-2 right-2 z-10 p-1.5 bg-neutral-800/70 text-white rounded-full hover:bg-neutral-900/90 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-offset-white focus:ring-neutral-700 transition-colors"
                aria-label={`Hapus ${fileName || 'gambar'}`}
              >
                <CloseIcon className="w-4 h-4" />
              </button>
            )}
          </>
        )}
        <input type="file" ref={inputRef} onChange={handleFileInputChange} accept="image/*" className="hidden" aria-hidden="true" />
    </div>
  );

  const FormSectionFrame: React.FC<{ title: React.ReactNode; children: React.ReactNode; className?: string }> = 
    ({ title, children, className = "" }) => {
    return (
      <div 
        className={`bg-white rounded-lg border-2 border-neutral-800 shadow-[4px_4px_0px_theme(colors.neutral.800)] ${className}`}
      >
        <div className="px-5 py-3 border-b-2 border-neutral-800">
            {typeof title === 'string' ? <h4 className="text-base font-semibold text-neutral-800">{title}</h4> : title}
        </div>
        <div className="p-5 space-y-5"> 
          {children}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-10 sm:px-6 lg:px-8 max-w-4xl"> 
        <header className="text-center mb-16 sm:mb-20">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight">
                AI <span className="text-indigo-600">Ad Concept</span> Generator
            </h1>
            <p className="mt-4 text-base sm:text-lg text-slate-600 max-w-3xl mx-auto">
                Dari Gambar menjadi Konsep Iklan Profesional. Cepat, Cerdas, dan Kreatif.
            </p>
        </header>

        <div className="grid grid-cols-1 gap-12 lg:gap-16"> 
            <div className="main-card p-6 sm:p-8 flex flex-col space-y-8">
                <FormSectionFrame title={<SectionTitle step={1} title="Unggah Gambar Produk" isInsideFrame />}>
                    <DropZoneComponent
                        id="product-drop-zone"
                        isDragging={isDraggingProduct}
                        handleDropZoneClick={handleProductDropZoneClick}
                        handleDragOver={handleProductDragOver}
                        handleDragLeave={handleProductDragLeave}
                        handleDrop={handleProductDrop}
                        imagePreview={productImagePreview}
                        fileName={productFileName}
                        inputRef={productImageUploadInputRef}
                        handleFileInputChange={handleProductFileInputChange}
                        onRemoveImage={handleRemoveProductImage}
                        dropZoneText="Seret & lepas gambar produk"
                        ariaLabel="Area unggah gambar produk utama"
                    />
                </FormSectionFrame>
                
                 <FormSectionFrame title={<SectionTitle step="1B" title="Unggah Avatar Karakter" isSubStep isInsideFrame />}>
                     <p className="text-xs text-slate-500 -mt-3 mb-3">Opsional: Jika Anda memiliki gambar karakter tertentu.</p>
                     <DropZoneComponent
                        id="avatar-drop-zone"
                        isDragging={isDraggingAvatar}
                        handleDropZoneClick={handleAvatarDropZoneClick}
                        handleDragOver={handleAvatarDragOver}
                        handleDragLeave={handleAvatarDragLeave}
                        handleDrop={handleAvatarDrop}
                        imagePreview={avatarPreview}
                        fileName={avatarFileName}
                        inputRef={avatarImageUploadInputRef}
                        handleFileInputChange={handleAvatarFileInputChange}
                        onRemoveImage={handleRemoveAvatarImage}
                        dropZoneText="Seret & lepas gambar avatar"
                        ariaLabel="Area unggah gambar avatar karakter (opsional)"
                    />
                </FormSectionFrame>

                <FormSectionFrame title={<SectionTitle step={2} title="Pilih Gaya Iklan" isInsideFrame />}>
                    <select 
                        id="ad-style-select" 
                        value={adStyle} 
                        onChange={handleAdStyleChange} 
                        className="form-select" 
                        aria-label="Pilih gaya iklan yang diinginkan"
                    >
                        {AD_STYLES.map(style => <option key={style.value} value={style.value}>{style.label}</option>)}
                    </select>
                    {selectedAdStyleDescription && (
                        <p className="text-xs text-slate-500 mt-2 px-1">{selectedAdStyleDescription}</p>
                    )}
                </FormSectionFrame>

                <button 
                    id="analyze-button"
                    onClick={analyzeAndCreateConcept} 
                    disabled={isAnalyzing || !base64ProductImageData}
                    className="w-full text-white font-semibold text-base py-3.5 px-6 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-400 disabled:bg-slate-400 disabled:text-slate-100 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none bg-indigo-600 hover:bg-indigo-700 shadow-md hover:shadow-lg transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-150 ease-in-out"
                    aria-live="polite"
                    aria-label="Mulai analisis gambar dan buat konsep iklan"
                >
                    {isAnalyzing ? <SpinnerIcon className="w-5 h-5 inline-block mr-2" /> : null}
                    {isAnalyzing ? 'Menganalisis...' : 'Analisis & Buat Konsep'}
                </button>

                <div ref={konsepDetailsRef} className={`transition-[max-height,opacity] duration-700 ease-[cubic-bezier(0.4,0,0.2,1)] overflow-hidden ${showKonsepContainer ? 'max-h-dynamic-show opacity-100' : 'max-h-0 opacity-0'}`} id="konsep-container-details" aria-hidden={!showKonsepContainer}>
                    <SectionTitle step={3} title="Review & Sempurnakan Konsep" className="mt-6 mb-5" />
                     <div className="bg-slate-100 p-5 sm:p-6 rounded-xl space-y-8 shadow"> 
                        <FormSectionFrame title="Informasi Dasar Produk & Karakter">
                            <div>
                                <InputLabel htmlFor="product-name-input">Nama Produk</InputLabel>
                                <input type="text" id="product-name-input" value={productName} onChange={e => setProductName(e.target.value)} className="form-input" placeholder="Contoh: Meja 'ErgoMax'" />
                            </div>
                            <div>
                                <InputLabel htmlFor="product-details-input">Deskripsi Detail Produk (Penting untuk Visual)</InputLabel>
                                <textarea id="product-details-input" value={productDetails} onChange={e => setProductDetails(e.target.value)} rows={4} className="form-textarea custom-scrollbar" placeholder="AI akan mengisi deskripsi fisik produk di sini..."></textarea>
                            </div>
                            <div>
                               <InputLabel htmlFor="location-details-input">Latar / Lokasi</InputLabel>
                               <textarea id="location-details-input" value={locationDetails} onChange={e => setLocationDetails(e.target.value)} rows={2} className="form-textarea custom-scrollbar" placeholder="AI akan menyarankan lokasi yang sesuai..."></textarea>
                            </div>
                             <div>
                                <InputLabel htmlFor="character-details-input">Deskripsi Karakter</InputLabel>
                                <textarea id="character-details-input" value={characterDetailsText} onChange={e => setCharacterDetailsText(e.target.value)} rows={5} className="form-textarea custom-scrollbar" placeholder="AI akan mengisi deskripsi karakter dengan sangat detail..."></textarea>
                            </div>
                        </FormSectionFrame>

                        <FormSectionFrame title="SHOT 1: The Introduction">
                             <div className="grid grid-cols-1 gap-5">
                                 <div>
                                     <InputLabel htmlFor="shot1-camera-select">Pilihan Kamera</InputLabel>
                                     <select id="shot1-camera-select" value={shot1Camera} onChange={e => setShot1Camera(e.target.value)} className="form-select">
                                         {CAMERA_SHOT_OPTIONS_SHOT1.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                                     </select>
                                 </div>
                                 <div>
                                     <InputLabel htmlFor="shot1-action-input">Aksi & Adegan (Shot 1)</InputLabel>
                                     <textarea id="shot1-action-input" value={shot1Action} onChange={e => setShot1Action(e.target.value)} rows={3} className="form-textarea custom-scrollbar" placeholder="AI akan mengisi ide adegan untuk Shot 1..."></textarea>
                                 </div>
                             </div>
                        </FormSectionFrame>

                        <FormSectionFrame title="SHOT 2: The Payoff">
                             <div className="grid grid-cols-1 gap-5">
                                 <div>
                                     <InputLabel htmlFor="shot2-camera-select">Tipe Shot (Shot 2)</InputLabel>
                                     <select id="shot2-camera-select" value={shot2Camera} onChange={e => setShot2Camera(e.target.value)} className="form-select">
                                         {CAMERA_SHOT_OPTIONS_SHOT2.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                                     </select>
                                 </div>
                                 <div>
                                     <InputLabel htmlFor="shot2-action-input">Aksi & Adegan (Shot 2)</InputLabel>
                                     <textarea id="shot2-action-input" value={shot2Action} onChange={e => setShot2Action(e.target.value)} rows={3} className="form-textarea custom-scrollbar" placeholder="AI akan mengisi ide adegan untuk Shot 2..."></textarea>
                                 </div>
                             </div>
                        </FormSectionFrame>
                        
                        <FormSectionFrame title="Dialog & Gaya Visual">
                            <div>
                                <InputLabel htmlFor="dialogue-details-input">Dialog (Keseluruhan)</InputLabel>
                                <textarea id="dialogue-details-input" value={dialogueDetails} onChange={e => setDialogueDetails(e.target.value)} rows={2} className="form-textarea custom-scrollbar" placeholder="AI akan mengisi ide dialog..."></textarea>
                            </div>
                             <div>
                                <InputLabel htmlFor="visual-details-input">Gaya Visual (Keseluruhan)</InputLabel>
                                <input type="text" id="visual-details-input" value={visualDetails} onChange={e => setVisualDetails(e.target.value)} className="form-input" placeholder="Contoh: Cinematic, natural light..." />
                            </div>
                        </FormSectionFrame>

                        <FormSectionFrame title="Opsi Teks Layar">
                            <div className="flex items-center mb-4">
                                <input 
                                    type="checkbox" 
                                    id="use-on-screen-text-checkbox" 
                                    checked={useOnScreenText} 
                                    onChange={e => setUseOnScreenText(e.target.checked)} 
                                    className="h-4 w-4 text-indigo-600 border-slate-400 rounded focus:ring-indigo-500 focus:ring-offset-1 focus:ring-offset-white" 
                                />
                                <label htmlFor="use-on-screen-text-checkbox" className="ml-2 block text-sm text-slate-700 font-medium">
                                    Gunakan Teks di Layar (Slogan/CTA)?
                                </label>
                            </div>
                             <div className={`grid grid-cols-1 md:grid-cols-2 gap-5 transition-opacity duration-300 ${useOnScreenText ? 'opacity-100' : 'opacity-60'}`}>
                                 <div>
                                     <InputLabel htmlFor="end-title-details-input">Teks (Slogan/CTA)</InputLabel>
                                     <input 
                                        type="text" 
                                        id="end-title-details-input" 
                                        value={endTitleDetails} 
                                        onChange={e => setEndTitleDetails(e.target.value)} 
                                        className="form-input" 
                                        placeholder="Contoh: Work Smarter, Live Better." 
                                        disabled={!useOnScreenText}
                                    />
                                 </div>
                                 <div>
                                     <InputLabel htmlFor="text-placement-select">Posisi Teks</InputLabel>
                                     <select 
                                        id="text-placement-select" 
                                        value={textPlacement} 
                                        onChange={e => setTextPlacement(e.target.value)} 
                                        className="form-select"
                                        disabled={!useOnScreenText}
                                    >
                                         {TEXT_PLACEMENT_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                                     </select>
                                 </div>
                                 <div className="md:col-span-2">
                                     <InputLabel htmlFor="text-effect-select">Efek Animasi Teks</InputLabel>
                                     <select 
                                        id="text-effect-select" 
                                        value={textEffect} 
                                        onChange={e => setTextEffect(e.target.value)} 
                                        className="form-select"
                                        disabled={!useOnScreenText}
                                    >
                                         {TEXT_EFFECT_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                                     </select>
                                 </div>
                             </div>
                        </FormSectionFrame>
                    </div> 
                    <button 
                        id="generate-prompt-button"
                        onClick={generateFinalPrompt} 
                        disabled={isGeneratingPrompt}
                        className="w-full mt-8 text-white font-semibold text-base py-3.5 px-6 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-400 disabled:bg-slate-400 disabled:text-slate-100 bg-indigo-600 hover:bg-indigo-700 shadow-md hover:shadow-lg transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-150 ease-in-out"
                        aria-live="polite"
                        aria-label="Buat prompt final berdasarkan konsep yang disempurnakan"
                    >
                         {isGeneratingPrompt ? <SpinnerIcon className="w-5 h-5 inline-block mr-2" /> : null}
                         {isGeneratingPrompt ? 'Membuat Prompt...' : 'Buat Prompt Final'}
                    </button>
                </div>
            </div>
            
            <div ref={outputDetailsParentRef} className="space-y-8">
                {outputPlaceholderVisible && (
                <div id="output-placeholder-div" className="main-card flex items-center justify-center p-8 text-center min-h-[300px] sm:min-h-[400px]">
                    <div className="text-slate-500">
                         <svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="mx-auto text-slate-400 mb-4"><path d="M13.4 2H6.6A2.6 2.6 0 0 0 4 4.6V19.4A2.6 2.6 0 0 0 6.6 22h10.8a2.6 2.6 0 0 0 2.6-2.6V7.4L13.4 2z"></path><path d="M13 2v6h6"></path><path d="M16 13H8"></path><path d="M16 17H8"></path><path d="M10 9H8"></path></svg>
                        <h3 className="font-semibold text-lg text-slate-700">Prompt Profesional Anda Akan Muncul di Sini</h3>
                        <p className="text-sm mt-1.5 text-slate-500">Selesaikan langkah di atas untuk memulai.</p>
                    </div>
                </div>
                )}
                {outputLoadingVisible && (
                <div id="output-loading-div" className="main-card flex items-center justify-center p-8 text-center min-h-[300px] sm:min-h-[400px]">
                    <div className="text-slate-500" role="status" aria-live="polite">
                        <SpinnerIcon className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-5 text-indigo-600" />
                        <h3 className="font-semibold text-lg text-slate-700">Membangun Prompt Profesional...</h3>
                        <p className="text-sm mt-1.5 text-slate-500">AI sedang meracik ide-ide terbaik untuk Anda.</p>
                    </div>
                </div>
                )}
                <div id="output-container-details" className={`main-card flex flex-col transition-[max-height,opacity] duration-700 ease-[cubic-bezier(0.4,0,0.2,1)] overflow-hidden ${showOutputContainer ? 'max-h-dynamic-show opacity-100' : 'max-h-0 opacity-0'}`} aria-hidden={!showOutputContainer}>
                    <div className="px-4 py-3 bg-slate-100 border-b border-slate-300">
                        <div className="flex space-x-2" role="tablist" aria-label="Pilihan bahasa prompt">
                            <button id="tab-en" onClick={() => setActiveTab('en')} className={`flex-1 py-2.5 px-3 rounded-md text-sm font-medium transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:z-10 ${activeTab === 'en' ? 'bg-white text-indigo-700 font-semibold shadow-sm' : 'text-slate-600 hover:text-indigo-600 hover:bg-slate-200'}`} role="tab" aria-selected={activeTab === 'en'} aria-controls="prompt-en-panel">Prompt (EN)</button>
                            <button id="tab-id" onClick={() => setActiveTab('id')} className={`flex-1 py-2.5 px-3 rounded-md text-sm font-medium transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:z-10 ${activeTab === 'id' ? 'bg-white text-indigo-700 font-semibold shadow-sm' : 'text-slate-600 hover:text-indigo-600 hover:bg-slate-200'}`} role="tab" aria-selected={activeTab === 'id'} aria-controls="prompt-id-panel">Prompt (ID)</button>
                        </div>
                    </div>
                    <div className="p-5 sm:p-6 flex-grow overflow-hidden flex flex-col">
                        <div id="prompt-en-panel" className={`h-full flex-col ${activeTab === 'en' ? 'flex' : 'hidden'}`} role="tabpanel" aria-labelledby="tab-en">
                            <pre className="flex-grow whitespace-pre-wrap break-words text-sm custom-scrollbar overflow-y-auto bg-slate-100 p-4 rounded-lg font-mono text-slate-800 min-h-[350px] border border-slate-300" aria-label="Prompt Bahasa Inggris">{promptEn}</pre>
                            <button onClick={() => copyToClipboard(promptEn)} className="mt-5 w-full bg-slate-700 text-white text-sm font-semibold py-3 px-4 rounded-lg hover:bg-slate-800 transition-colors duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 transform hover:scale-[1.01] active:scale-[0.99]" aria-label="Salin prompt Bahasa Inggris ke clipboard">Salin Prompt Inggris</button>
                        </div>
                         <div id="prompt-id-panel" className={`h-full flex-col ${activeTab === 'id' ? 'flex' : 'hidden'}`} role="tabpanel" aria-labelledby="tab-id">
                            <pre className="flex-grow whitespace-pre-wrap break-words text-sm custom-scrollbar overflow-y-auto bg-slate-100 p-4 rounded-lg font-mono text-slate-800 min-h-[350px] border border-slate-300" aria-label="Prompt Bahasa Indonesia">{promptId}</pre>
                            <button onClick={() => copyToClipboard(promptId)} className="mt-5 w-full bg-slate-700 text-white text-sm font-semibold py-3 px-4 rounded-lg hover:bg-slate-800 transition-colors duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 transform hover:scale-[1.01] active:scale-[0.99]" aria-label="Salin prompt Bahasa Indonesia ke clipboard">Salin Prompt Indonesia</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div id="notification-toast" className={`fixed bottom-6 right-6 bg-emerald-600 text-white py-3 px-6 rounded-lg shadow-xl transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] transform ${showNotification ? 'translate-y-0 opacity-100' : 'translate-y-[150%] opacity-0'}`} role="alert" aria-live="assertive">
            <p className="font-semibold text-sm">Prompt berhasil disalin!</p>
        </div>
      </div>
    </div>
  );
};

export default App;
