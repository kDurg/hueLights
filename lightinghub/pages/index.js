import Head from 'next/head'
import styles from '../styles/Home.module.css'
import Link from 'next/link';
import React, { Component } from 'react';

// COMPONENTS
import FormBuilder from '../Components/FormBuilder.js';

// LOGIC
import HueLogic from '../LightingHubs/hue';

// PAGES
import hueController from '../LightingHubs/hue';

const axios = require('axios');

// ===================== SERVER SIDE =====================
// GLOBAL TEMPORARY VARIABLES

async function checkForProfileData() {
  return true;
}



// async function getLightOnOffStatus() {
//   if (lightingData && lightingData[0] && lightingData[0].lights) {
//     let lights = lightingData[0].lights;
//     return (
//       console.log('OUR LIGHTS', lights)
//     )
//   } else { console.log('no lighting data') }
// }


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

    this.toggleAllLights = this.toggleAllLights.bind(this);
  }

  async componentDidMount() {
    await this.getLightingData()
    await this.toggleMenuName();
    // await HueLogic('test');
  }

  async getLightingData() {
    let lightingData = [];
    const previousData = await checkForProfileData();
  
    // PHILIPS HUE
    // DISCOVER LOCAL DEVICES ON NETWORK
  
    if (!previousData) {
      console.error('ERROR: NO PREVIOUS USER DATA', previousData);
    } else {
      console.log('PREVIOUS DATA CHECK: FINISHED', previousData);
      await HueLogic('getHueData') // TODO: ADD IN CHECK TO SEE IF PREVIOUSDATA INCLUDES HUE LIGHTS
        .then(data => { return lightingData.push(data) })
      console.log('LIGHTING DATA', lightingData)
      if (lightingData) {
        this.setState({
          hueLightingData: lightingData
        })
        // await getLightOnOffStatus()
      }
    }
  }

  async toggleAllLights() {
    if (this.state && this.state.hueLightingData) {
      console.log('State data', this.state)
      let data = ['onOff', null]
      // await controlHueLights('onOff', null, this.state);
      await HueLogic('controlHueLights', data, this.state)
    }
    return;
  }

  renderScreen(page) {
    // if (!this.state.currentPage || this.state.currentPage === 'lightingDash') {
    return this.renderLightingDash()
    // } else {
    //   switch(page){

    // }
    //   }
    // }
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

  updateState(data) {
    console.log('Updating State with: ', data)
    // data ? this.setState({ data }) : null
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