import prisma from "@typebot.io/prisma";
import {
  assertProductionEnvironment,
  getRequiredInput,
  runScript,
} from "./cli";

const getCoupon = async () => {
  assertProductionEnvironment();

  const val = await getRequiredInput({
    message: "Enter coupon code",
    name: "code",
  });

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

runScript(getCoupon);
