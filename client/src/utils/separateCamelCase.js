const separateCamelCase = str => {
  let output = str.split("")
    .map(char => char === char.toLowerCase() ? char : " " + char);
  output[0] = output[0].toUpperCase();
  return output.join("");
}

export default separateCamelCase;