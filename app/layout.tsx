import React from "react"
import './styles/globals.css'

export const metadata = {
	title: "K-System",
	description: "K-System monitoring dashboard",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
	return (
		<html lang="en">
			<head />
			<body>
				{children}
			</body>
		</html>
	)
}
