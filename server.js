const fs = require("fs");
const path = require("path");
const mammoth = require("mammoth");
const formatDate = require("./helperFunctions/formatDate");

// create string for key, pair it with it's value
function createKeyAndValue(key, dataArray, metadata) {
  for (let index = 0; index < dataArray.length; index++) {
    metadata[`${key}_${index}`] = dataArray[index];
  }
}

// Function to extract metadata from a single document

function extractMetadata(docPath) {
  return new Promise((resolve, reject) => {
    mammoth
      .extractRawText({ path: docPath })
      .then((result) => {
        const text = result.value;
        const metadata = {};

        // Extract CASE TITLE
        metadata.case_title = path.basename(docPath, path.extname(docPath));
        const PstartIndex = text.search(/BETWEEN(?::)?/);
        const PstopIndex = text.search(/Respondent\(s\)-end!/);
        const PtextFromIndex = text.slice(PstartIndex, PstopIndex);
        const partiesRegex = /(\s+[A-Z \(\)]+\s?(?:-)?)/g;
        // /(?<=(\s*\d+\.\s*)?)([\s\S\(\)]*)/g;
        // const partiesRegex = /(?<=BETWEEN)(?::\s*)?([\s\S]+?)-end!/g;
        // /(?<=BETWEEN)(?::\s*)?(?:\s*\d+\.\s*)?([\s\S]+?)-end!/;
        // /BETWEEN(?:\s*\d+\.\s*)?([A-Z\s-]+)\s*(?:-\s*[A-Za-z\s\(\)]+)?\s*AND\s*([A-Z\s-]+)\s*-\s*[A-Za-z\s\(\)]+-end!/;
        // const partiesRegex = /BETWEEN\s*([\s\S]+?)-end!/;
        const partiesMatch = PtextFromIndex.match(partiesRegex);
        const ex = partiesMatch.map((item) => item.trim());
        const app = ex.slice(0, ex.indexOf("A"));
        const res = ex.slice(ex.indexOf("AND") + 1);
        createKeyAndValue("parties_0", app, metadata);
        createKeyAndValue("parties_1", res, metadata);
        // metadata.parties = partiesMatch
        //   ? removeFormating(partiesMatch[1].trim())
        //   : "";

        // Extract COURT
        const courts = [
          "SUPREME COURT",
          "FEDERAL SUPREME COURT",
          "COURT OF APPEAL",
          "FEDERAL HIGH COURT",
          "HIGH COURT",
          "QUEEN'S BENCH",
          "APPEAL COURT DIVISION",
          "KING'S BENCH DIVISION",
          "KINGS COUNCIL",
          "APPEAL COURT",
          "HOUSE OF LORDS",
          "DIVISIONAL COURT",
          "PRIVY COUNCIL",
          "WACA",
          "CHANCERY",
        ];
        metadata.court = courts.find((court) => text.includes(court)) || "";

        // Extract DATE and YEAR
        const datesRegex =
          /ON\s*(?:MONDAY|TUESDAY|WEDNESDAY|THURSDAY|FRIDAY|SATURDAY|SUNDAY),\s*THE\s*(?:\d{1,2}(?:TH|ST|ND|RD) DAY OF)?\s*(?:JANUARY|FEBRUARY|MARCH|APRIL|MAY|JUNE|JULY|AUGUST|SEPTEMBER|OCTOBER|NOVEMBER|DECEMBER),?\s*\d{4}/i;
        const datesMatches = text.match(datesRegex);
        // /[d]+(?:JANUARY|FEBRUARY|MARCH|APRIL|MAY|JUNE|JULY|AUGUST|SEPTEMBER|OCTOBER|NOVEMBER|DECEMBER)\s*\d{4}/
        const dateString = datesMatches
          ? datesMatches[0].replace("ON ", "")
          : "";
        metadata.date = formatDate(dateString);
        metadata.year = datesMatches
          ? Math.max(
              ...datesMatches.map((date) => parseInt(date.split(",")[2]))
            )
          : "";

        const suitNumberRegex = /(CA|SC)[.\/\w\s-]+\d{4}/;

        // Match the suit number using the regular expression
        const suitNumberMatch = suitNumberRegex.exec(text);

        // Extract the suit number from the match
        metadata.suit_number = suitNumberMatch ? suitNumberMatch[0] : "";

        // Extract Citation
        const citationRegex = /LEX\s.*\b\d{4}\b/;
        const citationMatch = citationRegex.exec(text);
        metadata.lex_citation = citationMatch ? citationMatch[0] : "";

        // Extract AREAS OF LAW
        const startIndex = text.indexOf("ISSUES FROM THE CAUSE(S) OF ACTION");
        const stopIndex = text.indexOf("CASE SUMMARY");
        const textFromIndex = text.slice(startIndex + 35, stopIndex);
        const arearegex = /(?<=\n+)[A-Z ]+(?=.+(?:-|:))/g;
        const allMatches = textFromIndex.match(arearegex);
        // console.log(allMatches);
        // remove leading and trailing spaces
        const cleanAreasofLaw = allMatches.map((item) => item.trim());
        // create unique areas from all the areas found
        const UniqueAreasofLaw = [...new Set(cleanAreasofLaw)];
        for (let index = 0; index < UniqueAreasofLaw.length; index++) {
          metadata[`area_of_law_${index}`] = UniqueAreasofLaw[index];
        }

        // JUDGES EXTRACTIONS
        // const JstartIndex = text.search(
        //   /(?<=BEFORE THEIR (?:LORDSHIPS:|JUDGES:))/
        // );
        // const JstopIndex = text.search(/-end!/);
        // const JtextFromIndex = text.slice(JstartIndex, JstopIndex);
        // console.log(JtextFromIndex);
        const judgesRegex =
          /(?<=BEFORE THEIR (?:LORDSHIPS:?|JUDGES:?))([A-Z\s\-,]+)\s*(?=-end!)/g;
        // const judgesRegex = /(?<=\n+)[A-Z\s\-,]+(JSC|JCA)/g;
        const matches = text.match(judgesRegex);

        // metadata.judges = matches
        //   ? matches.map((item) => item.trim().split(/\n+/)).flat()
        //   : [];
        const allJudges = matches
          ? matches.map((item) => item.trim().split(/\n+/)).flat()
          : [];
        createKeyAndValue("judge", allJudges, metadata);

        // Extract legal representation
        const repstartIndex = text.indexOf("REPRESENTATION");
        const repstopIndex = text.indexOf("ISSUES FROM THE CAUSE(S) OF ACTION");
        const reptextFromIndex = text.slice(repstartIndex, repstopIndex);
        // separate the respondent from appellant using AND
        const ArrayOfReps = reptextFromIndex.split("AND");
        const reparearegex = /(?<=\s+)[A-Z \.]+(?:ESQ\.|Esq\.)/g;
        const repApp = ArrayOfReps[0].match(reparearegex);
        const repRes = ArrayOfReps[1].match(reparearegex);
        createKeyAndValue("representation_appellant", repApp, metadata);
        createKeyAndValue("representation_respondent", repRes, metadata);

        // Generate unique doc_id
        metadata.doc_id = path.basename(docPath, path.extname(docPath));

        // Set doctype to "case"
        metadata.doctype = "case";

        resolve(metadata);
      })
      .catch((err) => reject(err));
  });
}

// Function to save metadata as JSON
function saveMetadataAsJson(metadata, outputDir) {
  const outputFilename = path.join(outputDir, `metadata.json`);

  let jsonData = {};
  if (fs.existsSync(outputFilename)) {
    const existingData = fs.readFileSync(outputFilename, "utf8");
    jsonData = JSON.parse(existingData);
  }

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
    if (file.endsWith(".docx")) {
      const docPath = path.join(inputDir, file);
      try {
        const metadata = await extractMetadata(docPath);

        saveMetadataAsJson(metadata, outputDir);
        console.log(`Metadata extracted and saved for: ${file}`);
      } catch (err) {
        // console.log(err);
        console.error(`Error processing ${file}: ${err.message}`);
      }
    }
  }
}

// input and output path
// const inputDirectory = "path/cases";
// const inputDirectory = "path/case";
const inputDirectory = "path/case1";
const outputDirectory = "path/to";
processDocuments(inputDirectory, outputDirectory);
