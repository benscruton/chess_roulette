import React from "react";
import styles from "./PawnPromotion.module.css";

const PawnPromotion = ({images, spriteStyle, whiteToPlay, tile, promotePawn}) => {

  const choices = [
    {type: "knight", abbrev: "N"},
    {type: "bishop", abbrev: "B"},
    {type: "rook", abbrev: "R"},
    {type: "queen", abbrev: "Q"}
  ].map( piece => {
    return {...piece, 
      color: whiteToPlay? "white" : "black"
    }
  });

  return (
    <div className={styles.wrapper}>
      <span className="font-weight-bold">PROMOTE PAWN:</span>

      <div className={styles.piecesBox}>

        {choices.map( (piece, idx) =>
          <div
            key={idx}
            className={styles.promotionTile}
            onClick={() => promotePawn(tile, piece)}
          >
            <img
              src={images[`${whiteToPlay? "white" : "black"}${piece.type}${spriteStyle}`]}
              alt={piece.abbrev}
            />
          </div>
        )}
        
      </div>
    </div>
  );
}

export default PawnPromotion;