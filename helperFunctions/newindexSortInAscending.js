// NewindexSortInAscending checks all the regex indexes
// and sorts them in ascending order, returning the
// first index greater than firstIndex or the
// smallest index if firstIndex is not surpassed.

// this is an improvement from indexSorter, which
//  merely sorts in
//  ascending order and returns the smallest number
// edge cases where the index of the first
// argument of slice method is higher than the
// index of the second argument of slice method,
//  this function solves it
function NewindexSortInAscending(regexes, text, firstIndex) {
  // Array to hold all matching indexes
  let indexesArray = [];
  let regexArray = [];
  // Iterate over each regex to find its index in the text
  for (const regex of regexes) {
    const index = text.search(regex);
    // If the regex matches, add the index to the array
    if (index !== -1) {
      indexesArray.push(index);
      regexArray.push([index, regex]);
      // regexArray.push({ [index]: regex });
    }
  }
  // Sort the array of indexes in ascending order
  const sortedIndexes = indexesArray.sort((a, b) => a - b);

  // Find the first index greater than firstIndex
  let pickedIndex = sortedIndexes[0];
  if (pickedIndex !== undefined && firstIndex > pickedIndex) {
    pickedIndex = sortedIndexes.find((item) => item > firstIndex);
  }
  let regexPicked;

  regexArray.forEach((item) => {
    if (item[0] == pickedIndex) {
      regexPicked = item[1];
    }
  });
  // console.log("regex array", pickedIndex);
  // Return the picked index or -1 if no valid index is found
  if (pickedIndex !== undefined) {
    return { pickedIndex, regexPicked };
  } else {
    return { pickedIndex: -1, regexPicked: null };
  }
}

module.exports = NewindexSortInAscending;
