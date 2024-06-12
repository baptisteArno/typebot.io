import { sendMagicLinkEmail } from '@typebot.io/emails'
//import { PrismaClient } from '@prisma/client';

type Props = {
  identifier: string
  url: string
}

export const sendVerificationRequest = async ({ identifier, url }: Props) => {
  try {
    //await insertData({identifier, url})

    await sendMagicLinkEmail({ url, to: identifier })
  } catch (err) {
    console.log(err)
    throw new Error(`Email(s) could not be sent `)
  }
}

/*
async function insertData({ identifier, url }: Props) {
  console.log("inser")
  const prisma = new PrismaClient();
  try {
    
    const insert = {
      user: identifier,
      hash: url,
    };

    const insertUrl = await prisma.Embed.in({
      data: insert,
    });

    const novoId = insertUrl.id;
    console.log("ide inserido", novoId)

    console.log('Url inserida', insertUrl);
  } catch (error) {
    console.error('Erro ao inserir url:', error);
  } finally {
    await prisma.disconnect()
  }
}

*/
