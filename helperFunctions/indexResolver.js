// finds the first regex that matches and returns it's index
// deprecated for indexSorter which checks all the regex index
// and sorts in ascending returning the first
function IdentifierIndexResolver(regexes, text) {
  let resolvedIndex = -1;
  for (const regex of regexes) {
    const index = text.search(regex);
    if (index !== -1) {
      resolvedIndex = index;
      break;
    }
  }
  //   console.log("regex index found", resolvedIndex);
  return resolvedIndex;
}
module.exports = IdentifierIndexResolver;
