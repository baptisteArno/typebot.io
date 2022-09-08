type OctadeskConfig = {
    basePath: String,
    environment: String
}

const config: OctadeskConfig = {
    basePath: process.env.BASE_PATH === undefined ? '' : process.env.BASE_PATH,
    environment: process.env.NODE_ENV_OCTADESK === undefined ? 'production' : process.env.NODE_ENV_OCTADESK,
}

export {
    config
}
