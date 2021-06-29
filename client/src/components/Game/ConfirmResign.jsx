import React from "react";
import styles from "./ConfirmResign.module.css";

const ConfirmResign = ({resign, hide}) => {
  return (
    <>
      <div className={styles.shadow}></div>
      <div className={styles.wrapper}>
        <p>Are you sure you want to resign?</p>
        <button
          className="btn btn-danger mx-1"
          onClick={resign}
        >
          Yes, resign
        </button>

        <button
          className="btn btn-warning mx-1"
          onClick={hide}
        >
          No, go back
        </button>
      </div>
    </>
  );
};

export default ConfirmResign;