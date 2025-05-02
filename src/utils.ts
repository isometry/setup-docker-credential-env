import * as core from "@actions/core";
import * as tc from "@actions/tool-cache";
import * as http from "@actions/http-client";
import * as path from "path";
import * as fs from "fs";
import * as os from "os";

// Reexport commonly used modules
export { core, tc, http, path, fs, os };

/**
 * HttpClient wrapper to avoid multiple imports
 */
export class HttpClient extends http.HttpClient {
  constructor(userAgent: string = "setup-docker-credential-env-action") {
    super(userAgent);
  }
}

/**
 * Gets the platform-specific information for the current runner
 */
export function getPlatformInfo(): { os: string; arch: string } {
  // Map OS name to release OS format
  const runnerOs = process.platform;
  const osMap: Record<string, string> = {
    win32: "windows",
    darwin: "darwin",
    linux: "linux",
  };

  const os = osMap[runnerOs] || runnerOs;

  // Map architecture to release architecture format
  const runnerArch = process.arch;
  const archMap: Record<string, string> = {
    x64: "amd64",
    arm64: "arm64",
  };

  const arch = archMap[runnerArch] || runnerArch;

  return { os, arch };
}

/**
 * Gets the path to the Docker config file
 */
export function getDockerConfigPath(): string {
  const dockerConfigDir =
    process.env.DOCKER_CONFIG || path.join(os.homedir(), ".docker");

  // Create directory if it doesn't exist
  if (!fs.existsSync(dockerConfigDir)) {
    fs.mkdirSync(dockerConfigDir, { recursive: true });
  }

  return path.join(dockerConfigDir, "config.json");
}

/**
 * Reads the Docker config file, or creates a new one if it doesn't exist
 */
export function readDockerConfig(configPath: string): Record<string, any> {
  try {
    if (fs.existsSync(configPath)) {
      const content = fs.readFileSync(configPath, "utf-8");
      return JSON.parse(content);
    }
  } catch (err) {
    core.warning(`Error reading Docker config: ${err}. Creating a new one.`);
  }

  // Return an empty config if file doesn't exist or can't be parsed
  return {};
}
