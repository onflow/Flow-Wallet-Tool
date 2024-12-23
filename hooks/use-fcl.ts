import { useState, useEffect } from 'react'
import * as fcl from "@onflow/fcl"
import { NETWORK } from '@/utils/constants'
import fclConfig from '@/lib/fcl-config'

interface FCLState {
  network: NETWORK
  user: {
    loggedIn: boolean
    addr: string | null
  }
  loading: boolean
  isAvailable: boolean
}

export function useFCL() {
  const [state, setState] = useState<FCLState>({
    network: process.env.NEXT_PUBLIC_NETWORK as NETWORK || NETWORK.MAINNET,
    user: {
      loggedIn: false,
      addr: null,
    },
    loading: true,
    isAvailable: false,
  })

  useEffect(() => {
    // Initialize FCL with current network
    const fcl = fclConfig(state.network)

    // Check network availability
    const checkNetwork = async () => {
      try {
        const response = await fcl.send(fcl.ping())
        console.log(response)
        setState(prev => ({
          ...prev,
          isAvailable: true
        }))
      } catch {
        setState(prev => ({
          ...prev,
          isAvailable: false
        }))
      }
    }

    // Subscribe to user changes
    const unsubscribe = fcl.currentUser().subscribe((user: {
      loggedIn: boolean
      addr: string | null
    }) => {
      setState(prev => ({
        ...prev,
        user: {
          loggedIn: user.loggedIn,
          addr: user.addr,
        },
        loading: false,
      }))
    })

    checkNetwork()
    const networkCheck = setInterval(checkNetwork, 30000) // Check every 30 seconds

    return () => {
      unsubscribe()
      clearInterval(networkCheck)
    }
  }, [state.network])

  const switchNetwork = (network: NETWORK) => {
    setState(prev => ({
      ...prev,
      network,
      loading: true,
      isAvailable: false,
    }))
  }

  const logIn = async () => {
    try {
      await fcl.logIn()
    } catch (error) {
      console.error('Login error:', error)
    }
  }

  const logOut = async () => {
    try {
      await fcl.unauthenticate()
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  const authenticate = async () => {
    try {
      const authenticated = await fcl.authenticate()
      return authenticated
    } catch (error) {
      console.error('Authentication error:', error)
      return null
    }
  }

  return {
    ...state,
    switchNetwork,
    logIn,
    logOut,
    authenticate,
    fcl: fclConfig(state.network),
  }
}