const WordExtractor = require("word-extractor");
const fs = require("fs");
const path = require("path");

const extractor = new WordExtractor();

async function docFilesExtractor(inputDir, file) {
  try {
    const filename = path.join(inputDir, file);
    const extracted = await extractor.extract(filename);

    const outputDir = path.join(__dirname, "output");
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir);
    }

    const outputFilename = path.join(outputDir, `${file}.txt`);
    fs.writeFileSync(outputFilename, extracted.getBody());

    console.log(`Text extracted from ${file} and saved to ${outputFilename}`);
    return extracted.getBody();
  } catch (err) {
    console.error(`Error processing ${file}: ${err.message}`);
    return null;
  }
}

module.exports = docFilesExtractor;
