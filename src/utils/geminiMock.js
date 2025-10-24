import 'dotenv/config';
import { GoogleGenAI } from "@google/genai";
console.log("Gemini Key:", process.env.GEMINI_API_KEY);
const client = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY, // ✅ sirf API key use hogi
});
export const callGeminiOrMock = async (fileUrl, isPdf) => {
  try {
    // ✅ Correct model (latest stable)
    const result = await client.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        {
          role: "user",
          parts: [
            {
              text: `
    You are an AI medical assistant.

    Your task:
    Analyze a medical document (either a PDF or an image) and provide a clear, structured response.

    Instructions:
    - If the file is a PDF → Read and analyze the text content.
    - If the file is an Image → First extract all visible text (using OCR logic), then analyze the extracted text for medical details.
    (File type: ${isPdf ? "PDF" : "Image"})
   Analyze document: ${fileUrl}

    

    Your analysis must include:
 
1️⃣ A short and clear summary in English (2–3 lines).  
2️⃣ A short summary in Roman Urdu (2–3 lines).  
3️⃣ Exactly 2 important questions in English that a patient might ask their doctor based on this report.  
4️⃣ Exactly 2 important questions in Roman Urdu that a patient might ask their doctor based on this report.  
5️⃣ End note (exactly): "Always consult your doctor before making any medical decisions."

Please format your response exactly using these numbers (1️⃣, 2️⃣, 3️⃣, 4️⃣, 5️⃣).
    Guidelines:
    - Be concise and avoid extra explanation.
    - Detect report type (e.g., Blood Test, X-Ray, MRI, etc.)
    - Highlight any key readings, observations, or findings if available.
    - Ignore decorative or non-medical text like logos, headers, or page numbers.

    Respond only with the requested sections in clean and readable format.
    `

            },
          ],
        },
      ],
    });
    // console.log(result.candidates?.[0]?.content?.parts?.[0]?.text || "No text found", "result is here ")


    const text = result.candidates?.[0]?.content?.parts?.[0]?.text
    // Summaries
    const summary_en = (text.match(/1️⃣[\s\S]*?2️⃣/) || [])[0]?.replace(/1️⃣|2️⃣/gi, "").trim() || ""

    const summary_roman = (text.match(/2️⃣[\s\S]*?3️⃣/) || [])[0]?.replace(/2️⃣|3️⃣/gi, "").trim() || "";

    const englishBlock = (text.match(/3️⃣[\s\S]*?4️⃣/) || [])[0]?.replace(/3️⃣|4️⃣/gi, "").trim() || "";

    const romanBlock = (text.match(/4️⃣[\s\S]*?5️⃣/) || [])[0]?.replace(/4️⃣|5️⃣/gi, "").trim() || "";
    // ✅ Return structured response
    return {
      summary_en: summary_en || "No English summary found.",
      summary_roman: summary_roman || "No Roman Urdu summary found.",
      questions_en: englishBlock || [],
      questions_roman: romanBlock || [],
      note: "Always consult your doctor before making any medical decisions.",
    };
  } catch (error) {
    // console.error("❌ Gemini API Error:", error);
    return {
      summary_en: "AI summary could not be generated.",
      summary_roman: "AI summary generate nahi ho saki.",
      questions: [
        "Doctor se confirm karun ke report bilkul theek hai?",
        "Agle test ke liye mujhe kab ana chahiye?",
        "Diet ya medicine mai koi change zarurat hai kya?",
      ],
    };
  }
};




// You are an AI medical assistant.
// Analyze the document at this link: ${fileUrl}
