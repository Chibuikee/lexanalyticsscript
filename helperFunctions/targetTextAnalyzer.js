function targetTextExtractor(alphaCondition, regexes, text, startIndex) {
  let resolvedIndex = -1;
  //   if (text.search(/BEFORE THEIR LORDSHIPS/) !== -1) {
  if (text.search(alphaCondition) !== -1) {
    for (const regex of regexes) {
      const index = text.search(regex);
      if (index !== -1) {
        resolvedIndex = index;
        break;
      }
    }
  } else {
    resolvedIndex = -1;
  }

  //   console.log("resolved", resolvedIndex);
  const PtextFromIndex = text.slice(startIndex + 24, resolvedIndex);
  return PtextFromIndex;
}
module.exports = targetTextExtractor;
