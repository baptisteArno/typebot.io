import { useContext } from 'react'
import { userContext } from '../UserProvider'

export const useUser = () => useContext(userContext)
