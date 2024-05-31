const courtsTypes = [
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
  // /HOUSE OF LORDS/,
  // used because of potential spelling errors
  /HOUSE OF L\w+DS?/,
  /DIVISIONAL COURT/,
  /PRIVY COUNCIL/,
  /WACA/,
  /CHANCERY/,
];

module.exports = { courtsTypes };
