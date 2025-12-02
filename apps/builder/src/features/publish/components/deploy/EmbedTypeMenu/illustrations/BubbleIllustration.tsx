import { motion } from "motion/react";
import { animationVariants } from "./animationVariants";

export const BubbleIllustration = () => {
  return (
    <svg
      width="100"
      viewBox="0 0 500 500"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="light"
    >
      <rect width="500" height="500" rx="20" className="fill-gray-6" />
      <rect x="164" y="59" width="287" height="305" rx="10" fill="#0042DA" />
      <motion.rect
        x="227"
        y="91"
        width="156"
        height="34"
        rx="10"
        className="fill-blue-1"
        variants={animationVariants}
      />
      <motion.rect
        x="227"
        y="134"
        width="156"
        height="65"
        rx="10"
        className="fill-blue-1"
        variants={animationVariants}
      />

      <motion.circle
        cx="198"
        cy="228"
        r="20"
        className="fill-blue-1"
        variants={animationVariants}
      />
      <motion.rect
        x="227"
        y="208"
        width="156"
        height="40"
        rx="10"
        className="fill-blue-1"
        variants={animationVariants}
      />
      <motion.circle
        cx="412"
        cy="277"
        r="20"
        className="fill-blue-1"
        variants={animationVariants}
      />
      <motion.rect
        x="253"
        y="257"
        width="130"
        height="40"
        rx="10"
        className="fill-blue-1"
        variants={animationVariants}
      />

      <circle cx="411" cy="430" r="40" fill="#0042DA" />
    </svg>
  );
};
