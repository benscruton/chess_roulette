import React from "react";
import styles from "./DrawOffer.module.css";

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
    <div className={styles.wrapper}>
      <p className="mt-1">{offerer.userName} offered a draw to {offeree.userName}</p>

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
            value={false}
            onClick={offerDraw}
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
          value={false}
          onClick={offerDraw}
        >
          Rescind offer
        </button>
        :
        <></>
      }
    </div>
  );
}

export default DrawOffer;