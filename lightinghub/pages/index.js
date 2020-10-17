import Head from 'next/head'
import styles from '../styles/Home.module.css'
import Link from 'next/link';

const axios = require('axios');

// GLOBAL TEMPORARY VARIABLES
let currentLightState;
let lightingData =[];

async function checkForProfileData() {
	return true;
}

async function controlHueLights(command, modifier) {
  if (lightingData[0]) {
    let hueData = lightingData[0];
    let hueLights = hueData.data.lights;
    let hueLightArray = [];
    let coreURL = hueData.credentials.hueCoreURL;

    switch (command) {
      case 'onOff': // TODO: LETS JUST COMBINE THIS BY SENDING ALL OF STATE IN VIA MODIFIER
        console.log('TURNED ON/OFF LIGHTS!',);
        if (hueData && hueData.data && hueData.credentials && hueData.credentials.hueCoreURL) {
          console.log('OUR LIGHTING DATA: ', hueData.data);

          if (hueLights) {
            Object.entries(hueLights).forEach(light => {
              let data;
              let lightID = light[0];
              let lightState = light[1].state.on; // TODO: CAN THIS BE CLEANED UP BETTER?
              let builtURL = `${coreURL}/lights/${lightID}/state/${lightID}`;
              lightState ? data = { "on": false } : data = { "on": true };

              axios.put(builtURL, data)
                .then(res => { console.log('SUCCESS RESPONSE', res.data) })
                .catch(err => { console.error('ERROR CHANGING LIGHT STATUS ', err) })
            });
          }
        } else { console.error('ERROR, NO LIGHTING DATA', hueData) }
      break;

      case 'changeColors':
        if (hueData && hueData.data && hueData.credentials && hueData.credentials.hueCoreURL && modifier) {
          if (hueLights) {
            Object.entries(hueLights).forEach(light => {
              let data;
              let lightID = light[0];
              let lightState = light[1].state.on; // TODO: CAN THIS BE CLEANED UP BETTER?
              let builtURL = `${coreURL}/lights/${lightID}/state/${lightID}`;
              
              if (modifier && lightState){
                let lightingData = modifier;
              }

              // axios.put(builtURL, data)
              // 	.then(res => { console.log('SUCCESS RESPONSE', res.data) })
              // 	.catch(err => { console.error('ERROR CHANGING LIGHT STATUS ', err) })
            });
          }
          else { console.error('ERROR NO LIGHTS FOR COLOR CHANGE') }
        }
      break;
    }
  }
}

async function getHueData() {
  	const discoveryApp = 'https://discovery.meethue.com';
	let discoveryData;
	let hueData = new Object();

	return axios.get(discoveryApp)
		.then(async res => {
			discoveryData = res.data;
		})
		.then(async () => {
			if (discoveryData) {
				// console.log('RESPONSE: ', discoveryData);

				// TODO: CHECK TO SEE IF WE HAVE ANY WHITELISTED USERS
				// GET HUE LIGHTS INFORMATION FROM BRIDGE
				let usernameID = 'Me78u3OjDQfTnyAdMemLje9-J3uJqyQih-2NZHmL'; // TODO: GET RID OF HARD CODED VALUE, CHECK DB FOR USER AND RETURN ID.
				let getHueSystemData = `http://${discoveryData[0].internalipaddress}/api/${usernameID}`;
				return axios.get(getHueSystemData)
					.then(res => {
						if (res && res.status === 200) {
							hueData.credentials = {
								hueCoreURL: getHueSystemData,
								hueId: discoveryData[0].id,
								hueBridgeIP: discoveryData[0].internalipaddress,
								usernameID: usernameID
							}
							hueData.data = res.data;
							return hueData;
						} else {
							console.error('HUE DATA GRAB ERROR: ', res.status, res.statusText);
							hueData = false;
							return hueData;
							// username = await createHueUserName(discoveryData);
						}
					})
					.catch(err => { console.error('ERROR GETTING HUE DATA ', err) })
			} else {
				console.error('ERROR: UNABLE TO GET HUE BRIDGE DATA')
				return false;
			}
		})
		.catch(err => console.error("ERROR WITH DISCOVERY APP: ", err.status))

}

async function getLightingData() {
	const previousData = await checkForProfileData();

	// PHILIPS HUE
	// DISCOVER LOCAL DEVICES ON NETWORK

	if (!previousData) {
		console.error('ERROR: NO PREVIOUS USER DATA', previousData);
	} else {
		console.log('PREVIOUS DATA CHECK: FINISHED', previousData);
		await getHueData()
			.then(data => { lightingData.push(data) }) // FIXME: NOT ADDING TO THE ARRAY?
    console.log('LIGHTING DATA', lightingData)
    if (lightingData){
      await getLightOnOffStatus()
    }

	}
}

async function toggleAllLights(){
  return await controlHueLights('onOff')
}

async function getLightOnOffStatus(){
  if (lightingData && lightingData[0] && lightingData[0].lights){
    let lights = lightingData[0].lights;
    return (
      console.log('OUR LGIHTS', lights)
    )
  } else { console.log('no lighting data')}
}

export async function getStaticProps(context){
  return {props:{}}
}


export default async function Home() {
  getLightingData()

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
          <a className={styles.card} onClick={toggleAllLights}>(
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
