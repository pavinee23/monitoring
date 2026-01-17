import React from "react"
import './styles/globals.css'

export const metadata = {
	title: "K Energy Save - ENERGY YOU CAN TRUST",
	description: "Advanced power-saving technology with proven results. Cut your Electric Bill from day one!",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
	return (
		<html lang="en">
			<body suppressHydrationWarning>
				{children}
			</body>
		</html>
	)
}
