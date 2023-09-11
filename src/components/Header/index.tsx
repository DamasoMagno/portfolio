import Link from "next/link";

import styles from "./styles.module.scss";
import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation"
import { MdClose, MdMenu } from "react-icons/md";

export function Header() {
  const path = usePathname();
  const ref = useRef<HTMLDivElement>(null);
  const [menu, setMenu] = useState(false);

  function setBackgroundOnScrool() {
    if (window.scrollY >= 375) {
      ref.current?.classList.add("headerFloat");
    } else {
      ref.current?.classList.remove("headerFloat");
    }
  }

  useEffect(() => {
    setMenu(false);
  }, [path]);

  useEffect(() => {
    window.addEventListener("scroll", setBackgroundOnScrool);
  }, []);

  return (
    <header className={styles.header} ref={ref}>
      <div className={styles.headerContent} data-open={menu}>
        <div>
          <Link href="/">
            D<span>M.</span>
          </Link>

          <button onClick={() => setMenu(!menu)}>
            {!menu ? <MdMenu /> : <MdClose />}
          </button>
        </div>

        <nav>
          <Link href="/">Sobre mim</Link>
          <Link href="/projects">Projetos</Link>
        </nav>
      </div>
    </header>
  );
}
