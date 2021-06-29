import React from "react";

const DrawOffer = ({loggedIn, offeredTo, playerWhite, playerBlack, endGame, offerDraw}) => {
  let offerer, offeree;
  if(offeredTo === playerWhite._id){
    offerer = playerBlack;
    offeree = playerWhite;
  } else {
    offerer = playerWhite;
    offeree = playerBlack;
  }

  return (
    <>
      <p>{offerer.userName} offered a draw to {offeree.userName}</p>

      {offeree._id === loggedIn._id ?
        <>
          <button
            className="btn btn-success mx-1"
            onClick={() => endGame("Players agreed to a draw.")}
          >
            Accept draw
          </button>

          <button
            className="btn btn-danger mx-1"
            onClick={e => offerDraw(e, true)}
          >
            Reject draw
          </button>
        </>
        :
        <></>
      }
      
      {offerer._id === loggedIn._id && offeree._id !== loggedIn._id ?
        <button
          className="btn btn-danger mx-1"
          onClick={e => offerDraw(e, true)}
        >
          Rescind offer
        </button>
        :
        <></>
      }
    </>
  );
}

export default DrawOffer;