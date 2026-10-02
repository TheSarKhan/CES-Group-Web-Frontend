import styles from "./Waves.module.css";

/** 720 vahidlik dövrü olan dalğa; 2880 enində çəkilir ki, -50% sürüşmə tikişsiz olsun. */
function wave(y: number, a: number, invert = false) {
  const s = invert ? -1 : 1;
  const u = (k: number) => y - s * a * k;
  let d = `M0 ${y} C120 ${u(1)} 240 ${u(1)} 360 ${y}`;
  let k = -1;
  for (let x = 360; x < 2880; x += 360) {
    d += ` S${x + 240} ${u(k)} ${x + 360} ${y}`;
    k = -k;
  }
  return d;
}

const A: [number, number][] = [
  [140, 26], [210, 34], [280, 42], [350, 48], [490, 52], [560, 48], [630, 42], [700, 34], [770, 26],
];
const B: [number, number][] = [
  [245, 60], [665, 60],
];

export function Waves({ tone = "light" }: { tone?: "light" | "dark" }) {
  return (
    <div className={`${styles.waves} ${tone === "dark" ? styles.dark : ""}`} aria-hidden="true">
      <div className={`${styles.track} ${styles.a}`}>
        <svg viewBox="0 0 2880 900" preserveAspectRatio="none" fill="none">
          <g className={styles.base}>
            {A.map(([y, a]) => (
              <path key={y} d={wave(y, a)} vectorEffect="non-scaling-stroke" />
            ))}
          </g>
          <path className={styles.accent} d={wave(420, 52)} vectorEffect="non-scaling-stroke" />
        </svg>
      </div>
      <div className={`${styles.track} ${styles.b}`}>
        <svg viewBox="0 0 2880 900" preserveAspectRatio="none" fill="none">
          <g className={styles.base2}>
            {B.map(([y, a]) => (
              <path key={y} d={wave(y, a, true)} vectorEffect="non-scaling-stroke" />
            ))}
          </g>
          <path className={styles.accent2} d={wave(455, 70, true)} vectorEffect="non-scaling-stroke" />
        </svg>
      </div>
    </div>
  );
}
