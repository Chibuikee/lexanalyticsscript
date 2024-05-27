const formatDate = require("./formatDate");
const path = require("path");
const targetTextAnalyzer = require("./targetTextAnalyzer");
const IdentifierIndexResolver = require("./indexResolver");
// create string for key, pair it with it's value
function createKeyAndValue(key, dataArray, metadata) {
  if (dataArray !== null) {
    // dataArray = dataArray?.slice(0, 20);

    for (let index = 0; index < dataArray?.length; index++) {
      metadata[`${key}_${index}`] = dataArray[index];
    }
  }
}

async function MetadataProcessor(docPath, text) {
  // console.log("text extracted",docPath, text);
  const metadata = {};
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
  // Extract CASE TITLE
  metadata.case_title = path.basename(docPath, path.extname(docPath));
  const PstartIndex = text.search(/(?:BETWEEN)(?::)?/);
  // const PstopIndex = text.search(/ORIGINATING COURT/);
  // const PstopIndex2 = text.search(/REPRESENTATION/);
  // const PstopIndex3 = text.search(/\bISSUE.+ OF ACTION\b/g);
  // // const PstopIndex = text.search(/Respondent\(s\)-end!/);
  // const resolvedPIndex =
  //   PstopIndex !== -1
  //     ? PstopIndex
  //     : PstopIndex2 !== -1
  //     ? PstopIndex2
  //     : PstopIndex3;

  const regexes = [
    // /(?:BETWEEN)(?::)?/,
    /ORIGINATING COURT/,
    /ORIGINATING/,
    /REPRESENTATION/,
    /\bISSUE.+ OF ACTION\b/,
  ];

  let resolvedPIndex = -1;
  // BETWEEN must be present before this code
  //  runs else just use IN THE to determine the stop index
  if (text.search(/(?:BETWEEN)(?::)?/) !== -1) {
    for (const regex of regexes) {
      const index = text.search(regex);
      if (index !== -1) {
        resolvedPIndex = index;
        break;
      }
    }
  } else {
    // console.log("ran");
    const indexes = [
      /IN THE /,
      /COURT OF APPEAL/,
      /SUPREME COURT/,
      /PRIVY COUNCIL/,
      // /REPRESENTATION/,
    ];

    resolvedPIndex = IdentifierIndexResolver(indexes, text);
  }

  // console.log(resolvedPIndex);
  const PtextFromIndex = text.slice(PstartIndex + 7, resolvedPIndex);
  // console.log(PtextFromIndex);
  const partiesRegex = /\b[A-Z][A-Z .-]+\b/g;
  const partiesMatch = PtextFromIndex.match(partiesRegex);
  const ex = partiesMatch.map((item) => item.trim());

  if (PstartIndex == -1) {
    // this regex is used to match every name except V or V.
    const regex = /\b[A-Z]+.{3,}[A-Z]\b/g;
    const partiesMatch = PtextFromIndex.match(regex);
    // console.log("names found", partiesMatch);
    createKeyAndValue("parties_0", [partiesMatch[0]], metadata);
    createKeyAndValue("parties_1", [partiesMatch[1]], metadata);
  } else {
    // names before and is used for appellant while names after respondent
    const app = ex.slice(0, ex.indexOf("AND"));
    const res = ex.slice(ex.indexOf("AND") + 1);
    createKeyAndValue("parties_0", app, metadata);
    createKeyAndValue("parties_1", res, metadata);
  }

  // metadata.parties = partiesMatch
  //   ? removeFormating(partiesMatch[1].trim())
  //   : "";

  // Extract COURT

  metadata.court = courts.find((court) => text.includes(court)) || "";

  // Extract DATE and YEAR
  const datesRegex =
    /\b\d+(TH|ST|ND|RD)?.+(JANUARY|FEBRUARY|MARCH|APRIL|MAY|JUNE|JULY|AUGUST|SEPTEMBER|OCTOBER|NOVEMBER|DECEMBER).+\d{4}\b/;
  // /(ON\s*)?(?:MONDAY|TUESDAY|WEDNESDAY|THURSDAY|FRIDAY|SATURDAY|SUNDAY)?,?(\s*THE\s*)?(?:\d{1,2}(?:TH|ST|ND|RD) DAY OF)?\s*(?:JANUARY|FEBRUARY|MARCH|APRIL|MAY|JUNE|JULY|AUGUST|SEPTEMBER|OCTOBER|NOVEMBER|DECEMBER),?\s*\d{4}/i;
  const datesMatches = text.match(datesRegex);

  const dateString = datesMatches ? datesMatches[0].replace("ON ", "") : "";
  const completeDate = formatDate(dateString);
  const year = text.match(/\d{4}/)[0];

  metadata.date = completeDate;
  // metadata.year = completeDate ? parseInt(completeDate?.split("-")[2]) : year;
  metadata.year = year;
  // (\(\d+\)) this captures suit number that start with (number inside)
  const suitNumberRegex = /(CA|SC|S.C|(\(\d+\)))[.\/\w\s-]+\d\b/;

  // Match the suit number using the regular expression
  const suitNumberMatch = suitNumberRegex.exec(
    // text.slice(0, text.search(/(LEX|OTHER)/))
    text
  );

  // Extract the suit number from the match
  metadata.suit_number = suitNumberMatch
    ? suitNumberMatch[0].split(/\n/)[0]
    : "";

  // Extract Citation
  const citationRegex = /LEX\s.*\d+\b/;
  const citationMatch = citationRegex.exec(text);
  metadata.lex_citation = citationMatch ? citationMatch[0] : "";

  // other citation numbers
  const otherCitstartIndex = text.indexOf("OTHER CITATIONS");
  const otherCitstopIndex = text.search(/BEFORE THEIR LORDSHIPS?/);
  let resolvedOtherCit = -1;
  const regexothercit = [/BEFORE HIS LORDSHIP/, /BEFORE/, /BETWEEN/];
  if (otherCitstopIndex == -1) {
    resolvedOtherCit = IdentifierIndexResolver(regexothercit, text);
  }
  const otherCittextFromIndex = text.slice(
    otherCitstartIndex,
    otherCitstopIndex == -1 ? resolvedOtherCit : otherCitstopIndex
  );
  const citeRegex = /(?<=\n+)(.+)/g;
  const listOfCitations = otherCittextFromIndex.match(citeRegex);
  // console.log("nodeeee", listOfCitations);
  createKeyAndValue("other_citations", listOfCitations, metadata);

  // Extract AREAS OF LAW
  const startIndex = text.search(/\bISSUE.+ OF ACTIONS?\b/g);
  // ISSUES FROM THE CAUSE(S) OF ACTION
  const stopIndex = text.indexOf("CASE SUMMARY");
  const stopIndex2 = text.search(/MAI?N JUDGE?MENT/);
  // first check if case summary is available else use main judgment
  const resolvedIndex = stopIndex == -1 ? stopIndex2 : stopIndex;
  const textFromIndex = text.slice(startIndex + 35, resolvedIndex);
  // console.log("respondents", resolvedIndex);
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

  // semantic_tags EXTRACTIONS
  metadata["semantic_tags_0"] = "Caselaw";
  metadata["semantic_tags_1"] = "legal document";
  metadata["semantic_tags_2"] = "Case";

  //SEMANTIC TAG FOR SUPREME COURT CASES
  if (metadata.court == "SUPREME COURT") {
    metadata["semantic-tags_3"] = "high_profile_case";
  }
  // JUDGES EXTRACTIONS
  const JstartRegex = /\bBEFORE.*(LORDSHIPS?:?|JUDGES?:?)\b/;
  const JstartRegex1 = /\bBEFORE:/;
  const alphaCondition =
    text.search(JstartRegex) == -1 ? JstartRegex1 : JstartRegex;
  // determines last index to slice text
  const Jregexes = [
    /BETWEEN/,
    /REPRESENTATION/,
    // /ORIGINATING COURT/,
    // /\bISSUE.+ OF ACTION\b/g,
  ];
  // console.log("HIII", JstartIndex);
  const cutText = targetTextAnalyzer(
    // alphaCondition,
    Jregexes,
    text,
    text.search(alphaCondition)
  );
  // console.log("text cut", cutText);
  const judgesRegex = /(\b[A-Z].+(SC|CA|S.C|C.A|N|J)\b)/g;
  const matches = cutText.match(judgesRegex);
  const allJudges = matches
    ? matches.map((item) => item.trim().split(/\n+/)).flat()
    : [];
  createKeyAndValue("judge", allJudges, metadata);

  // Extract legal representation
  const repstartIndex = text.indexOf("REPRESENTATION");

  const repstopIndex = text.search(/\bISSUE.+ OF ACTIONS?\b/g);

  if (repstartIndex !== -1) {
    let resolvedRepstop = -1;
    const regexresolvedRep = [/\bISSUE.+ OF ACTIONS\b/, /BEFORE/];
    if (repstopIndex == -1) {
      resolvedRepstop = IdentifierIndexResolver(regexresolvedRep, text);
    }

    const reptextFromIndex = text.slice(
      repstartIndex + 14,
      repstopIndex == -1 ? resolvedRepstop : repstopIndex
    );
    // separate the respondent from appellant using AND
    const ArrayOfReps = reptextFromIndex.split("AND");
    //   worked for ATTORNEY-GENERAL, OGUN STATE V. ALHAJI AYINKE ABERUAGBA
    //  this captures lower case names
    // (\b[A-Z]*(\w[ a-z.]+)+, (Esq|SAN)\b)
    const reparearegex = /(\b[A-Z][A-Z.\s]+ [A-Z-.]+\b)/g;
    // const reparearegex = /(?<=\s+)[A-Z \.]+(?:ESQ\.|Esq\.|S.A.N)/g;
    //   const reparearegex = /\b[A-Z][A-Z .-]+\b/g;
    const repApp = ArrayOfReps[0]?.match(reparearegex);
    const repRes = ArrayOfReps[1]?.match(reparearegex);

    if (repApp) {
      createKeyAndValue("representation_appellant", repApp, metadata);
    }
    if (repRes) {
      createKeyAndValue("representation_respondent", repRes, metadata);
    }
  }
  // ORIGINATING COURTS
  const startOriginating = text.indexOf("ORIGINATING COURT(S)");
  const stopOriginating = text.indexOf("REPRESENTATION");
  const textFromOriginating = text.slice(startOriginating, stopOriginating);
  // const originatingregex = /([\w\s\S]*)/g;

  const originatingregex = /(?<=\d\.\t)(.+)/g;
  // /(?<=\d\.\t)([\w\s\S]+)/g;
  // /(?<=ORIGINATING COURT\(S\)\s*\n)(.*(?:\n(?!REPRESENTATION).*)*)/;
  // /(.*(?:\n(?!REPRESENTATION).*)*)/;
  const originatingallMatches = textFromOriginating.match(originatingregex);

  // [0].trim().split(/\t/));
  const originatingCourts = originatingallMatches?.map((item) =>
    item.replace("-end!", "")
  );
  createKeyAndValue("originating_court", originatingCourts, metadata);

  // console.log("Node", ori);

  // Generate unique doc_id
  metadata.doc_id = path.basename(docPath, path.extname(docPath));

  // Set doctype to "case"
  metadata.doctype = "case";

  return metadata;
}
module.exports = MetadataProcessor;
