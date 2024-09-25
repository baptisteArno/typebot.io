import * as p from "@clack/prompts";
import prisma from "@typebot.io/prisma";
import { promptAndSetEnvironment } from "./utils";

const getCoupon = async () => {
  await promptAndSetEnvironment("production");

  const val = (await p.text({
    message: "Enter coupon code",
  })) as string;

  const coupon = await prisma.coupon.findFirst({
    where: {
      code: val,
    },
  });

  if (!coupon) {
    console.log("Coupon not found");
    return;
  }

  console.log(JSON.stringify(coupon, null, 2));
};

getCoupon();
