import {useState} from "react";

const UtilFunctionTests = () => {
  const [test, setTest] = useState(0);

  // const importedFunctions = require("./MoveLogic").standardChess.clickTileUtils;


  // const increase = () => importedFunctions.add(test, setTest);
  // const decrease = () => importedFunctions.subtract(test, setTest);

  return (
    <>
      <p>{test}</p>
      <button onClick={() => setTest(test + 1)}>add</button>
      {/* <button onClick={increase}>
        increase
      </button>
      <button onClick = {decrease}>
        decrease
      </button> */}
    </>
  );
}

export default UtilFunctionTests;