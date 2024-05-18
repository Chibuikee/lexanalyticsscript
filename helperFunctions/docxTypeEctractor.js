const mammoth = require("mammoth");
async function docxFilesExtractor(docPath) {
  try {
    // console.log("started extracting docx", docPath);
    const extracted = await mammoth.extractRawText({ path: docPath });
    return extracted.value;
  } catch (error) {
    console.log("error extracting docx text", error);
  }
}
module.exports = docxFilesExtractor;
