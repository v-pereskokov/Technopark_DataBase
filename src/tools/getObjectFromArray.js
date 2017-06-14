const getObjectFromArray = (data, key, value) => {
  for (let object of data) {
    if (+object[key] === value) {
      return object;
    }
  }

  return false;
};

export default getObjectFromArray;
