const express = require('express');
const app = express();
const port = 3000;
const inquirer = require("inquirer");
const axios = require('axios');

app.get('/', (req, res) => {
	res.send('Hello World!')
})

app.listen(port, () => {
	console.log(`Example app listening at http://localhost:${port}`)
	lightingHomePrompt();
})

let isWindows = /^win/.test(process.platform); // use rawlist type for windows
let listType;
!isWindows ? listType = 'list' : listType = 'rawlist';

// FIXME: GLOBAL VARIABLES FOR TESTING. MOVE TO DB ONCE FINISHED TESTING.
let lightingData = [];

function lightingHomePrompt() {
	// console.log('lighting started');
	// await checkCurrentStatus();
	inquirer.prompt({
		name: 'lightingHome',
		type: listType,
		message: 'Welcome to the lighting hub, what would you like to do?',
		choices: [
			'Control Lighting',
			'Set Up Lights',
			'Exit'
		]
	}).then(async answer => {
		switch (answer.lightingHome) {
			case 'Control Lighting':
				await getLightingData();
				await controlLights();
				break;

			case ' Set Up Lights':
				break;

			case 'Exit':
				app.end();

			default:
				return console.log('Lighting Home Answer Not Selected', answer);
		}
	}).catch(err => console.error('ERROR IN LIGHTING HOME PROMPT: ', err))
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

// IF WE DO NOT HAVE A USER ASSIGNED YET, WE NEED TO CREATE ONE
async function createHueUserName(hueData) {
	console.log('gggggg', hueData)
	let usernameID = 'Me78u3OjDQfTnyAdMemLje9-J3uJqyQih-2NZHmL' // aGbX60RgWmgCVTf9BRevBfcZDmjjZ9xd1eow4F8V
	if (hueData[0] && hueData[0].internalipaddress) {
		let reqURL = `http://${hueData[0].internalipaddress}/api`;

		// axios.get(reqURL)
		//     .then(res=> {console.log('res  ', res)})
		//     .catch(err=> console.error('ERROR GETTING USERNAME: ', err))

		let data = {
			"devicetype": "my_hue_app#kylelaptop"
		}

		// // SEND HUE BRIDGE NEW USERNAME
		// axios.post(reqURL, data)
		//     .then(res => { 
		//         console.log('res  ', res.data) 
		//         if (res.success) {
		//             console.log('Success!', res);
		//             usernameID = res.username;
		//         } else { console.log('USER POST ERROR: ', res)}
		//     })
		//     .catch(err => console.error('ERROR GETTING USERNAME: ', err))

		// GET LIGHT DATA WITH USERNAME
		axios.get(reqURL + '/' + usernameID + '/lights')
			.then(res => { console.log('res222  ', res.data) })
	} else { console.error('ERROR: HUE DATA TO GET USERNAME') }
}

async function setUpHue() {
	// https://developers.meethue.com/develop/get-started-2/
	// SET UP A NEW AUTHORIZED USER (NEED TO CLICK ON THE BRIDGE TO START SYNC)

	// GET INTERNAL IP ADDRESS

	// ADD IN JSON OBJECT AS PART OF A POST
	// {"devicetype":"my_hue_app#android kyle"}

	// ON SUCCESSFUL POST OF NEW USER, STORE RETURNED USERNAME
}

async function checkForProfileData() {
	return true;

}

async function controlLights() {
	console.log('Control Lighting Function');
	if (!lightingData) { console.error('ERROR: NO LIGHTING DATA AVAILABLE') }
	else {
		inquirer.prompt({
			name: 'controlLightsHome',
			type: listType,
			message: 'Lighting: What Would You Like To Do?',
			choices: [
				'Toggle Lights On/Off',
				'Change Colors',
				'Back'
			]
		})
			.then(response => {
				switch (response.controlLightsHome) {
					case 'Toggle Lights On/Off':
						controlHueLights('onOff')
						break;

					case 'Change Colors':
						controlHueLights('changeColors')
						break;

					case 'Back':
						break;

					default:
						console.log('HIT DEFAULT LIGHTING RESPONSE', response)
						return;
				}
			})
	}
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
