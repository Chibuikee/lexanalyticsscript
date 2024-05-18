const path = require("path");
const fs = require("fs");
function logSaver(filename, file) {
  const outputDir = path.join(__dirname, "output");
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir);
  }

  const outputFilename = path.join(outputDir, `${filename}.txt`);
  fs.writeFileSync(outputFilename, file);

  console.log(`Text extracted from ${filename} and saved to ${outputFilename}`);
}
module.exports = logSaver;
