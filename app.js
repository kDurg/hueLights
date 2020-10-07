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
    }).then(answer => {
        switch (answer.lightingHome) {
            case 'Control Lighting':
                getLightingData();
                // getLightingDevices();
                // controlLights();
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
    // CHECK TO SEE IF WE HAVE HUE LIGHTS
    // DISCOVER LOCAL DEVICES ON NETWORK
    let discoveryApp = 'https://discovery.meethue.com';
    let discoveryData;
    let hueUsername = 'Kdurg';
    let username;
    let coreURL;

    axios.get(discoveryApp)
        .then(res => {
            discoveryData = res.data;
        })
        .then(async () => {
            if (discoveryData) {
                console.log('RESPONSE: ', discoveryData);
                username = await getHueUserName(discoveryData);
            } else {
                console.error('ERROR: UNABLE TO GET HUE BRIDGE DATA')
            }

        })
        .catch(err => console.error("ERROR WITH DISCOVERY APP: ", err.status))

    if (!previousData) {
        console.error('ERROR: NO PREVIOUS USER DATA', previousData);
    } else {
        console.log('PREVIOUS DATA CHECK: FINISHED', previousData);
        await getHueData();
    }
}

// IF WE DO NOT HAVE A USER ASSIGNED YET, WE NEED TO CREATE ONE
async function getHueUserName(hueData) {
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

async function getHueData() {
    return;
}

async function checkForProfileData() {
    return true;
}

async function controlLights() {
    console.log('Control Lighting Function');
}
