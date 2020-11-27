const axios = require('axios');
import updateState from '../pages/index'

export default async function hueController(modifier, data, state) {
	let lightingData = [];

	if (modifier) {
		switch (modifier) {
			case 'controlHueLights':
				if (data) {
					// console.log('YAY, Control Hue Lights!', data)
					return await controlHueLights(data[0], data[1], state)
				} else {
					console.log('No Data for Controling Hue Lights')
				}

			case 'getHueData':
				return await getHueData();

			default: return
		}
	}
	return console.log('YAYAYAYYAYA', data);

	async function controlHueLights(command, modifier, data) {
		// console.log('ControlLights Info:: ', command, modifier, data)
		if (data && data.hueLightingData) {
			let currentLightState = data.currentLightState;
			let hueData = data.hueLightingData[0];
			// console.log('HUE DATA??', hueData)
			let hueLights = hueData.data.lights;
			let coreURL = hueData.credentials.hueCoreURL;

			switch (command) {
				case 'onOff':
					console.log('TURNED ON/OFF LIGHTS!');
					if (hueData && hueData.data && hueData.credentials && hueData.credentials.hueCoreURL) {
						if (!currentLightState.someLightsOn) {
							if (hueLights) {
								// SET CURRENTLIGHTSTATE BASED ON CURRENT LIGHT STATUS
								Object.entries(hueLights).forEach(async light => {
									let lightState = light[1].state.on;
									let builtURL = `${coreURL}/lights/${light[0]}/state/${light[0]}`;
									let lightData = { 'on': !currentLightState.someLightsOn };
									
									if (lightState) {
										currentLightState = true; // FIXME: IS THIS CORRECT OR DOES IT NEED TO BE CURRENTLIGHTSTATE.SOMELIGHTS??
									}
							
									sendHueReq(builtURL, lightData);
									// TODO: NEED TO UPDATE STATE SOME SOMELIGHTSON AND ALLLIGHTSON IN INDEX.JS WITH CURRENT STATUS
									// updateState('test')
								});

								// IF CURRENTLIGHTSTATE IS STILL UNDEFINED, WE NEED TO ADD A VALUE AND TURN ON THE LIGHT
								if (currentLightState === undefined) {
									currentLightState = false;
									let lightData = { 'on': !currentLightState };
									Object.entries(hueLights).forEach(async light => {
										let lightID = light[0];
										let builtURL = `${coreURL}/lights/${lightID}/state/${lightID}`;
										sendHueReq(builtURL, lightData);
										// toggleMenuName(data); // FIXME: THIS WONT TOGGLE NAME SINCE ITS NOT AFFECTING THE RENDER
									})
								}
							}
						} else { // WE HAVE VALUES FOR OUR LIGHTS, LETS TOGGLE THEM BASED ON CURRENT STATE
							console.log('TURN EM ON PLEASE!', currentLightState)
							if (hueLights) {
								Object.entries(hueLights).forEach(light => {
									let data = { 'on': !currentLightState };
									let lightID = light[0];
									let builtURL = `${coreURL}/lights/${lightID}/state/${lightID}`;
									sendHueReq(builtURL, data);
									// toggleMenuName(data); // FIXME: THIS WONT TOGGLE NAME SINCE ITS NOT AFFECTING THE RENDER
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

	// async function getLightingData() {
	// 	const previousData = await checkForProfileData();

	// 	// PHILIPS HUE
	// 	// DISCOVER LOCAL DEVICES ON NETWORK

	// 	if (!previousData) {
	// 		console.error('ERROR: NO PREVIOUS USER DATA', previousData);
	// 	} else {
	// 		console.log('PREVIOUS DATA CHECK: FINISHED', previousData);
	// 		await getHueData()
	// 			.then(data => { return lightingData.push(data) });
	// 		console.log('LIGHTING DATA', lightingData);
	// 		if (lightingData) {
	// 			// await getLightOnOffStatus()
	// 		}
	// 	}
	// }

	async function sendHueReq(url, data) {
		console.log('Send Hue Request', url, data)

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

}