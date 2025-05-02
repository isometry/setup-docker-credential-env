import { core } from "./utils";
import { installDockerCredentialEnv } from "./installer";
import { configureDockerRegistries } from "./configurer";

async function run(): Promise<void> {
  try {
    // Get inputs
    const version = core.getInput("version");
    const registriesInput = core.getInput("registries");
    const registries = registriesInput.split(/\s+/).filter(Boolean);

    core.info(
      `Setting up docker-credential-env ${version} for registries: ${registries.join(", ")}`,
    );

    // Install the binary
    const { binaryPath, resolvedVersion } =
      await installDockerCredentialEnv(version);

    // Configure Docker registries
    await configureDockerRegistries(registries);

    core.info("🔐 docker-credential-env setup complete");
    core.setOutput("binary-path", binaryPath);
    core.setOutput("version", resolvedVersion);
  } catch (error) {
    if (error instanceof Error) {
      core.setFailed(error.message);
    } else {
      core.setFailed(`Unknown error: ${error}`);
    }
  }
}

run();
