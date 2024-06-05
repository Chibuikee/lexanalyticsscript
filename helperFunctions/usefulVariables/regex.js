const courtsTypes = [
  /SUPREME COURT/i,
  // /IN THE SUPREME COURT OF NIGERIA/i,
  /FEDERAL SUPREME COURT/i,
  /COURT OF APPEAL/i,
  // /Court of Appeal/i,
  /FEDERAL HIGH COURT/i,
  /HIGH COURT/i,
  /QUEEN'S BENCH/i,
  /QUE.+ BENCH DIVISION/i,
  /APPEAL COURT DIVISION/i,
  /KING'S BENCH DIVISION/i,
  /KINGS COUNCIL/i,
  /APPEAL COURT/i,
  /\bPROBATE.+ DIVISION\b/i,
  // /HOUSE OF LORDS/i,
  // used because of potential spelling errors
  /HOUSE OF L\w+DS?/i,
  /DIVISIONAL COURT/i,
  /PRIVY COUNCIL/i,
  /WACA/i,
  /CHANCERY/i,
];

module.exports = { courtsTypes };
