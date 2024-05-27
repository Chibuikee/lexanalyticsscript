function indexSortInAscending(regexes, text) {
  let indexesArray = [];
  for (const regex of regexes) {
    const index = text.search(regex);
    if (index !== -1) {
      indexesArray.push(index);
    }
  }
  const indexsArranged = indexesArray.sort((a, b) => a - b);
  return indexsArranged[0] ?? -1;
}
module.exports = indexSortInAscending;
