import path from "node:path";
import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

const rootDir = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(rootDir, "src"),
    },
  },
  build: {
    rolldownOptions: {
      output: {
        codeSplitting: {
          groups: [
            {
              name: "react-vendor",
              test: /node_modules[\\/](react|react-dom|scheduler)[\\/]/,
              priority: 30,
            },
            {
              name: "motion-vendor",
              test: /node_modules[\\/](framer-motion|three|recharts|react-leaflet|leaflet)[\\/]/,
              priority: 20,
              minSize: 20000,
            },
            {
              name: "ui-vendor",
              test: /node_modules[\\/](?:@radix-ui|lucide-react|cmdk|vaul)[\\/]/,
              priority: 15,
              minSize: 20000,
            },
            {
              name: "vendor",
              test: /node_modules[\\/]/,
              priority: 5,
              minSize: 20000,
              maxSize: 240000,
            },
          ],
        },
        strictExecutionOrder: true,
      },
    },
  },
});
