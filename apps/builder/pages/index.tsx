function RedirectPage() {
  return
}

export const getServerSideProps = async (
) => {
  return { 
    redirect: { permanent: false, destination: `${process.env.BASE_PATH || ''}/typebots/` }
  }
}

export default RedirectPage
