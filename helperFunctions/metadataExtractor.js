const formatDate = require("./formatDate");
const path = require("path");
// const targetTextAnalyzer = require("./targetTextAnalyzer");
const IdentifierIndexResolver = require("./indexResolver");
const indexSortInAscending = require("./indexSorter");
const NewindexSortInAscending = require("./newindexSortInAscending");
const logSaver = require("./logSaver");
const textLengthChecker = require("./textLength");
const RegexVariable = require("./usefulVariables/regex");
// const { deprecate } = require("util");
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
    "Court of Appeal",
    "FEDERAL HIGH COURT",
    "HIGH COURT",
    "COURT OF APPEAL, CIVIL DIVISION",
    "QUEEN'S BENCH",
    "QUEEN'S BENCH DIVISION",
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
  // updated to "LEX\s?.*\d\w?". issue is that it can match more than lex citation, if this happens implement
  // a condition that if the lex citation is more than 24 characters then match using LEX\s?.*\d\w
  const LexCitationRegex = /LEX\s?.*\d\w?/;
  // updated to "LEX\s?.*\d\w\b", using \d\w\b ensures a number followed by number or letter at the end.
  // this should be the best but it won't match one digit alone it must be two digits or a digit and letter
  // const LexCitationRegex = /LEX\s?.*\d\w\b/;
  // fisrt path enforces the presence of "/" while the second insists on
  //  whole number without any letter to the number at the end
  // having the first regex before the second ensures that it doesn't stop at LEX (234), leaving the rest of it.
  // this matches words or sentence after the lex number that is on thesame line
  // const LexCitationRegex = /(LEX\s?.*\/\d+|LEX\s?.*\/?\d+\b)/;
  // won't match if a letter is attached to the last digit
  // const LexCitationRegex = /LEX\s?.*\d+\b/;
  // Extract CASE TITLE
  metadata.case_title = path.basename(docPath, path.extname(docPath));

  // PARTIES EXTRACTION
  const PstartIndex = text.search(/(?:BETWEEN)(?::)?/);
  // const PstopIndex = text.search(/ORIGINATING COURT/);
  // const PstopIndex2 = text.search(/REPRESENTATION/);
  // const PstopIndex3 = text.search(/\bISSUE.+ OF ACTION\b/);
  // // const PstopIndex = text.search(/Respondent\(s\)-end!/);
  // const resolvedPIndex =
  //   PstopIndex !== -1
  //     ? PstopIndex
  //     : PstopIndex2 !== -1
  //     ? PstopIndex2
  //     : PstopIndex3;

  const regexes = [
    // /(?:BETWEEN)(?::)?/,
    /BEFORE THEIR LORDSHIP/,
    /ORIGINATING COURT/,
    /ORIGINATING/,
    /REPRESENTATION/,
    /REPRESENTATIVE/,
    /\bISSUE.+ OF ACTION\b/,
    /Solicitor/,
  ];

  let resolvedPIndex = -1;
  // BETWEEN must be present before this code
  //  runs else just use IN THE to determine the stop index
  if (text.search(/(?:BETWEEN)(?::)?/) !== -1) {
    resolvedPIndex = NewindexSortInAscending(regexes, text, PstartIndex);
  } else {
    // console.log("ran");
    // these indexes are used only when the starting regex is not found
    // dont use when starting regex is found and dont remove this logic
    const indexes = [
      /IN THE /i,
      /COURT OF APPEAL/i,
      /SUPREME COURT/i,
      /PRIVY COUNCIL/i,
      /HOUSE OF LORDS/i,
      /HOUSE OF L\w+DS?/i,
      /REPRESENTATION/i,
    ];

    resolvedPIndex = NewindexSortInAscending(indexes, text, PstartIndex);
  }

  // console.log(resolvedPIndex);
  const PtextFromIndex = text.slice(
    PstartIndex + 7,
    resolvedPIndex.pickedIndex
  );
  // console.log(PtextFromIndex, PstartIndex, resolvedPIndex);
  const partiesRegex = /\b[A-Z][A-Z .-]+\b/g;
  const partiesMatch = PtextFromIndex.match(partiesRegex);
  // console.log(PtextFromIndex);
  const ex = partiesMatch?.map((item) => item.trim());

  if (PstartIndex == -1) {
    // this regex is used to match every name except V or V.
    const regex = /\b[A-Z]+.{3,}[A-Z]\b/g;
    const partiesMatch = PtextFromIndex.match(regex);
    // console.log("names found", partiesMatch);
    createKeyAndValue("parties_0", [partiesMatch[0]], metadata);
    createKeyAndValue("parties_1", [partiesMatch[1]], metadata);
  } else {
    // names before and is used for appellant while names after respondent
    const app = ex?.slice(0, ex.indexOf("AND"));
    const res = ex?.slice(ex.indexOf("AND") + 1);
    createKeyAndValue("parties_0", app, metadata);
    createKeyAndValue("parties_1", res, metadata);
  }

  // metadata.parties = partiesMatch
  //   ? removeFormating(partiesMatch[1].trim())
  //   : "";

  // Extract COURT

  const courtsIndexes = [LexCitationRegex, /(OTHER )?CITATIONS?/];
  const CourtEndIndex = NewindexSortInAscending(courtsIndexes, text);

  const extractedCourt = text.slice(0, CourtEndIndex.pickedIndex);
  // console.log(extractedCourt);
  // RegexVariable.courtsTypes.
  let PickedCourt = [];
  for (const regex of RegexVariable.courtsTypes) {
    const court = extractedCourt.match(regex);
    // If the regex matches, add the index to the array
    if (court !== null) {
      PickedCourt = court;

      break;
      // regexArray.push({ [index]: regex });
    }
  }
  // console.log("matched", PickedCourt);
  metadata.court =
    PickedCourt[0] ?? (courts.find((court) => text.includes(court)) || "");

  // Extract DATE and YEAR
  const datesRegex =
    /\b\d+(TH|ST|ND|RD)?.+(JANUARY|FEBRUARY|MARCH|APRIL|MAY|JUNE|JULY|AUGUST|SEPTEMBER|OCTOBER|NOVEMBER|DECEMBER).+\d{4}\b/;
  // /(ON\s*)?(?:MONDAY|TUESDAY|WEDNESDAY|THURSDAY|FRIDAY|SATURDAY|SUNDAY)?,?(\s*THE\s*)?(?:\d{1,2}(?:TH|ST|ND|RD) DAY OF)?\s*(?:JANUARY|FEBRUARY|MARCH|APRIL|MAY|JUNE|JULY|AUGUST|SEPTEMBER|OCTOBER|NOVEMBER|DECEMBER),?\s*\d{4}/i;
  const datesMatches = text.match(datesRegex);

  const dateString = datesMatches ? datesMatches[0].replace("ON ", "") : "";
  const completeDate = formatDate(dateString, text);
  // console.log(completeDate);
  // come back and find a solution for no date
  // checking for -null ensures that when accessing completeDate using regex it doesn't throw error
  const year =
    completeDate.includes("-null") || completeDate === "Invalid date format"
      ? "No Year"
      : completeDate.match(/\d{4}/)[0];

  metadata.date = completeDate;
  // metadata.year = completeDate ? parseInt(completeDate?.split("-")[2]) : year;
  metadata.year = year;

  // SUIT NUMBER EXTRACTION

  const regexesForSuitNoStop = [/LEX\s?.*/, /(OTHER )?CITATIONS?/, /BEFORE/];
  const SuitNoEndIndex = NewindexSortInAscending(regexesForSuitNoStop, text);

  const extractedSuitNoText = text.slice(0, SuitNoEndIndex.pickedIndex);
  // console.log(extractedSuitNoText);
  // const suitNumberRegex = /(M|CA|SC|S.C|(\(\d+\)))[.\/\w\s-]+\d\b|^\[\d+\].+/m;
  // (\(\d+\)) this captures suit number that start with (number inside)
  //  this does not account for suit numbers starting with []
  const suitNumberRegex =
    /(M\/|CA|SC|S.C|HD\/|LD\/|(\(\d+\)))[.\/\w\s-]+\d\w?\b|^\[\d+\].+/;

  // Match the suit number using the regular expression
  const suitNumberMatch = extractedSuitNoText.match(
    // text.slice(0, text.search(/(LEX|OTHER)/))
    suitNumberRegex
  );
  // console.log(suitNumberMatch[0], suitNumberMatch);
  // Extract the suit number from the match
  metadata.suit_number = suitNumberMatch
    ? suitNumberMatch[0].split(/\n/)[0]
    : "";

  // Extract Citation
  const citationRegex = LexCitationRegex;
  const citationMatch = citationRegex.exec(text);
  metadata.lex_citation = citationMatch ? citationMatch[0] : "";

  // other citation numbers
  const otherCitstartIndex = text.search(/(OTHER )?CITATIONS?/);
  // const otherCitstopIndex = text.search(/BEFORE THEIR LORDSHIPS?/);
  let resolvedOtherCitStop = -1;
  const regexothercitStop = [
    /BEFORE THEIR LORDSHIPS?/,
    /BEFORE HIS LORDSHIP/,
    /BEFORE/,
    /BETWEEN/,
    /ORIGINATING COURT(\(S\))?/,
    // ...RegexVariable.courtsTypes,
  ];
  // if (otherCitstopIndex == -1) {
  resolvedOtherCitStop = NewindexSortInAscending(
    regexothercitStop,
    text,
    otherCitstartIndex
  );
  // }
  const otherCittextFromIndex = text.slice(
    otherCitstartIndex,
    // otherCitstopIndex == -1?

    resolvedOtherCitStop?.pickedIndex
    // : otherCitstopIndex
  );
  // console.log(
  //   "citation",
  //   otherCitstartIndex,
  //   otherCitstopIndex,
  //   resolvedOtherCitStop
  // );
  const citeRegex = /(?<=\n+)(.+)/g;
  const listOfCitations = otherCittextFromIndex.match(citeRegex);
  // console.log("nodeeee", listOfCitations);
  createKeyAndValue("other_citations", listOfCitations, metadata);

  // Extract AREAS OF LAW
  // ISSUES FROM THE CAUSE(S) OF ACTION

  const areaRegexStart = [
    /\bISSUE.+ OF ACTIONS?\b/,
    /\bMAIN ISSUES?\b/,
    /PRACTICE AND PROCEDURE ISSUES/,
    /SUBSTANTIVE LEGAL AND POLICY ISSUES?/,
  ];
  const arearesolvedIndex = NewindexSortInAscending(areaRegexStart, text);

  const areaRegexStop = [/CASE SUMMARY/, /MAI?N JUDGE?MENT/];
  const arearesolvedIndexStop = NewindexSortInAscending(
    areaRegexStop,
    text,
    arearesolvedIndex
  );

  // first check if case summary is available else use main judgment
  const textFromIndex = text.slice(
    arearesolvedIndex.pickedIndex +
      textLengthChecker(text.match(arearesolvedIndex.regexPicked)) ?? 24,

    // arearesolvedIndex + 35,
    arearesolvedIndexStop.pickedIndex
  );
  // console.log("respondents", textFromIndex);
  const arearegex = /(?<=\n+)[A-Z ]+(?=.+(?:-|:))/g;
  const allMatches = textFromIndex.match(arearegex);
  // console.log(allMatches);
  // remove leading and trailing spaces
  const cleanAreasofLaw = allMatches?.map((item) => item.trim());
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
  const JstartRegex = [/\bBEFORE.*(LORDSHIPS?:?|JUDGES?:?)\b/, /\bBEFORE:/];

  const JstartIndex = NewindexSortInAscending(JstartRegex, text);
  // text.search(JstartRegex) == -1 ? JstartRegex1 : JstartRegex;
  // determines last index to slice text
  const Jregexes = [
    /BETWEEN/,
    /REPRESENTATION/,
    /ORIGINATING COURT/,
    /\bISSUE.+ OF ACTION\b/,
  ];
  // console.log("HIII", JstartIndex);
  const JresolvedIndex = NewindexSortInAscending(
    Jregexes,
    text,
    JstartIndex.pickedIndex
  );
  const cutText = text.slice(
    // textLengthChecker: In order to get the exact length of the word and add it to the starting regex index
    // this ensures that the slicing starts from the write number after the identifying word
    JstartIndex.pickedIndex +
      textLengthChecker(text.match(JstartIndex.regexPicked)) ?? 24,
    JresolvedIndex.pickedIndex
  );
  // logSaver("testingnow", cutText);
  // console.log("testingnow", cutText);

  const judgesRegex =
    /(\b[A-Z].+(SC|CA|S.C|C.A|N|J|LC)\b|\b(LORD|[A-Z]+).+[A-Z]{4,}\b)/g;
  //  use but does not match names with jca jsc ca exitCode.
  // const judgesRegex = /(\b[A-Z].+(SC|CA|S.C|C.A|N|J)\b)/g;
  const matches = cutText.match(judgesRegex);
  const allJudges = matches
    ? matches.map((item) => item.trim().split(/\n+/)).flat()
    : [];
  createKeyAndValue("judge", allJudges, metadata);

  // Extract LEGAL REPRESENTATION
  const startRegexRep = [/REPRESENTATIONS?/, /REPRESENTATIVE/, /Solicitor/];
  // const repstartIndex = text.search(startRegexRep);
  const resolvedRepstart = NewindexSortInAscending(startRegexRep, text);
  // const repstopIndex = text.search(/\bISSUE.+ OF ACTIONS?\b/);

  // if (repstartIndex !== -1) {
  const regexreStopRep = [
    /PRACTICE AND PROCEDURE ISSUES/,
    /\bISSUE.+ OF ACTIONS?\b/,
    /BEFORE/,
    /MAI?N JUDGE?MENT/,
    /MAIN ISSUES?/,
    /ORIGINATING COURT/,
    /ISSUES FOR DETERMINATION/,
    /SUBSTANTIVE LEGAL AND POLICY ISSUES/,
    /ISSUES? FROM  CAUSE/,
  ];
  let resolvedRepstop = -1;
  // if (repstopIndex == -1) {
  resolvedRepstop = NewindexSortInAscending(
    regexreStopRep,
    text,
    resolvedRepstart.pickedIndex
  );

  // }
  let reptextFromIndex = "Representation Not Found";
  if (resolvedRepstop?.pickedIndex !== -1) {
    reptextFromIndex = text
      .slice(
        resolvedRepstart.pickedIndex +
          textLengthChecker(text.match(resolvedRepstart.regexPicked)) ?? 14,
        resolvedRepstop?.pickedIndex
        // repstopIndex == -1 ? resolvedRepstop : repstopIndex
        // this removes everything in a bracket e.g (for A A MOCATTA on war service)
      )
      ?.replace(
        // anything inside a parentheses is omitted
        // now updated to exclude parentheses that starts with "with me"
        /\((?!with him\b)[^()]*\)|solicitors?|LAWYERS?|respondents?|Applicants|\bfor\b|\bthe\b|Barrister|Appellants?|\bwith\b/gi,
        ""
      );
  }
  // console.log(reptextFromIndex);
  // separate the respondent from appellant using AND
  //  updated to using regex AND instead of text AND
  // this is because AND as a text matches any and not just and as a word
  const ArrayOfReps = reptextFromIndex.split(/\bAND\b/);
  // .filter((item) => item !== "\n");
  // console.log(ArrayOfReps[1]);
  //   worked for ATTORNEY-GENERAL, OGUN STATE V. ALHAJI AYINKE ABERUAGBA
  //  this captures lower case names
  // (\b[A-Z]*(\w[ a-z.]+)+, (Esq|SAN)\b)
  // \b[A-Z][A-Z.\s-]*\b this regex is thesame with /(\b[A-Z][A-Z.\s]+ [A-Z-.]+\b)/g
  // difference, the former matches one name or more, later matches more than one name
  // reason for using the later, to remove one later names
  // Single names are not matched for now sadly
  // const reparearegex = /(\b[A-Z][A-Z.\s]+ [A-Z-.]+\b)/g;
  // This is an improvement to the above, it matches single names
  // const reparearegex =
  //   /(\b[A-Z][A-Z.\s]+ [A-Z-.]+\b)|\b[A-Z\s]*&[\sA-Z]+|\b[A-Z]{4,}/g;
  // the above issue now resolved with the new regex and logics from filterOutword function
  const reparearegex =
    /\b[A-Z\s]*&[\sA-Z]+\b|\b([A-Z]\.\s?){0,4}([A-Z][a-z\s-]+)*([A-Z][a-z]+)(, (Esq|SAN|S.A.N))?\b|(\b[A-Z][A-Z.\s]+ [A-Z-.]+\b)|\b[A-Z]{4,}/g;
  // const reparearegex = /\b[A-Z][A-Z .-]+\b/g;
  // words that where mistakenly matched but not wanted
  const ArrayOfwordsToRemove = [
    "Esq",
    "Counsel",
    "No Legal Representation",
    "Plaintiff",
    "Defendants",
    "Defendant",
  ];
  // convert the words to lower case
  const wordsToRemoveInLowerCase = ArrayOfwordsToRemove.map((item) =>
    item.toLowerCase()
  );
  function removeItem(word) {
    const lWord = word.toLowerCase();

    return !wordsToRemoveInLowerCase.includes(lWord);
  }
  // filter out certain words that where mistakenly matched but not wanted
  const repApp = ArrayOfReps[0]?.match(reparearegex)?.filter(removeItem);

  const repRes = ArrayOfReps[1]?.match(reparearegex)?.filter(removeItem);
  // console.log(ArrayOfReps);
  if (repApp && repRes && resolvedRepstart.pickedIndex !== -1) {
    createKeyAndValue("representation_appellant", repApp, metadata);
    createKeyAndValue("representation_respondent", repRes, metadata);
    re;
    // } else if ((repApp || repRes) && resolvedRepstart.pickedIndex !== -1) {
  } else if (repApp && !repRes && resolvedRepstart.pickedIndex !== -1) {
    createKeyAndValue("representation", repApp, metadata);
  }
  // }
  // ORIGINATING COURTS
  const startOriginating = text.search(/ORIGINATING COURT(\(S\))?/);
  const regexOriginating = [
    /REPRESENTATION/,
    /\bISSUE.+ OF ACTIONS?\b/,
    /MAIN ISSUES?/,
    /SUBSTANTIVE LEGAL AND POLICY ISSUES?/,
  ];
  const ResolvedStopOriginating = indexSortInAscending(regexOriginating, text);
  // ORIGINATING COURT
  const textFromOriginating = text.slice(
    startOriginating +
      textLengthChecker(text.match(/ORIGINATING COURT(\(S\))?/)) ?? 19,
    ResolvedStopOriginating
  );
  // console.log(textFromOriginating);
  // const originatingregex = /([\w\s\S]*)/g;

  const originatingregex = /(?<=\d\.\t)(.+)/g;
  const originatingregex2 = /(.+)/g;

  let originatingallMatches =
    textFromOriginating.match(originatingregex) ??
    textFromOriginating.match(originatingregex2);
  // [0].trim().split(/\t/));
  const originatingCourts = originatingallMatches?.map((item) =>
    item.replace("-end!", "")
  );
  if (startOriginating !== -1) {
    createKeyAndValue("originating_court", originatingCourts, metadata);
  }

  // console.log("Node", ori);

  // Generate unique doc_id
  metadata.doc_id = path.basename(docPath, path.extname(docPath));

  // Set doctype to "case"
  metadata.doctype = "case";

  return metadata;
}
module.exports = MetadataProcessor;
