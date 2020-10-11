const express = require('express');
const router = require('express');
const app = express();
const port = 3000;
const inquirer = require("inquirer");
const axios = require('axios');
const lightingHome = require('./routes/hueLights')

app.get('/', (req, res) => {
	res.send('Hello World!')
})

app.get('/lighting', lightingHome)

app.listen(port, () => {
	console.log(`Example app listening at http://localhost:${port}`)
	// lightingHomePrompt();
})

