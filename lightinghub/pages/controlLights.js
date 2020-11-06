import Link from 'next/link';

export default function initialize() {
	return (
		<>
			<h1>Control Lights</h1>
			<div className='lightingContainer'>
				<button>
					<Link href='/'>Back</Link>
				</button>
				<button>Change Color</button>
			</div>
		</>
	)
}