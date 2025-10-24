import crypto from "crypto";

// 1. Secret Key & IV (same as encryption)
const secretKey = crypto.randomBytes(16); // ❗Random key = won't work for decrypting later
const iv = crypto.randomBytes(16); // ❗Random IV = won't match either

("Anas is smart");

// 2. Encrypt Function
function encrypt(text) {
  const cipher = crypto.createCipheriv("aes-128-cbc", secretKey, iv);
  let encrypted = cipher.update(text, "utf-8", "hex");
  encrypted += cipher.final("utf");
  return encrypted;
}

// 3. Decrypt Function
function decrypt(encryptedText) {
  const decipher = crypto.createDecipheriv("aes-128-cbc", secretKey, iv);
  let decrypted = decipher.update(encryptedText, "hex", "utf-8");
  decrypted += decipher.final("utf-8");
  return decrypted;
}

// 4. Run it
const encryptedText = encrypt("Anas is smart");
console.log("Encrypted:", encryptedText);

const decryptedText = decrypt(encryptedText);
console.log("Decrypted:", decryptedText);
