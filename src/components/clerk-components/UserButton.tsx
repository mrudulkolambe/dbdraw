"use client"

import React, { useEffect, useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '../ui/dialog'
import { OrganizationList, UserButton as User } from '@clerk/nextjs'
import { Building, Key, Copy, Check, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import axios from 'axios'
import Tokens from '@/lib/model/token.model'

interface TokenDisplay extends Tokens {
  showToken: boolean;
  displayToken: string | null;
  isRevoking?: boolean;
}

const UserButton = () => {
	const [showOrg, setShowOrg] = useState(false)
	const [showAccessTokens, setShowAccessTokens] = useState(false)
	const [tokenName, setTokenName] = useState("")
	const [tokens, setTokens] = useState<TokenDisplay[]>([])
	const [createTokenLoading, setCreateTokenLoading] = useState(false)
	const [copiedToken, setCopiedToken] = useState("")
	const [isLoading, setIsLoading] = useState(true)

	const createNewToken = async (e: React.FormEvent) => {
		e.preventDefault();
		if (tokenName) {
			setCreateTokenLoading(true);
			try {
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
					setTokenName("")
					toast.success("Token created successfully! Make sure to copy it now - you won't be able to see it again.")
					setTokens([
						{ ...data, showToken: true, displayToken: data.token },
						...tokens
					])
				} else {
					toast.error('Error creating token')
				}
			} catch (error) {
				toast.error('Failed to create token')
			} finally {
				setCreateTokenLoading(false)
			}
		}
	}

	const copyToken = async (token: string) => {
		await navigator.clipboard.writeText(token)
		setCopiedToken(token)
		toast.success("Token copied to clipboard!")
		setTimeout(() => setCopiedToken(""), 3000)
	}

	const revokeToken = async (tokenId: string) => {
		// Update the specific token's loading state
		setTokens(tokens.map(t => 
			t._id === tokenId ? { ...t, isRevoking: true } : t
		))

		try {
			const response = await fetch(`/api/token/${tokenId}`, {
				method: 'DELETE',
			});
			
			if (response.ok) {
				setTokens(tokens.filter(t => t._id !== tokenId))
				toast.success("Token revoked successfully")
			} else {
				// If revocation fails, remove the loading state
				setTokens(tokens.map(t => 
					t._id === tokenId ? { ...t, isRevoking: false } : t
				))
				toast.error("Failed to revoke token")
			}
		} catch (error) {
			// If there's an error, remove the loading state
			setTokens(tokens.map(t => 
				t._id === tokenId ? { ...t, isRevoking: false } : t
			))
			toast.error("Failed to revoke token")
		}
	}

	useEffect(() => {
		getTokens()
	}, [])

	const getTokens = async () => {
		setIsLoading(true)
		try {
			const tokensData = await axios('/api/token', {
				method: "GET",
				headers: {
					'Content-Type': 'application/json',
				},
			})
			setTokens(tokensData.data.tokens.map((t: Tokens) => ({ 
				...t, 
				showToken: false,
				displayToken: null 
			})))
		} catch (error) {
			toast.error('Failed to load tokens')
		} finally {
			setIsLoading(false)
		}
	}

	// Clear token visibility when modal is closed
	useEffect(() => {
		if (!showAccessTokens) {
			setTokens(tokens.map(t => ({ ...t, showToken: false, displayToken: null })))
		}
	}, [showAccessTokens])

	return (
		<>
			<Dialog open={showOrg} onOpenChange={(e) => setShowOrg(e)}>
				<DialogContent className="h-auto w-[40vw] border-0 bg-secondary rounded-2xl">
					<div className=''>
						<h2 className='text-white font-bold text-2xl'>Coming soon!</h2>
						<p className='text-white mt-1'>Organizations are on its way...</p>
					</div>
				</DialogContent>
			</Dialog>

			<Dialog open={showAccessTokens} onOpenChange={(e) => setShowAccessTokens(e)}>
				<DialogContent className="h-auto max-w-[40vw] w-[40vw] border-0 bg-secondary rounded-2xl">
					<DialogTitle className='text-white text-2xl'>Access Token</DialogTitle>
					<DialogDescription className='text-gray-400'>Personal access tokens allow you to access your own data via the API. Do not give out your personal access tokens to anybody who you don&apos;t want to access your files.</DialogDescription>
					<form onSubmit={createNewToken} className='flex items-center justify-center gap-3'>
						<input 
							onChange={(e) => setTokenName(e.target.value)} 
							value={tokenName} 
							type="text" 
							className='input flex-1 text-white' 
							placeholder="What's this token for?"
							disabled={createTokenLoading}
						/>
						<button 
							disabled={createTokenLoading || !tokenName} 
							className='button bg-blue-600 w-[120px] flex items-center justify-center gap-2'
						>
							{createTokenLoading && <Loader2 className="h-4 w-4 animate-spin" />}
							{createTokenLoading ? "Creating" : "Create"}
						</button>
					</form>
					<div className='h-72 flex flex-col overflow-y-auto'>
						{isLoading ? (
							<div className="flex items-center justify-center h-full">
								<Loader2 className="h-6 w-6 animate-spin text-gray-400" />
							</div>
						) : tokens.length === 0 ? (
							<div className="flex items-center justify-center h-full text-gray-400">
								No tokens found
							</div>
						) : (
							tokens.map((tokenItem, index) => (
								<div key={index} className='text-white flex flex-col gap-2 py-4 border-b border-white/5'>
									<div className='flex justify-between'>
										<div className='flex gap-3'>
											<Key className='text-gray-600' size={20} />
											<p>{tokenItem.title}</p>
										</div>
										<button 
											onClick={() => revokeToken(tokenItem._id)}
											className='text-red-500 hover:text-red-400 transition-colors flex items-center gap-2'
											disabled={tokenItem.isRevoking}
										>
											{tokenItem.isRevoking && <Loader2 className="h-4 w-4 animate-spin" />}
											{tokenItem.isRevoking ? "Revoking..." : "Revoke access"}
										</button>
									</div>
									{tokenItem.showToken && tokenItem.displayToken && (
										<div className='flex items-center gap-2 bg-[#1a1d1f] p-2 rounded'>
											<input 
												type="text"
												readOnly
												value={tokenItem.displayToken}
												className='text-sm text-gray-300 flex-1 bg-transparent border-none focus:outline-none font-mono'
											/>
											<button
												onClick={() => copyToken(tokenItem.displayToken!)}
												className='p-1 hover:bg-gray-700 rounded transition-colors'
												title="Copy to clipboard"
											>
												{copiedToken === tokenItem.displayToken ? (
													<Check className='h-4 w-4 text-green-500' />
												) : (
													<Copy className='h-4 w-4 text-gray-400' />
												)}
											</button>
										</div>
									)}
								</div>
							))
						)}
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