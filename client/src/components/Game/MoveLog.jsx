import React from "react";

const MoveLog = ({moves}) => {

  return (
    <div className="col-sm-10 col-md-8 col-lg-6 mx-auto">
      <h3>Moves:</h3>
      <table className="table-bordered table-striped w-100">
        <thead>
          <tr>
            <th>White:</th>
            <th>Black:</th>
          </tr>
        </thead>
        <tbody>
        {moves.map( (movePair, i) =>
            <tr key={i}>
              <td>{movePair[0]}</td>
              <td>{movePair.length === 1 ? "" : movePair[1]}</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default MoveLog;