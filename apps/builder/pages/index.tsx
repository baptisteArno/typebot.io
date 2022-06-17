function RedirectPage() {
  return
}

export const getServerSideProps = async (
) => {
  return { 
    redirect: { permanent: false, destination: '/typebots/' }
  }
}

export default RedirectPage
