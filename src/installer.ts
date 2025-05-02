import { core, tc, path, fs, getPlatformInfo, HttpClient } from "./utils";

const TOOL_NAME = "docker-credential-env";
const REPOSITORY = "isometry/docker-credential-env";

/**
 * Gets the latest release version from GitHub API
 */
async function getLatestVersion(): Promise<string> {
  core.info("Determining latest version of docker-credential-env...");
  const http = new HttpClient();

  const response = await http.getJson<{ tag_name: string }>(
    `https://api.github.com/repos/${REPOSITORY}/releases/latest`,
  );

  if (!response.result) {
    throw new Error("Failed to get latest release version");
  }

  // Remove 'v' prefix if present
  const version = response.result.tag_name.replace(/^v/, "");
  core.info(`Latest version is ${version}`);
  return version;
}

/**
 * Downloads and installs docker-credential-env
 */
export async function installDockerCredentialEnv(
  requestedVersion: string,
): Promise<{ binaryPath: string; resolvedVersion: string }> {
  const { os: osName, arch } = getPlatformInfo();

  // Resolve 'latest' version if needed
  const resolvedVersion =
    requestedVersion === "latest" ? await getLatestVersion() : requestedVersion;

  // Check if tool is already in the cache
  let toolPath = tc.find(TOOL_NAME, resolvedVersion);

  if (toolPath) {
    core.info(`Found ${TOOL_NAME} ${resolvedVersion} in tool cache`);
  } else {
    core.info(
      `Downloading ${TOOL_NAME} ${resolvedVersion} for ${osName}_${arch}...`,
    );

    // Construct download URL
    const downloadUrl = `https://github.com/${REPOSITORY}/releases/download/v${resolvedVersion}/${TOOL_NAME}_${resolvedVersion}_${osName}_${arch}.zip`;

    // Download the tool
    const downloadPath = await tc.downloadTool(downloadUrl);

    // Extract the ZIP
    const extractedPath = await tc.extractZip(downloadPath);

    // Find binary inside the extracted directory
    let binaryFile = TOOL_NAME;
    if (osName === "windows") {
      binaryFile += ".exe";
    }

    const binaryPath = path.join(extractedPath, binaryFile);

    // Make binary executable
    if (osName !== "windows") {
      fs.chmodSync(binaryPath, "755");
    }

    // Cache the tool
    toolPath = await tc.cacheFile(
      binaryPath,
      binaryFile,
      TOOL_NAME,
      resolvedVersion,
    );
  }

  // Add tool to path
  core.addPath(toolPath);

  const binaryPath = path.join(
    toolPath,
    osName === "windows" ? `${TOOL_NAME}.exe` : TOOL_NAME,
  );
  core.info(`Added ${binaryPath} to PATH`);

  return { binaryPath, resolvedVersion };
}
