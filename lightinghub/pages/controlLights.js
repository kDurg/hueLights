import Link from 'next/link';

export default function initialize(props) {
	console.log('ControlLights Props: ', props)

	if (props && props.state && props.updateState){
		if (props.state !== 'controlLights'){
			props.updateState({currentPage: 'controlLights'})
		}
	}

	function renderLightingDash(){
		if (props && props.state && props.updateState){
			if (props.state !== 'controlLights'){
				props.updateState({currentPage: 'lightingDash'})
			}
		}
	}


	return (
		<>
			<h1>Control Lights</h1>
			<div className='lightingContainer'>
				<button>
					<Link href={renderLightingDash}>Back</Link>
				</button>
				<button>Change Color</button>
			</div>
		</>
	)
}