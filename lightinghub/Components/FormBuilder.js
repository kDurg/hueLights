// PURPOSE: COMPONENTS USED TO BUILD PAGES AND FORMS

export default function FormBuilder (props) {
	// PROPS: (name, )
	if (props && props.name) {
		switch (props.name) {
			case 'test':
				return (
					<div className='testDiv'>
						<p>TEST PARAGRAPH</p>
					</div>
				)
		}

	}
	return;
}