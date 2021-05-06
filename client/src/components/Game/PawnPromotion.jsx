import React from "react";
import styles from "./PawnPromotion.module.css";

const PawnPromotion = ({images, spriteStyle, whiteToPlay}) => {

    return (
        <div className={styles.wrapper}>
            <span className="font-weight-bold">PROMOTE PAWN:</span>

            <div className={styles.piecesBox}>
                <div className={styles.promotionTile}>
                    <img
                        src={images[`${whiteToPlay? "white" : "black"}knight${spriteStyle}`]}
                    />
                </div>

                <div className={styles.promotionTile}>
                    <img
                        src={images[`${whiteToPlay? "white" : "black"}bishop${spriteStyle}`]}
                    />
                </div>

                <div className={styles.promotionTile}>
                    <img
                        src={images[`${whiteToPlay? "white" : "black"}rook${spriteStyle}`]}
                    />
                </div>

                <div className={styles.promotionTile}>
                    <img
                        src={images[`${whiteToPlay? "white" : "black"}queen${spriteStyle}`]}
                    />
                </div>
            </div>
        </div>
    );
}

export default PawnPromotion;