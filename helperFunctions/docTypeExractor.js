const WordExtractor = require("word-extractor");
const fs = require("node:fs");
const path = require("node:path");
const extractor = new WordExtractor();
function docFilesExtractor(inputDir, file) {
  const Filename = path.join(inputDir, file);

  const extracted = extractor.extract(Filename);
  const outputAt = "path/test";
  let hiText;
  try {
    extracted.then(function (doc) {
      if (!fs.existsSync(outputAt)) {
        fs.mkdirSync(outputAt);
      }
      const outputFilename = path.join(outputAt, `metadata.js`);
      hiText = "doc.getBody()";
      fs.writeFileSync(outputFilename, doc.getBody());
    });
  } catch (err) {
    // console.log(err);
    console.error(`Error processing ${file}: ${err.message}`);
  }
  console.log(hiText);
  return hiText;
}

module.exports = docFilesExtractor;
