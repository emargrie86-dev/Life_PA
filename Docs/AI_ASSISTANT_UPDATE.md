# Update Request: Document Upload + Parsing (Cohere Integration)

**Status:** ✅ IMPLEMENTED - October 21, 2025  
**Documentation:** See [DOCUMENT_CLASSIFICATION_UPDATE.md](./DOCUMENT_CLASSIFICATION_UPDATE.md) for full details

## Goal:
Update my existing app so that when a user uploads a document (PDF, DOCX, or image), the app:
1. Detects the **document type** (invoice, utility bill, contact, etc.) ✅
2. Extracts key info: ✅
   - Sender (e.g., "Thames Water", "Local Council") ✅
   - Relevant dates (issue, billing, due) ✅
   - Amount due (if applicable) ✅

---

## Implementation Steps:

### 1. **Frontend**
- No changes needed to UI (the current upload functionality remains the same).

---

### 2. **Backend**
Create or update an `/api/upload` endpoint that:
1. Accepts an uploaded file (PDF, DOCX, or image) using `multer` (Node.js).
2. Converts the document to text:
   - **PDF** → use `pdf-parse`
   - **DOCX** → use `mammoth` or `docx`
   - **Image** → use `tesseract.js` for OCR
3. Sends the extracted text to Cohere for classification and extraction.

---

### 3. **Cohere Integration**

Use **two Cohere models** for optimal results:

#### **A. Classification Step**
Use `command-r` to detect the type of document:

```js
const classifyResponse = await cohere.classify({
  model: "command-r",
  inputs: [text],
  examples: [
    { text: "Invoice from Thames Water", label: "Invoice" },
    { text: "Council Tax Bill", label: "Utility Bill" },
    { text: "MOT test certificate", label: "MOT Document" },
    { text: "Contact card from John Smith", label: "Contact" },
  ],
});
const documentType = classifyResponse.classifications[0].prediction;
