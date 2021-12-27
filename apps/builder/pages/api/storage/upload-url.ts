import aws from 'aws-sdk'
import { NextApiRequest, NextApiResponse } from 'next'
import { getSession } from 'next-auth/react'
import { methodNotAllowed } from 'services/api/utils'

const maxUploadFileSize = 10485760 // 10 MB
const handler = async (
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> => {
  try {
    res.setHeader('Access-Control-Allow-Origin', '*')
    if (req.method === 'GET') {
      const session = await getSession({ req })
      if (!session) {
        res.status(401)
        return
      }
      aws.config.update({
        accessKeyId: process.env.S3_UPLOAD_KEY,
        secretAccessKey: process.env.S3_UPLOAD_SECRET,
        region: process.env.S3_UPLOAD_REGION,
        signatureVersion: 'v4',
      })

      const s3 = new aws.S3()
      const post = s3.createPresignedPost({
        Bucket: process.env.S3_UPLOAD_BUCKET,
        Fields: {
          ACL: 'public-read',
          key: req.query.key,
          'Content-Type': req.query.fileType,
        },
        Expires: 120, // seconds
        Conditions: [['content-length-range', 0, maxUploadFileSize]],
      })

      return res.status(200).json(post)
    }
    return methodNotAllowed(res)
  } catch (err) {
    console.log(err)
  }
}

export default handler
