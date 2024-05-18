const WordExtractor = require("word-extractor");
const fs = require("node:fs");
const path = require("node:path");
const docFilesExtractor = require("./helperFunctions/docTypeExractor");
// const text = `
// ISSUES FROM THE CAUSE(S) OF ACTION
// COMMERCIAL LAW - CONTRACTS:- A contractual transaction with an administrative agency – Action arising therefrom – Claim for specific performance - Whether subject to the limitation rule under section 2(a) of the Public Officers Protection Act
// REAL ESTATE AND PROPERTY LAW – SALE OF PROPERTY:- Claim for specific performance against party who having collected consideration refused to transfer possession of property – Where offending owner of property is a public agency – Whether can validly invoke the limitation rule under section 2(a) of the Public Officers Protection Act
// ADMINISTRATIVE AND GOVERNMENT LAW - PUBLIC OFFICER – CONTRACTS AND PUBLIC OFFICERS PROTECTION ACT: Limitation period for bringing an action against a public officer and effect of failure thereof  whether Section 2(a) of Public Officers Protection Act applies to cases of contract
// ADMINISTRATIVE AND GOVERNMENT LAW - PUBLIC OFFICER –PUBLIC OFFICERS PROTECTION ACT:- Limitation of action after the prescribed period – Date when cause of action deemed to have arisen – How determined-end!

// PRACTICE AND PROCEDURE ISSUES
// ACTION - STATEMENT OF CLAIM:- Rule that Court cannot grant a prayer outside the ones set down in a statement of claim – Duty of court thereto – Whether applies to mere phrasal difference between the order made by Court and what was prayed for in the Statement of Claim
// APPEAL – ISSUE FOR DETERMINATION:- Where Respondent offers no argument in response to an issue before the Court – Legal effect
// APPEAL – PRELIMINARY OBJECTION:- Where Respondent who filed same is absent on the hearing day despite evidence of service of hearing notice on him – Power of Court pursuant to Order 19 Rule 9(4) – Legal effect – Proper order for court to make
// EVIDENCE - EVALUATION OF EVIDENCE: Duty of trial judge to evaluate evidence – Proper exercise of – Duty of appellate court to invitation to substitute own evaluation for that of trial court
// JUDGMENT AND ORDER - AWARD OF COST:- Principles of law regarding award of cost - Discretion of the Court thereto – Proper exercise of
// JUDGMENT AND ORDER - AWARD OF COST:- Two broad categories of costs recognized by Nigerian Court – How assessed - Necessary expenses in the proceedings made by a party and the cost in terms of the litigants "time and effort in coming to Court" – How assessed - Duty of court thereto
// JURISDICTION – FCT HIGH COURT:- contractual obligation of offer and acceptance – Suit arising therefrom – Where one of the parties is a federal entity – Jurisdiction of FCT High Court thereto - Applicability of  S. 2(a) of the Public Officer Protection Act, Cap. P41 LFN. 2004.
// WORDS AND PHRASES:- “Cost of action” and “Cost filing the suit” – Whether means the same thing-end!
// CASE SUMMARY
// ORIGINATING FACTS AND CLAIMS
// The 2nd Respondent was allocated shop No. 53, Wunti Shopping Complex Bauchi through a letter of
// `;

// const regex = /([A-Z\s]+)(?=\s+(?:-|;|:))/g;
// // const regex = /\s+(?:-\s+)?([A-Z\s&]+)(?=\s+(?:-|;|:|$))/g;
// const areasOfLaw = [];
// let match;
// while ((match = regex.exec(text)) !== null) {
//   areasOfLaw.push(match[1].trim());
// }

async function processDocuments(inputDir) {
  const files = fs.readdirSync(inputDir);
  for (const file of files) {
    // check whether the file name ends with .docx
    console.log(file);
    if (file.endsWith(".doc")) {
      const fileText = await docFilesExtractor(inputDir, file);
      // console.log(fileText);
    } else {
      console.log("File type doesn't match");
    }
  }
}

const inputDirectory = "path/cases2";
processDocuments(inputDirectory);
// semantic tags
// high_profile_case

// {
//   "case_title": "A. A. Atta Nigeria Limited v. Conoil Plc",
//   "court": "The Court of Appeal of Nigeria",
//   "date": "13-04-2018",
//   "year": "2018",
//   "lex_citation": "LEX(2018)-CA/K/88/2017",
//   "suit_number": "CA/K/88/2017",
//   "other_citations_0": "2PLR/2018/1(CA)",
//   "other_citations_1": "(2018)LPELR-44705(CA)",
//   "semantic_tags_0": "Caselaw",
//   "semantic_tags_1": "legal document",
//   "semantic_tags_2": "Case",
//   "parties_0": "A. A. Atta Nigeria Limited",
//   "parties_1": "Conoil PLC",
//   "representation_appellant_0": "A.L. Hamdala",
//   "representation_appellant_1": "M.L. Kwalam",
//   "representation_appellant_2": "A.U. Lalu",
//   "representation_appellant_3": "O.L. Akpara",
//   "representation_respondent_0": "Charles Asogwa",
//   "representation_respondent_1": "Ijeoma Obadiegwu",
//   "originating_court": "High Court of Justice, Jigawa, Hadejia Judicial Division",
//   "area_of_law_0": "Alternative Dispute Resolution Law",
//   "area_of_law_1": "Real Estate and Property Law",
//   "area_of_law_2": "Contract Law"

// }
// /(?<=BETWEEN(?::))([\s\S]+?)-end!/g;
// const judgesRegex =
//   /(?<=BEFORE THEIR (?:LORDSHIPS:|JUDGES:))([A-Z\s\-,]+)\s*(?=-end!)/g;
