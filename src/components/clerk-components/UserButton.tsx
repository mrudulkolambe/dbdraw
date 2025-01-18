import React, { useEffect, useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '../ui/dialog'
import { OrganizationList, UserButton as User } from '@clerk/nextjs'
import { Building, Key } from 'lucide-react'
import { toast } from 'sonner'
import axios from 'axios'
import Tokens from '@/lib/model/token.model'

const UserButton = () => {
	const [showOrg, setShowOrg] = useState(false)
	const [showAccessTokens, setShowAccessTokens] = useState(false)
	const [tokenName, setTokenName] = useState("")
	const [tokens, setTokens] = useState<Tokens[]>([])
	const [createTokenLoading, setCreateTokenLoading] = useState(false)
	const createNewToken = async (e: React.FormEvent) => {
		e.preventDefault();
		if (tokenName) {
			setCreateTokenLoading(true);
			const response = await fetch('/api/token', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					title: tokenName,
				}),
			});

			const data = await response.json();
			if (response.ok) {
				setCreateTokenLoading(false)
				setTokenName("")
				toast.success("Token created")
				setTokens([
					data,
					...tokens
				])
			} else {
				setCreateTokenLoading(false)
				console.error('Error creating diagram:', data.message);
			}
		}
	}

	useEffect(() => {
		getTokens()
	}, [])
	const getTokens = async () => {
		const tokensData = await axios('/api/token', {
			method: "GET",
			headers: {
				'Content-Type': 'application/json',
			},
		})
		setTokens(tokensData.data.tokens)
	}

	return (
		<>
			<Dialog open={showOrg} onOpenChange={(e) => setShowOrg(e)}>
				<DialogContent className="h-auto w-[40vw] border-0 bg-secondary rounded-2xl">
					<div className=''>
						<h2 className='text-white font-bold text-2xl'>Coming soon!</h2>
						<p className='text-white mt-1'>Organizations are on its way...</p>
					</div>
					{/* <OrganizationList
						afterCreateOrganizationUrl="/org/:slug/board"
						afterSelectPersonalUrl="/board"
						afterSelectOrganizationUrl="/org/:slug/board"
					/> */}
				</DialogContent>
			</Dialog>

			<Dialog open={showAccessTokens} onOpenChange={(e) => setShowAccessTokens(e)}>
				<DialogContent className="h-auto max-w-[40vw] w-[40vw] border-0 bg-secondary rounded-2xl">
					<DialogTitle className='text-white text-2xl'>Access Token</DialogTitle>
					<DialogDescription className='text-gray-400'>Personal access tokens allow you to access your own data via the API. Do not give out your personal access tokens to anybody who you don&apos;t want to access your files.</DialogDescription>
					<form onSubmit={createNewToken} className='flex items-center justify-center gap-3'>
						<input onChange={(e) => setTokenName(e.target.value)} value={tokenName} type="text" className='input flex-1 text-white' placeholder="What's this token for?" />
						<button disabled={createTokenLoading || !tokenName} className='button bg-blue-600 w-[120px]'>{createTokenLoading ? "Creating" : "Create"}</button>
					</form>
					<div className='h-72 flex flex-col overflow-y-auto'>
						{
							tokens.map((tokenItem) => {
								return <div className='text-white flex justify-between py-4 border-b border-white/5'>
									<div className='flex gap-3'>
										<Key className='text-gray-600' size={20} />
										<p>{tokenItem.title}</p>
									</div>
									<div className='flex gap-3 items-center'>
										{/* <p className='text-gray-400 text-xs'>never used</p> */}
										<p className='text-blue-600'>Revoke access</p>
									</div>
								</div>
							})
						}
					</div>
				</DialogContent>
			</Dialog>

			<User >
				<User.MenuItems>
					<User.Action
						label="Organization"
						labelIcon={<Building height={14} width={14} />}
						onClick={() => setShowOrg(true)}
					/>
				</User.MenuItems>
				<User.MenuItems>
					<User.Action
						label="Access Tokens"
						labelIcon={<Key height={14} width={14} />}
						onClick={() => setShowAccessTokens(true)}
					/>
				</User.MenuItems>
			</User>
		</>
	)
}

export default UserButton