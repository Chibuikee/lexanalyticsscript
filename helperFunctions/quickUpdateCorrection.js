const path = require("path");
const fs = require("fs").promises; // Using fs promises API for asynchronous file operations
const fss = require("fs"); // Using fs promises API for asynchronous file operations
const docFilesExtractor = require("./docTypeExractor");
const docxFilesExtractor = require("./docxTypeEctractor");

async function QuickMetadataProcessor(jsonData, docPath, text) {
  const caseName = path.basename(docPath, path.extname(docPath));
  const eachCase = jsonData[caseName];
  // console.log("inside", jsonData);
  // Extract Citation
  const citationRegex = /LEX\s.*\d+\b/;
  const citationMatch = citationRegex.exec(text);
  const updatedCase = {
    ...eachCase,
    lex_citation: citationMatch ? citationMatch[0] : "",
  };

  return updatedCase;
}

async function QuickSaveMetadataAsJson(metadata, outputDir) {
  // where the file to read and update is located
  const outputFilename = path.join(outputDir, `metadata.json`);
  // console.log(metadata);
  let jsonData = {};
  if (fss.existsSync(outputFilename)) {
    const existingData = await fs.readFile(outputFilename, "utf8");
    jsonData = JSON.parse(existingData);
  }
  // console.log(metadata);
  jsonData[metadata.doc_id] = metadata;

  fs.writeFile(outputFilename, JSON.stringify(jsonData, null, 4));
  // const outputPath = path.join(outputDir, fileName + ".json");
  // await fs.writeFile(outputPath, JSON.stringify(metadata, null, 4));
}

async function quickFix(inputDir, outputDir, jsonPath) {
  try {
    // if (!fss.existsSync(outputDir)) {
    //   await fs.mkdir(outputDir);
    // }
    // console.log("path shows", path.join("../path", inputDir));
    const files = await fs.readdir(path.join("../path", inputDir));

    const jsonData = JSON.parse(await fs.readFile(jsonPath, "utf8"));
    console.log("data extracted", jsonData);
    for (const file of files) {
      const docPath = path.join("../path", inputDir, file);
      if (file.endsWith(".docx")) {
        try {
          const fileText = await docxFilesExtractor(docPath);
          const metaData = await QuickMetadataProcessor(
            jsonData,
            docPath,
            fileText
          );
          // console.log(metaData);
          await QuickSaveMetadataAsJson(metaData, outputDir, file);
          // console.log(`Metadata extracted and saved for: ${file}`);
        } catch (err) {
          console.error(`Error processing ${file}: ${err.message}`);
        }
      } else if (file.endsWith(".doc")) {
        try {
          const fileText = await docFilesExtractor(docPath, file);
          const metaData = await QuickMetadataProcessor(
            jsonData,
            docPath,
            fileText
          );
          await QuickSaveMetadataAsJson(metaData, outputDir, file);
          // console.log(`Metadata extracted and saved for: ${file}`);
        } catch (error) {
          console.error(error);
        }
      } else {
        console.log("File type NOT FOUND");
      }
    }
  } catch (error) {
    console.error("Error:", error);
  }
}

// quickFix("/case", "testednow", "testednow/metadata.json").catch(console.error);
quickFix("/cases2", "../path/to/", "../path/to/metadata.json").catch(
  console.error("it's not working")
);
module.exports = quickFix;
