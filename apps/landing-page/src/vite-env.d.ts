/// <reference types="vite/client" />

// CSS URL imports
declare module "*.css?url" {
  const url: string;
  export default url;
}

// CSS inline imports
declare module "*.css" {
  const css: string;
  export default css;
}

// Other asset URL imports
declare module "*.svg?url" {
  const url: string;
  export default url;
}

declare module "*.png?url" {
  const url: string;
  export default url;
}

declare module "*.jpg?url" {
  const url: string;
  export default url;
}

declare module "*.jpeg?url" {
  const url: string;
  export default url;
}

declare module "*.gif?url" {
  const url: string;
  export default url;
}

declare module "*.webp?url" {
  const url: string;
  export default url;
}
