import React from 'react'
import StripeCheckout from 'react-stripe-checkout'

function index() {
	return (
		<div>
			<StripeCheckout
				token={token => {
					console.log(token)
				}}
				stripeKey={process.env.REACT_APP_STRIPE_PUBLIC_KEY}
			/>
		</div>
	)
}

export default index
