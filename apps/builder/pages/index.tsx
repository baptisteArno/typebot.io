import { config } from 'config/octadesk.config'

function RedirectPage() {
  return
}

export const getServerSideProps = async (
) => {
  return { 
    redirect: { permanent: false, destination: `${config.basePath || ''}/typebots/` }
  }
}

export default RedirectPage
