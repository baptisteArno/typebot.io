import { useSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import { useEffect } from 'react'
import { User } from '@typebot/prisma'

export type withAuthProps = {
  user?: User
}

const withAuth =
  (WrappedComponent: ({ user }: withAuthProps) => JSX.Element) =>
  (props: JSX.IntrinsicAttributes & withAuthProps) => {
    const router = useRouter()
    const { data: session, status } = useSession()

    useEffect(() => {
      if (!router.isReady) return
      if (status === 'loading') return
      if (status === 'unauthenticated') router.replace('/signin')
    }, [status, router])

    return (
      <WrappedComponent user={session?.user as User | undefined} {...props} />
    )
  }

export default withAuth
