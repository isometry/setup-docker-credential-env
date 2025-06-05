# Docker Credential Env Setup Action

This GitHub Action installs [`docker-credential-env`](https://github.com/isometry/docker-credential-env) and configures Docker to use it for specified registries.

## Features

- Configures Docker to use environment variables for authentication for specified registries (default ghcr.io)
- Uses GitHub Actions runner tool cache for efficient caching
- Cross-platform support (Linux, macOS, Windows)

## Usage

Add the following step to your GitHub Actions workflow:

```yaml
- name: Setup docker-credential-env
  uses: isometry/setup-docker-credential-env@v1
  with:
    version: latest  # Optional: specific version or 'latest'
    registries: ghcr.io docker.io quay.io  # Optional: whitespace-delimited list of registries
```

## Inputs

| Name | Description | Required | Default |
|------|-------------|----------|---------|
| `version` | Version of docker-credential-env to install (e.g., '1.3.1' or 'latest') | No | `latest` |
| `registries` | Whitespace-delimited list of OCI registries to configure | No | `ghcr.io` |

## Outputs

| Name | Description |
|------|-------------|
| `binary-path` | Path to the installed docker-credential-env binary |
| `version` | The version of docker-credential-env that was installed |

## Example Workflows

### Basic usage with GitHub Packages

```yaml
name: Build and Push

on:
  push:
    branches: [ main ]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup docker-credential-env
        uses: isometry/setup-docker-credential-env@v1
      
      - name: Build and push
        run: |
          docker build -t ghcr.io/myorg/myapp:latest .
          docker push ghcr.io/myorg/myapp:latest
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

### Multiple registries with different credentials

```yaml
name: Push to Multiple Registries

on:
  release:
    types: [published]

jobs:
  push:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup docker-credential-env
        uses: isometry/setup-docker-credential-env@v1
        with:
          registries: 'ghcr.io docker.io quay.io'
      
      - name: Build and push
        run: |
          docker build -t ghcr.io/myorg/myapp:${{ github.ref_name }} .
          docker tag ghcr.io/myorg/myapp:${{ github.ref_name }} docker.io/myorg/myapp:${{ github.ref_name }}
          docker tag ghcr.io/myorg/myapp:${{ github.ref_name }} quay.io/myorg/myapp:${{ github.ref_name }}
          
          docker push ghcr.io/myorg/myapp:${{ github.ref_name }}
          docker push docker.io/myorg/myapp:${{ github.ref_name }}
          docker push quay.io/myorg/myapp:${{ github.ref_name }}
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}  # For ghcr.io
          DOCKER_docker_io_USR: ${{ secrets.DOCKERHUB_USERNAME }}
          DOCKER_docker_io_PSW: ${{ secrets.DOCKERHUB_TOKEN }}
          DOCKER_quay_io_USR: ${{ secrets.QUAY_USERNAME }}
          DOCKER_quay_io_PSW: ${{ secrets.QUAY_PASSWORD }}
```

### Using with AWS ECR

```yaml
name: Push to AWS ECR

on:
  push:
    branches: [ main ]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup docker-credential-env
        uses: isometry/setup-docker-credential-env@v1
        with:
          registries: '123456789012.dkr.ecr.us-east-1.amazonaws.com'

      - name: Build and push
        env:
          AWS_ACCESS_KEY_ID: ${{ secrets.AWS_ACCESS_KEY_ID }}
          AWS_SECRET_ACCESS_KEY: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
        run: |
          docker build -t 123456789012.dkr.ecr.us-east-1.amazonaws.com/myapp:latest .
          docker push 123456789012.dkr.ecr.us-east-1.amazonaws.com/myapp:latest
```

## Development

This action is built using TypeScript and the [@actions/toolkit](https://github.com/actions/toolkit) libraries.

### Prerequisites

- Node.js 20+
- npm

### Setup

```bash
# Install dependencies
npm install

# Build the action
npm run build

# Run linting
npm run lint

# Format code
npm run format

# Run all checks and build
npm run all

# Update dependencies
npm run update-deps
```

## How It Works

1. The action determines the platform and architecture of the runner
2. It downloads the appropriate `docker-credential-env` binary for the platform
3. The binary is stored in the GitHub Actions tool cache for reuse
4. It updates `~/.docker/config.json` to use `docker-credential-env` for authentication with specified registries
5. When Docker needs to authenticate with a configured registry, it will use environment variables supplied by the workflow
