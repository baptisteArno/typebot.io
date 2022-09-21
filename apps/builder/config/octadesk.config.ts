type OctadeskConfig = {
    basePath: String,
    environment: String
    local: Boolean,
    viewerURL: String
}

const config: OctadeskConfig = {
    local: process.env.IS_LOCAL === 'true',
    basePath: process.env.IS_LOCAL === 'true' ? '' : '/embed/builder',
    environment: process.env.NODE_ENV_OCTADESK === undefined ? 'production' : process.env.NODE_ENV_OCTADESK,
    viewerURL: process.env.IS_LOCAL === 'true' ? process.env.NEXT_PUBLIC_VIEWER_URL ? process.env.NEXT_PUBLIC_VIEWER_URL : '' : '/embed/viewer',
}

export {
    config
}
