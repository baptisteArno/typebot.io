type OctadeskConfig = {
    basePath: String,
    environment: String
}

const config: OctadeskConfig = {
    basePath: process.env.IS_LOCAL === 'true' ? '' : '/embed/viewer',
    environment: process.env.NODE_ENV_OCTADESK === undefined ? 'production' : process.env.NODE_ENV_OCTADESK,
}

export {
    config
}
