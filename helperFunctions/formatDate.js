// Function to format the date string
const NewindexSortInAscending = require("./newindexSortInAscending");
const textLengthChecker = require("./textLength");

const courts = [
  /SUPREME COURT/,
  /FEDERAL SUPREME COURT/,
  /COURT OF APPEAL/,
  /FEDERAL HIGH COURT/,
  /HIGH COURT/,
  /QUEEN'S BENCH/,
  /QUEEN'S BENCH DIVISION/,
  /APPEAL COURT DIVISION/,
  /KING'S BENCH DIVISION/,
  /KINGS COUNCIL/,
  /APPEAL COURT/,
  /\bPROBATE.+ DIVISION\b/,
  // /HOUSE OF LORDS/,
  // used because of potential spelling errors
  /HOUSE OF L\w+DS?/,
  /DIVISIONAL COURT/,
  /PRIVY COUNCIL/,
  /WACA/,
  /CHANCERY/,
];

function formatDate(inputDate, text) {
  // Regular expression to extract day, month, and year
  const regex = /(\d+)(?:TH|ST|ND|RD)?.+(\w+).+(\d{4})/i;
  // const regex = /(\d+)(?:TH|ST|ND|RD) DAY OF (\w+), (\d{4})/i;
  const match = inputDate.match(regex);
  // 31/5/2024 updated the code to get just the text
  // between the boundaries set and pickt he date from it
  if (!match) {
    const startIndex = NewindexSortInAscending(courts, text);

    const endIndex = text.search(/LEX\s.*\d+\b/);

    const extracteddate = text.slice(
      startIndex.pickedIndex +
        textLengthChecker(text.match(startIndex.regexPicked)) ?? 4,
      endIndex
    );
    if (extracteddate) {
      inputDate = extracteddate;
    } else {
      return "Invalid date format";
    }
    // console.log("date extracted", extracteddate);
  }

  const day = inputDate.match(/\b\d{1,2}(?=TH|ST|ND|RD)?/);

  const monthName = inputDate.match(
    /(JANUARY|FEBRUARY|MARCH|APRIL|MAY|JUNE|JULY|AUGUST|SEPTEMBER|OCTOBER|NOVEMBER|DECEMBER)/
  );
  // console.log("Date format giving error", day, inputDate);

  const year = inputDate.match(/(\d{4})/);

  const monthMap = {
    JANUARY: 1,
    FEBRUARY: 2,
    MARCH: 3,
    APRIL: 4,
    MAY: 5,
    JUNE: 6,
    JULY: 7,
    AUGUST: 8,
    SEPTEMBER: 9,
    OCTOBER: 10,
    NOVEMBER: 11,
    DECEMBER: 12,
  };

  const month = monthName ? monthMap[monthName[0]] : "invalid";

  // if (!month) {
  //   return "Invalid month name";
  // }

  // Construct the formatted date string .toUpperCase()
  const formattedDate = `${day && day[0]}-${month}-${year && year[0]}`;

  return formattedDate;
}
module.exports = formatDate;
