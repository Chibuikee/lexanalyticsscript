function targetTextExtractor(regexes, text, startIndex) {
  let resolvedIndex = -1;
  //   if (text.search(/BEFORE THEIR LORDSHIPS/) !== -1) {

  for (const regex of regexes) {
    const index = text.search(regex);
    if (index !== -1) {
      resolvedIndex = index;
      break;
    }
  }

  //   console.log("resolved", resolvedIndex);
  const PtextFromIndex = text.slice(startIndex + 24, resolvedIndex);
  return PtextFromIndex;
}
module.exports = targetTextExtractor;
