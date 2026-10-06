import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  turbopack: {
    // 親ディレクトリの package-lock.json を誤検知しないようにする
    root: path.join(__dirname),
  },
};

export default nextConfig;
