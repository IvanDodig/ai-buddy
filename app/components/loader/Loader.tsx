import styles from "./Loader.module.css";

const Loader = () => {
  return (
    <div className={styles.loadingContainer}>
      <div className={styles.loadingIndicator}>
        <span className={styles.dot}></span>
        <span className={styles.dot}></span>
        <span className={styles.dot}></span>
      </div>
    </div>
  );
};

export default Loader;
