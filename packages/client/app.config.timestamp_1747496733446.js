// app.config.ts
import { defineConfig } from "@tanstack/react-start/config";
var app_config_default = defineConfig({
  server: {
    prerender: {
      routes: ["/about"],
      crawlLinks: true
    }
  }
});
export {
  app_config_default as default
};
