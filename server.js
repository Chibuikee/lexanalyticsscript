const fs = require("fs");
const path = require("path");
const MetadataProcessor = require("./helperFunctions/metadataExtractor");
const docxFilesExtractor = require("./helperFunctions/docxTypeEctractor");
const docFilesExtractor = require("./helperFunctions/docTypeExractor");
const logSaver = require("./helperFunctions/logSaver");
// Function to save metadata as JSON
function saveMetadataAsJson(metadata, outputDir) {
  const outputFilename = path.join(outputDir, `metadata.json`);

  let jsonData = {};
  if (fs.existsSync(outputFilename)) {
    const existingData = fs.readFileSync(outputFilename, "utf8");
    jsonData = JSON.parse(existingData);
  }
  console.log(metadata);
  jsonData[metadata.doc_id] = metadata;

  fs.writeFileSync(outputFilename, JSON.stringify(jsonData, null, 4));
}

// Function to process documents in a directory
async function processDocuments(inputDir, outputDir) {
  if (!fs.existsSync(outputDir)) {
    // create the directory for the output
    // mkdirp.sync(outputDir);
    fs.mkdirSync(outputDir);
  }

  const files = fs.readdirSync(inputDir);
  for (const file of files) {
    // check whether the file name ends with .docx
    const docPath = path.join(inputDir, file);
    if (file.endsWith(".docx")) {
      try {
        const fileText = await docxFilesExtractor(docPath);
        const metaData = await MetadataProcessor(docPath, fileText);
        saveMetadataAsJson(metaData, outputDir);
        console.log(`Metadata extracted and saved for: ${file}`);
      } catch (err) {
        // console.log(err);
        console.error(`Error processing ${file}: ${err.message}`);
      }
    } else if (file.endsWith(".doc")) {
      try {
        const fileText = await docFilesExtractor(docPath, file);
        // check if the text is extracted properly
        // logSaver(file, fileText);
        const metaData = await MetadataProcessor(docPath, fileText);
        saveMetadataAsJson(metaData, outputDir);
        console.log(`Metadata extracted and saved for: ${file}`);
      } catch (error) {
        console.log(error);
      }
    } else {
      console.log("File type NOT FOUND");
    }
  }
}

// input and output path
// const inputDirectory = "path/cases2";
// const inputDirectory = "path/casesG";
// const inputDirectory = "path/cases";
const inputDirectory = "path/case";
// const inputDirectory = "path/case1";
const outputDirectory = "path/to";
processDocuments(inputDirectory, outputDirectory);
