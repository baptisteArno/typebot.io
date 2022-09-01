function RedirectPage() {
  return
}

export const getServerSideProps = async (
) => {
  return { 
    redirect: { permanent: false, destination: '/embed/builder/typebots/' }
  }
}

export default RedirectPage
