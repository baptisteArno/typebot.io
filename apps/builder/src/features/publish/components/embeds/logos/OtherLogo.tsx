import { colors } from "@/lib/theme";
import { Icon, type IconProps, useColorModeValue } from "@chakra-ui/react";

export const OtherLogo = (props: IconProps) => {
  const stroke = useColorModeValue("black", colors.gray[200]);
  return (
    <Icon
      width="512"
      height="512"
      viewBox="0 0 512 512"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M256 282C270.359 282 282 270.359 282 256C282 241.641 270.359 230 256 230C241.641 230 230 241.641 230 256C230 270.359 241.641 282 256 282Z"
        fill={stroke}
      />
      <path
        d="M346 282C360.359 282 372 270.359 372 256C372 241.641 360.359 230 346 230C331.641 230 320 241.641 320 256C320 270.359 331.641 282 346 282Z"
        fill={stroke}
      />
      <path
        d="M166 282C180.359 282 192 270.359 192 256C192 241.641 180.359 230 166 230C151.641 230 140 241.641 140 256C140 270.359 151.641 282 166 282Z"
        fill={stroke}
      />
      <path
        d="M448 256C448 150 362 64 256 64C150 64 64 150 64 256C64 362 150 448 256 448C362 448 448 362 448 256Z"
        stroke={stroke}
        strokeWidth="32"
        strokeMiterlimit="10"
      />
    </Icon>
  );
};
