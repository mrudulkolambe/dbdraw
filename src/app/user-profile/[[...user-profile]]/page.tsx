import { ClerkProvider, UserProfile } from '@clerk/nextjs'
import { dark } from '@clerk/themes';

const UserProfilePage = () => <ClerkProvider appearance={{
	baseTheme: dark,
	layout: {
		unsafe_disableDevelopmentModeWarnings: true
	}
}}><UserProfile path="/user-profile" appearance={{
}}/></ClerkProvider>

export default UserProfilePage