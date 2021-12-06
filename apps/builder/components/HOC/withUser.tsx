import { useSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import { useEffect } from 'react'

const withAuth =
  (WrappedComponent: (props: any) => JSX.Element) =>
  (props: JSX.IntrinsicAttributes) => {
    const router = useRouter()
    const { status } = useSession()

    useEffect(() => {
      if (!router.isReady) return
      if (status === 'loading') return
      if (status === 'unauthenticated') router.replace('/signin')
    }, [status, router])

    return <WrappedComponent {...props} />
  }

export default withAuth
