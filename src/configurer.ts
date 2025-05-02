import { core, fs, getDockerConfigPath, readDockerConfig } from "./utils";

interface DockerConfig {
  credHelpers?: Record<string, string>;
  [key: string]: unknown;
}

/**
 * Updates the Docker config file to use docker-credential-env for the specified registries
 */
export async function configureDockerRegistries(
  registries: string[],
): Promise<void> {
  const configPath = getDockerConfigPath();
  core.debug(`Docker config path: ${configPath}`);

  // Read current config
  const config = readDockerConfig(configPath) as DockerConfig;

  // Initialize credHelpers if it doesn't exist
  if (!config.credHelpers) {
    config.credHelpers = {};
  }

  // Update credHelpers with registries
  let modified = false;
  for (const registry of registries) {
    if (
      registry &&
      (!config.credHelpers[registry] || config.credHelpers[registry] !== "env")
    ) {
      core.info(`Configuring ${registry} to use docker-credential-env`);
      config.credHelpers[registry] = "env";
      modified = true;
    }
  }

  // Save the updated config if changes were made
  if (modified) {
    try {
      fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
      core.info(`Updated Docker config at ${configPath}`);
    } catch (err) {
      throw new Error(`Failed to update Docker config: ${err}`);
    }
  } else {
    core.info("No changes needed to Docker config");
  }
}
