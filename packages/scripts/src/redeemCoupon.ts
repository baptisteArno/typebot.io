import prisma from "@typebot.io/prisma";
import {
  assertProductionEnvironment,
  confirmAction,
  getRequiredInput,
  runScript,
} from "./cli";

const redeemCoupon = async () => {
  assertProductionEnvironment();

  const code = await getRequiredInput({
    message: "Coupon code?",
    name: "code",
  });

  if (
    !(await confirmAction({
      message: `Mark coupon ${code} as redeemed in production?`,
    }))
  )
    return;

  const coupon = await prisma.coupon.update({
    where: {
      code,
    },
    data: {
      dateRedeemed: new Date(),
    },
  });

  console.log(coupon);
};

runScript(redeemCoupon);
