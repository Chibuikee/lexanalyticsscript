function filteredAndrefinedWords(
  slicedText,
  ArrayOfwordsToRemove,
  regexForWordsFirstDeleted,
  regexApplied
) {
  const result = slicedText.replace(regexForWordsFirstDeleted);
  const Rword = ArrayOfwordsToRemove.map((item) => item.toLowerCase());
  function removeItem(word) {
    const lWord = word.toLowerCase();

    return !Rword.includes(lWord);
  }
  return result.match(regexApplied).filter(removeItem);
}
module.exports = filteredAndrefinedWords;

// USAGE OF THE ABOVE FUNCTION
const text = `
Solicitor for appellant: A. L. BRYDEN.
Solicitors for respondent: ASHURST, MORRIS, CRISP & CO.
ROBERT ASKE KC and PATRICK A DEVLIN (for A A MOCATTA on war service) for the Appellants.
G ST CLAIR PILCHER KC and H G ROBERTSON (for CHARLES STEVENSON on war service) for the Respondents.
Solicitors: 
HOLMAN FENWICK & WILLAN  -for the Appellants 
PARKER GARRETT & CO - for the Respondents
C St J NICHOLSON Esq - Barrister


PICKFORD, WARRINGTON, and SCRUTTON L.JJ.

HOUSE OF LAORD REPRESENTATIVE
Dugbaya Esq., O. O. Duruaku Esq., R. O. Adakole Esq., and S. E. Aruwa Esq. - for the Appellant.
A. A. Adeniyi Esq. with M. A. Abass Esq., M. Y. Abdullahi Esq., R. O. Balogun Esq., Adetunji Osho OTHER CITATIONS Esq.,REPRESENTATION Kelechi Chris Udeoyibo Esq., Amina Zukogi, P. B. Daudu Esq., A. T. Ahmed Esq., Muzzammil Yahaya Esq., S. A. Abass Esq., S. O. Alhassan Esq., E. A. Osayomi Esq., K. C.    ed  CITATIONS Wisdom Esq., H. O. Umar, N. O. Isah, S. O. Ashiekaa Esq., Adekola Isaac Olawoye Esq., CITATION Fatima Al-Mustapha, O. J. Wada Esq., Chioma Merilyn Chuku, Adoyi Michael Esq., Steve Alabi Esq., H. M. Ibega Esq., C. C. Oyere, L. S. Mamman, Arome Abu Esq. and E. OmotayoOjo  - for the 1st Respondent. 
(\b[A-Z][A-Z.\s]+ [A-Z-.]+\b)|\b[A-Z\s]*&[\sA-Z]+|\b[A-Z]{4,}
Peter Nwatu, Esq., with him, Michael Olawale, Esq. and Chioma Ezeobika Esq. - For Appellant
AND
O. Olatawura, Esq. for 1st - 3rd Respondents.
Toyese Owoade, Esq. for the 4th Respondent. - For Respondent-end!
\b[A-Z][a-z]+ [A-Z][a-z]+. Esq\b|`;
const ArrayOfwordsToRemove = ["Esq", "Counsel"];

// this is to remove certain words from the extracted text before matching it
const regexForWordsFirstDeleted =
  /\([^()]*\)|solicitors?|respondents?|\bfor\b|\bthe\b|Appellants?|\bwith\b|Representations?/gi;
const regexApplied =
  /\b[A-Z\s]*&[\sA-Z]+\b|\b([A-Z]\.\s?){0,4}([A-Z][a-z\s-]+)*([A-Z][a-z]+)(, (Esq|SAN|S.A.N))?\b|(\b[A-Z][A-Z.\s]+ [A-Z-.]+\b)|\b[A-Z]{4,}/g;

// console.log(
//   filteredAndrefinedWords(
//     text,
//     ArrayOfwordsToRemove,
//     regexForWordsFirstDeleted,
//     regexApplied
//   )
// );
