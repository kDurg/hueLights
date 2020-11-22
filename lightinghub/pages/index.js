import Head from 'next/head'
import styles from '../styles/Home.module.css'
import Link from 'next/link';
import React, { Component } from 'react';

// PAGES
import ControlLights from './controlLights';

// COMPONENTS
import FormBuilder from '../Components/FormBuilder.js';

const axios = require('axios');

// ===================== SERVER SIDE =====================
// GLOBAL TEMPORARY VARIABLES
let lightingData = [];

async function checkForProfileData() {
  return true;
}

async function controlHueLights(command, modifier, data) {
  if (data && data.lightingData) {
    let hueData = data.lightingData[0];
    let currentLightState = data.onOffButtonName;
    let hueLights = hueData.data.lights;
    let coreURL = hueData.credentials.hueCoreURL;

    switch (command) {
      case 'onOff': // TODO: LETS JUST COMBINE THIS BY SENDING ALL OF STATE IN VIA MODIFIER
        console.log('TURNED ON/OFF LIGHTS!');
        if (hueData && hueData.data && hueData.credentials && hueData.credentials.hueCoreURL) {
          console.log('OUR LIGHTING DATA: ', hueData.data);

          if (!currentLightState) {
            if (hueLights) {
              // SET CURRENTLIGHTSTATE BASED ON CURRENT LIGHT STATUS
              Object.entries(hueLights).forEach(async light => {
                let lightState = light[1].state.on; // TODO: CAN THIS BE CLEANED UP BETTER?
                if (lightState) {
                  currentLightState = true;
                }
              });

              // IF CURRENTLIGHTSTATE IS STILL UNDEFINED, WE NEED TO ADD A VALUE AND TURN ON THE LIGHT
              if (currentLightState === undefined) {
                currentLightState = false;
                let lightData = { 'on': !currentLightState };
                Object.entries(hueLights).forEach(async light => {
                  let lightID = light[0];
                  let builtURL = `${coreURL}/lights/${lightID}/state/${lightID}`;
                  sendHueReq(builtURL, lightData);
                  toggleMenuName(data); // FIXME: THIS WONT TOGGLE NAME SINCE ITS NOT AFFECTING THE RENDER
                })
              }
            }
          } else { // WE HAVE VALUES FOR OUR LIGHTS, LETS TOGGLE THEM BASED ON CURRENT STATE
            if (hueLights) {
              Object.entries(hueLights).forEach(light => {
                let data = { 'on': !currentLightState };
                let lightID = light[0];
                let builtURL = `${coreURL}/lights/${lightID}/state/${lightID}`;
                sendHueReq(builtURL, data);
                toggleMenuName(data); // FIXME: THIS WONT TOGGLE NAME SINCE ITS NOT AFFECTING THE RENDER
              })
              currentLightState = !currentLightState;
            }
          }

        } else { console.error('ERROR, NO LIGHTING DATA', hueData) }
        break;

    }
  } else {
    console.error('ERROR: NO LIGHTING DATA');
    return;
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
      .then(data => { return lightingData.push(data) }) // FIXME: NOT ADDING TO THE ARRAY?
    console.log('LIGHTING DATA', lightingData)
    if (lightingData) {
      // await getLightOnOffStatus()
    }
  }
}

async function sendHueReq(url, data) {
  if (url && data) {
    axios.put(url, data)
      .then(res => { console.log('SUCCESS RESPONSE', res.data) })
      .catch(err => { console.error('ERROR CHANGING LIGHT STATUS ', err) })
  } else {
    console.error('ERROR: HUE URL OR DATA NOT VALID', url, data)
  }
}

async function getLightOnOffStatus() {
  if (lightingData && lightingData[0] && lightingData[0].lights) {
    let lights = lightingData[0].lights;
    return (
      console.log('OUR LIGHTS', lights)
    )
  } else { console.log('no lighting data') }
}


// ===================== CLIENT SIDE =====================
class Home extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hueLightingData: {},
      currentLightState: {
        allLightsOn: false,
        someLightsOn: false,
        onOffButtonName: 'Turn On'
      },
      currentPage: 'controlLights',
    }
  }

  componentDidMount() {
    this.toggleMenuName();
  }

  async toggleAllLights() {
    await controlHueLights('onOff', null, this.state);
    return;
  }

  renderScreen() {
    if (!this.state.currentPage || this.state.currentPage === 'lightingDash') {
      return this.renderLightingDash()
    } else {
      switch (this.state.currentPage) {
        case 'controlLights':
          return <ControlLights
            previousPage='lightingDash'
            state={this.state}
            updateState={(data)=>this.updateState(data)}
          />
      }
    }
  }

  renderLightingDash(props) {
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
            <a className={styles.card} onClick={this.toggleAllLights}>
              <h3>{this.state.currentLightState.onOffButtonName ? this.state.currentLightState.onOffButtonName : 'Power'}</h3> {/*TODO: SWITCH STATE AND IMAGE BASED ON CURRENT LIGHT STATUS */}
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

  toggleMenuName() {
    let currentLightStateName;
    let allLightsOn = this.state.currentLightState.allLightsOn;
    let someLightsOn = this.state.currentLightState.someLightsOn;

    allLightsOn || someLightsOn ? currentLightStateName = true : currentLightStateName = false;
    this.setState({
      onOffButtonName: currentLightStateName ? 'Turn Off' : 'Turn On'
    });
  }

  updateState(data){
    console.log('Updating State with: ', data)
    data ? this.setState({data}) : null
  }

  render(props) {
    // console.log('PROPS', props)
    return (
      <>
        {this.renderScreen(props)}
      </>
    )
  }
}

export default Home