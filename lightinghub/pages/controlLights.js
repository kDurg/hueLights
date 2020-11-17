import React from 'react';
import { Link, useRouter } from 'next/link';


export default class ControlLights extends React.Component {
	constructor(props) {
		super(props);
		this.state = {

		}
		// console.log('control props', props) // FIXME: NEED TO PASS PROPS, HOW TO DO THIS WITH NEXT LINK?
	}
	// console.log('control lights props: ', props)
	// NEED TO CHECK ALL LIGHTS FOR HUE LIGHTS


	// NEED TO CHECK STATUS OF ALL LIGHTS TO SEE IF ANY ARE ON OR PARTIALLY ON
	// GET COUNT OF HOW MANY LIGHTS ARE CURRENTLY ON TO DISPLAY IN ALLLIGHTSTOGGLE


	// NEED TO CHECK HUE ROOMS FOR GROUPED LIGHTS
	// LIST EACH ROOM AS A SEPERATE ROW WITH COLOR FADE/ TOGGLE SWITCH/ ROOM NAME/ SOURCE OF CONTROLLED LIGHTS (APP, MOVIE, TIMER, ETC)



	render() {

		return (
			<>
				<h1>Control Lights</h1>
				<div className='lightingContainer'>
					<ControlLights
						className={styles.card}
						state={this.state}
					/>

					<div className='allLightsToggle'>

					</div>

					<button>Change Color</button>
				</div>
			</>
		)
	}
}