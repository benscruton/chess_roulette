import React from "react";
import styles from "./PawnPromotion.module.css";

const PawnPromotion = ({images, spriteStyle, whiteToPlay, tile, promotePawn}) => {

  return (
    <div className={styles.wrapper}>
      <span className="font-weight-bold">PROMOTE PAWN:</span>

      <div className={styles.piecesBox}>
        <div
          className={styles.promotionTile}
          onClick={() => promotePawn(tile, "knight")}
        >
          <img
            src={images[`${whiteToPlay? "white" : "black"}knight${spriteStyle}`]}
            alt="N"
          />
        </div>

        <div
          className={styles.promotionTile}
          onClick={() => promotePawn(tile, "bishop")}
        >
          <img
            src={images[`${whiteToPlay? "white" : "black"}bishop${spriteStyle}`]}
            alt="B"
          />
        </div>

        <div
          className={styles.promotionTile}
          onClick={() => promotePawn(tile, "rook")}
        >
          <img
            src={images[`${whiteToPlay? "white" : "black"}rook${spriteStyle}`]}
            alt="R"
          />
        </div>

        <div
          className={styles.promotionTile}
          onClick={() => promotePawn(tile, "queen")}
        >
          <img
              src={images[`${whiteToPlay? "white" : "black"}queen${spriteStyle}`]}
              alt="Q"
          />
        </div>
      </div>
    </div>
  );
}

export default PawnPromotion;