// Function to format the date string
function formatDate(inputDate) {
  // Regular expression to extract day, month, and year
  const regex = /(\d+)(?:TH|ST|ND|RD) DAY OF (\w+), (\d{4})/i;
  const match = inputDate.match(regex);

  if (!match) {
    return "Invalid date format";
  }
  const day = match[1];
  const monthName = match[2].toUpperCase();
  const year = match[3];

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

  const month = monthMap[monthName];

  if (!month) {
    return "Invalid month name";
  }

  // Construct the formatted date string
  const formattedDate = `${day}-${month}-${year}`;

  return formattedDate;
}
module.exports = formatDate;
