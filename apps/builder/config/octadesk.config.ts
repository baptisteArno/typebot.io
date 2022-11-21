type OctadeskConfig = {
    basePath: String
    environment?: String
    local?: Boolean
}

const config: OctadeskConfig = {
    local: process.env.IS_LOCAL === 'true',
    basePath: process.env.BASEPATH || '',
    environment: process.env.NODE_ENV_OCTADESK
}

export {
    config
}