import { getLandingPageVisitors } from "./helpers/getLandingPageVisitors";

const executePlayground = async () => {
  const result = await getLandingPageVisitors();
  console.log(result);
};

executePlayground();
