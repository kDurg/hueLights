import Head from 'next/head'
import styles from '../styles/Home.module.css'
import Link from 'next/link';

export default function Home() {
  return (
    <div className={styles.container}>
      <Head>
        <title>Lighting Hub</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>
          Your <a href="https://github.com/kDurg/hueLights">Lighting Hub</a>
        </h1>

        <div className={styles.grid}>
          <a href="https://nextjs.org/docs" className={styles.card}>
            <h3>On/ Off &rarr;</h3> {/*TODO: SWITCH STATE AND IMAGE BASED ON CURRENT LIGHT STATUS */}
            {/* <p>Find in-depth information about Next.js features and API.</p> */}
          </a>

          <Link href="/controlLights" >
            <a className={styles.card}>
            <h3> Control Lights &rarr;</h3>
            <p>View and control all lights from status to color</p>
            </a>
          </Link>

          <a
            href="https://github.com/vercel/next.js/tree/master/examples"
            className={styles.card}
          >
            <h3>Routines &rarr;</h3>
            <p>Build routines around time, event or mood</p>
          </a>

          <a
            href="https://vercel.com/import?filter=next.js&utm_source=create-next-app&utm_medium=default-template&utm_campaign=create-next-app"
            className={styles.card}
          >
            <h3>Settings &rarr;</h3>
            <p>
              Setup, Add or remove lights
            </p>
          </a>
        </div>
      </main>

      <footer className={styles.footer}>
        <a
          href="https://vercel.com?utm_source=create-next-app&utm_medium=default-template&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          Powered by{' '}
          <img src="/vercel.svg" alt="Vercel Logo" className={styles.logo} />
        </a>
      </footer>
    </div>
  )
}
