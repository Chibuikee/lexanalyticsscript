const fs = require("fs");
const path = require("path");
const mammoth = require("mammoth");
// const mkdirp = require("mkdirp");
// Helper functions
function removeFormating(item) {
  return item.replace(/\t|\n/g, " ");
}

const areatext = `
ISSUES FROM THE CAUSE(S) OF ACTION 

COMMERCIAL LAW - CONTRACTS:- A contractual transaction with an administrative agency - Action arising therefrom - Claim for specific performance - Whether subject to the limitation rule under section 2(a) of the Public Officers Protection Act 
REAL ESTATE AND PROPERTY LAW - SALE OF PROPERTY:- Claim for specific performance against party who having collected consideration refused to transfer possession of property - Where offending owner of property is a public agency - Whether can validly invoke the limitation rule under section 2(a) of the Public Officers Protection Act 
ADMINISTRATIVE AND GOVERNMENT LAW - PUBLIC OFFICER - CONTRACTS AND PUBLIC OFFICERS PROTECTION ACT: Limitation period for bringing an action against a public officer and effect of failure thereof  whether Section 2(a) of Public Officers Protection Act applies to cases of contract
ADMINISTRATIVE AND GOVERNMENT LAW - PUBLIC OFFICER -PUBLIC OFFICERS PROTECTION ACT:- Limitation of action after the prescribed period - Date when cause of action deemed to have arisen - How determined-end! 

PRACTICE AND PROCEDURE ISSUES
ACTION - STATEMENT OF CLAIM:- Rule that Court cannot grant a prayer outside the ones set down in a statement of claim - Duty of court thereto - Whether applies to mere phrasal difference between the order made by Court and what was prayed for in the Statement of Claim 
APPEAL - ISSUE FOR DETERMINATION:- Where Respondent offers no argument in response to an issue before the Court - Legal effect 
APPEAL - PRELIMINARY OBJECTION:- Where Respondent who filed same is absent on the hearing day despite evidence of service of hearing notice on him - Power of Court pursuant to Order 19 Rule 9(4) - Legal effect - Proper order for court to make 
EVIDENCE - EVALUATION OF EVIDENCE: Duty of trial judge to evaluate evidence - Proper exercise of - Duty of appellate court to invitation to substitute own evaluation for that of trial court 
JUDGMENT AND ORDER - AWARD OF COST:- Principles of law regarding award of cost - Discretion of the Court thereto - Proper exercise of 
JUDGMENT AND ORDER - AWARD OF COST:- Two broad categories of costs recognized by Nigerian Court - How assessed - Necessary expenses in the proceedings made by a party and the cost in terms of the litigants "time and effort in coming to Court" - How assessed - Duty of court thereto 
JURISDICTION - FCT HIGH COURT:- contractual obligation of offer and acceptance - Suit arising therefrom - Where one of the parties is a federal entity - Jurisdiction of FCT High Court thereto - Applicability of  S. 2(a) of the Public Officer Protection Act, Cap. P41 LFN. 2004.
WORDS AND PHRASES:- “Cost of action” and “Cost filing the suit” - Whether means the same thing-end!
CASE SUMMARY 
ORIGINATING FACTS AND CLAIMS 
The 2nd Respondent was allocated shop No. 53, Wunti Shopping Complex Bauchi through a letter of

`;
// Function to extract metadata from a single document

function extractMetadata(docPath) {
  return new Promise((resolve, reject) => {
    mammoth
      .extractRawText({ path: docPath })
      .then((result) => {
        const text = result.value;
        const metadata = {};

        // Extract CASE TITLE
        const caseTitleRegex = /BETWEEN\s*([\s\S]+?)-end!/;
        const caseTitleMatch = caseTitleRegex.exec(text);
        metadata.case_title = caseTitleMatch
          ? removeFormating(caseTitleMatch[1].trim())
          : "";

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
        metadata.date = datesMatches ? datesMatches[0].replace("ON ", "") : "";
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
        // console.log(textFromIndex);
        const arearegex = /(?<=\n+)([A-Z\s]+)(?=.+(?:-|:))/g;

        console.log(textFromIndex.match(arearegex));
        const allMatches = textFromIndex.matchAll(arearegex);
        const reRegex = /OF ACTION \n\n(.*)/;
        const regex2 = /\nACTION/;
        const areasOfLaw = [...allMatches].map(
          (match) =>
            // match[1].replace(reRegex, "$1")
            match[1]
          // .replace(reRegex, "$1").replace(regex2, "").trim()
        );
        // console.log(areasOfLaw);
        const uniqueAreas = areasOfLaw
          ? areasOfLaw.map((area) => area.trim())
          : [];

        const UniqueAreasofLaw = [...new Set(uniqueAreas)];

        for (let index = 0; index < UniqueAreasofLaw.length; index++) {
          metadata[`area_of_law_${index}`] = UniqueAreasofLaw[index];
        }
        // metadata.areas_of_law = UniqueAreasofLaw.filter((item) => item !== "");

        const judgesRegex =
          /(?:BEFORE\s+(?:THEIR\s+)?LORDSHIPS?|JUDGES)\s+([\w\s\-,&]+)\s*(?:-end!)?/g;
        const matches = text.match(judgesRegex);
        metadata.judges = matches
          ? matches
              .map((judge) =>
                judge.replace(/\n/g, "").replace("BEFORE THEIR LORDSHIPS", "")
              )
              .toString()
              .split(/,\s*/)
          : [];
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
