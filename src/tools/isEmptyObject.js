const isEmptyObject = (data) => {
  for (let key in data) {
    return false;
  }

  return true;
};

export default isEmptyObject;
