import Link from "next/link";

import styles from "./styles.module.scss";
import { useEffect, useRef } from "react";

export function Header() {
  const ref = useRef<HTMLDivElement>(null);

  function setBackgroundOnScrool() {
    if (window.scrollY >= 375) {
      ref.current?.classList.add("headerFloat");
    } else {
      ref.current?.classList.remove("headerFloat");
    }
  }

  useEffect(() => {
    window.addEventListener("scroll", setBackgroundOnScrool);
  }, []);

  return (
    <header className={styles.header} ref={ref}>
      <div className={styles.headerContent}>
        <strong>
          D<span>M.</span>
        </strong>

        <nav>
          <Link href="/">Sobre mim</Link>
          <Link href="/projects">Projetos</Link>
        </nav>
      </div>
    </header>
  );
}
