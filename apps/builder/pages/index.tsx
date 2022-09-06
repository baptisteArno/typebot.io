function RedirectPage() {
  return
}

export const getServerSideProps = async (
) => {
  return { 
    redirect: { permanent: false, destination: `${process.env.BASE_PATH_OCTADESK || ''}/typebots/` }
  }
}

export default RedirectPage
