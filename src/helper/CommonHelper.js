import crypto from "crypto";
import jwt from "jsonwebtoken";
import Tesseract from "tesseract.js";
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const pdfParse = require("pdf-parse");

// Generate Code For Veriications
export const generateCode = (length = 6) => {
  const max = 10 ** length;
  const code = parseInt(crypto.randomBytes(4).toString("hex"), 16) % max;
  return code.toString().padStart(length, "0"); // 💡 Ensures fixed length
};

// Generate JWT Token
export const generateToken = (user) => {
  return jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: "1d",
  });
};




export const isMedicalContent = async (buffer, mimetype, reportType, reportTitle) => {
  let extractedText = "";
  let pdfText = ""

  try {
    if (mimetype.includes("pdf")) {
      // 🧾 Extract text from PDF
      const pdfData = await pdfParse(buffer);
      pdfText = pdfData.text.toLowerCase();
      extractedText = pdfData.text.toLowerCase();
    } else if (mimetype.includes("image")) {
      // 🖼️ Extract text from image
      const result = await Tesseract.recognize(buffer, "eng");
      extractedText = result.data.text.toLowerCase();

    } else {
      console.log("Unsupported file type:", mimetype);
      return false;
    }

    // 🔍 Check for medical keywords
    // 🔍 Check for medical keywords
    const medicalKeywords = [
      // General terms
      "hospital",
      "medical",
      "patient",
      "doctor",
      "report",
      "reports",
      "health",
      "diagnosis",
      "treatment",
      "test",
      "laboratory",
      "clinical",
      "result",
      "reference range",
      "specimen",
      "impression",
      "investigation",
      "observation",
      "conclusion",
      "consultation",

      // Blood test related
      "blood",
      "hemoglobin",
      "glucose",
      "rbc",
      "wbc",
      "platelet",
      "cholesterol",
      "bilirubin",
      "creatinine",
      "urea",
      "hiv",
      "hbsag",
      "hb",
      "cbc",
      "lft",
      "rft",

      // Imaging reports
      "x-ray",
      "ct scan",
      "mri",
      "ultrasound",
      "radiology",
      "imaging",
      "echo",
      "ecg",
      "ekg",
      "film",
      "scan",
      "contrast",
      "findings",
      "radiograph",
      "sagittal",
      "axial",
      "coronal",

      // Prescription related
      "prescription",
      "rx",
      "medicine",
      "tablet",
      "capsule",
      "dosage",
      "duration",
      "mg",
      "ml",
      "before meal",
      "after meal",

      // Discharge / Surgery reports
      "discharge summary",
      "surgery",
      "procedure",
      "operation",
      "postoperative",
      "admission",
      "ward",
      "diagnosis",
      "treatment given",
      "follow up",

      // Vaccination
      "vaccine",
      "vaccination",
      "dose",
      "booster",
      "immunization",
      "covid",
      "hepatitis",
      "polio",

      // Common data fields
      "age",
      "sex",
      "male",
      "female",
      "date",
      "time",
      "id",
      "department",
      "consultant",
      reportTitle?.toLowerCase?.(),
    ];

    const isMedical = medicalKeywords.some((word) =>
      extractedText.includes(word)
    );


    const allWords = medicalKeywords.filter((word) =>
      extractedText.includes(word)
    );
    const hasTitle = extractedText.toLowerCase().includes(reportTitle.toLowerCase());
    if (!isMedical || allWords?.length < 5) {
      return { isValid: false, reason: "Only medical or hospital-related files are allowed. Upload cancelled." };
    }
    if (!hasTitle) {
      return { isValid: false, reason: "The report title does not match the content in your uploaded file." };
    }

    console.log(allWords, "extracted words");

    return { isValid: true, reason: "File is valid", pdfText };

  } catch (error) {
    console.error("Error extracting text:", error);
    return false;
  }
};
