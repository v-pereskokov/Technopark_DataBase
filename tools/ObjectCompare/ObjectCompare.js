const objectCompare = (a, b) => {
  if (!a || !b) {
    return false;
  }

  for (let i in a) {
    if (!(i in b) || a[i] !== b[i]) {
      return false;
    }
  }
  return true;
};

module.exports.objectCompare = objectCompare;
