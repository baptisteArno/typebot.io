import prisma from "@typebot.io/prisma";
import { promptAndSetEnvironment } from "./utils";

const executePlayground = async () => {
  await promptAndSetEnvironment();

  const result = await prisma.workspace.findMany({
    where: {
      members: {
        some: {
          user: {
            email: "",
          },
        },
      },
    },
    include: {
      members: true,
      typebots: {
        select: {
          name: true,
          riskLevel: true,
          id: true,
        },
      },
    },
  });
  console.log(JSON.stringify(result));

  // await prisma.bannedIp.deleteMany({})

  // const result = await prisma.coupon.findMany({
  //   where: {
  //     code: '',
  //   },
  // })

  // console.log(result)
};

executePlayground();
