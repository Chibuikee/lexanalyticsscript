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
