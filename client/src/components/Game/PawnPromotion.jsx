import React from "react";
import styles from "./PawnPromotion.module.css";

const PawnPromotion = ({images, spriteStyle, size, gameType, whiteToPlay, tile, promotePawn}) => {

  const {promotionPieces} = require("./GameTypes")[gameType]
  const choices = promotionPieces.map( piece => {
    return {...piece, 
      color: whiteToPlay? "white" : "black"
    }
  });

  return (
    <div className={styles[`${size}Wrapper`]}>
      <span className="font-weight-bold">PROMOTE PAWN:</span>

      <div className={styles.piecesBox}>

        {choices.map( (piece, idx) =>
          <div
            key={idx}
            className={styles[`${size}PromotionTile`]}
            onClick={() => promotePawn(tile, piece)}
          >
            <img
              src={images[`${whiteToPlay? "white" : "black"}${piece.type}${spriteStyle}`]}
              alt={piece.abbrev}
              className={styles[`${size}Piece`]}
            />
          </div>
        )}
        
      </div>
    </div>
  );
}

export default PawnPromotion;