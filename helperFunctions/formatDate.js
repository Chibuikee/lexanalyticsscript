// Function to format the date string
function formatDate(inputDate) {
  // Regular expression to extract day, month, and year
  const regex = /(\d+)(?:TH|ST|ND|RD)?.+(\w+).+(\d{4})/i;
  // const regex = /(\d+)(?:TH|ST|ND|RD) DAY OF (\w+), (\d{4})/i;
  const match = inputDate.match(regex);

  if (!match) {
    return "Invalid date format";
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
