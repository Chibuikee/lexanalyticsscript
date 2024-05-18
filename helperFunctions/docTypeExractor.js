const WordExtractor = require("word-extractor");

const extractor = new WordExtractor();

async function docFilesExtractor(inputDir, file) {
  try {
    const extracted = await extractor.extract(inputDir);
    return extracted.getBody();
  } catch (err) {
    console.error(`Error processing ${file}: ${err.message}`);
    return null;
  }
}

module.exports = docFilesExtractor;
