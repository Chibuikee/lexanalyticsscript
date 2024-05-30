function textLengthChecker(regexObject) {
  if (regexObject == null) {
    return null;
  } else {
    return regexObject[0].length;
  }
}
module.exports = textLengthChecker;
