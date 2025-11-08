# check-engine Containerization Strategy

**Document Version:** 1.0  
**Date:** 2025-11-08  
**Status:** Planning Phase

## Overview

This document outlines the comprehensive strategy for containerizing the check-engine project, enabling consistent development environments, simplified CI/CD integration, and cloud-native deployments.

---

## Goals

### Primary Goals
1. **Consistency:** Ensure identical environments across development, CI/CD, and production
2. **Portability:** Run check-engine anywhere containers are supported
3. **Pre-installed Tools:** Include common development tools in the image
4. **Efficiency:** Optimize image size and build times
5. **Security:** Follow container security best practices

### Secondary Goals
1. Support multiple architectures (amd64, arm64)
2. Provide multiple image variants for different use cases
3. Enable easy customization and extension
4. Integrate seamlessly with CI/CD pipelines
5. Support orchestration platforms (Kubernetes, Docker Swarm, etc.)

---

## Architecture

### Image Variants

We will provide three primary image variants:

#### 1. Base Image (`check-engine:base`)
**Purpose:** Minimal image with just check-engine installed

**Contents:**
- Node.js runtime
- check-engine package
- Basic system utilities

**Size Target:** <50MB  
**Use Case:** When host has all required tools, just need check-engine

```dockerfile
FROM node:20-alpine
RUN npm install -g check-engine@latest
WORKDIR /workspace
ENTRYPOINT ["check-engine"]
```

---

#### 2. Standard Image (`check-engine:latest`, `check-engine:standard`)
**Purpose:** Image with common development tools pre-installed

**Contents:**
- Node.js runtime
- check-engine package
- git
- npm, yarn, pnpm
- Common build tools

**Size Target:** <200MB  
**Use Case:** Most common scenarios, general development environment validation

```dockerfile
FROM node:20-alpine

# Install common tools
RUN apk add --no-cache \
    git \
    python3 \
    make \
    g++ \
    && npm install -g check-engine@latest yarn pnpm

WORKDIR /workspace
ENTRYPOINT ["check-engine"]
```

---

#### 3. Full Image (`check-engine:full`)
**Purpose:** Comprehensive image with extensive tooling for complex projects

**Contents:**
- All tools from Standard image
- Additional language runtimes (Python, Ruby, Go)
- Cloud CLIs (aws, gcloud, az)
- Container tools (docker client)
- Build tools (gradle, maven)
- Additional utilities

**Size Target:** <500MB  
**Use Case:** Complex multi-language projects, full environment validation

```dockerfile
FROM node:20

# Install comprehensive tooling
RUN apt-get update && apt-get install -y \
    git \
    python3 \
    ruby \
    golang \
    default-jdk \
    maven \
    gradle \
    && npm install -g check-engine@latest yarn pnpm bower \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Install cloud CLIs
RUN curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip" \
    && unzip awscliv2.zip \
    && ./aws/install \
    && rm -rf aws awscliv2.zip

WORKDIR /workspace
ENTRYPOINT ["check-engine"]
```

---

## Multi-Stage Build Strategy

### Build Stage
Optimize builds with multi-stage Dockerfiles:

```dockerfile
# Stage 1: Build/Install
FROM node:20-alpine AS builder
WORKDIR /build
COPY package*.json ./
RUN npm ci --only=production

# Stage 2: Runtime
FROM node:20-alpine
RUN apk add --no-cache git
WORKDIR /app

# Copy from builder
COPY --from=builder /build/node_modules ./node_modules
COPY . .

# Security: Run as non-root
RUN addgroup -g 1001 -S checkengine && \
    adduser -S -D -H -u 1001 -s /sbin/nologin -G checkengine checkengine && \
    chown -R checkengine:checkengine /app

USER checkengine

ENTRYPOINT ["node", "/app/bin/check-engine.js"]
```

**Benefits:**
- Smaller final image
- No build dependencies in production image
- Better layer caching
- Improved security

---

## Multi-Architecture Support

### Supported Architectures
- `linux/amd64` (Intel/AMD 64-bit)
- `linux/arm64` (ARM 64-bit, Apple M1/M2, AWS Graviton)
- `linux/arm/v7` (ARM 32-bit, Raspberry Pi)

### Build Configuration

Using Docker Buildx for multi-architecture builds:

```bash
# Create builder
docker buildx create --name multi-arch-builder --use

# Build for multiple platforms
docker buildx build \
  --platform linux/amd64,linux/arm64,linux/arm/v7 \
  --tag ghcr.io/mohlsen/check-engine:latest \
  --push \
  .
```

### GitHub Actions Integration

```yaml
name: Build Multi-Arch Images

on:
  push:
    tags:
      - 'v*'

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Set up QEMU
        uses: docker/setup-qemu-action@v3
      
      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3
      
      - name: Login to GHCR
        uses: docker/login-action@v3
        with:
          registry: ghcr.io
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}
      
      - name: Extract metadata
        id: meta
        uses: docker/metadata-action@v5
        with:
          images: ghcr.io/mohlsen/check-engine
          tags: |
            type=semver,pattern={{version}}
            type=semver,pattern={{major}}.{{minor}}
            type=semver,pattern={{major}}
            type=raw,value=latest,enable={{is_default_branch}}
      
      - name: Build and push
        uses: docker/build-push-action@v5
        with:
          context: .
          platforms: linux/amd64,linux/arm64,linux/arm/v7
          push: true
          tags: ${{ steps.meta.outputs.tags }}
          labels: ${{ steps.meta.outputs.labels }}
          cache-from: type=gha
          cache-to: type=gha,mode=max
```

---

## Image Tagging Strategy

### Semantic Versioning Tags
```
ghcr.io/mohlsen/check-engine:1.15.0       # Specific version
ghcr.io/mohlsen/check-engine:1.15         # Minor version
ghcr.io/mohlsen/check-engine:1            # Major version
ghcr.io/mohlsen/check-engine:latest       # Latest release
```

### Variant Tags
```
ghcr.io/mohlsen/check-engine:base         # Minimal
ghcr.io/mohlsen/check-engine:standard     # Standard (default)
ghcr.io/mohlsen/check-engine:full         # Full tooling
ghcr.io/mohlsen/check-engine:1.15.0-base  # Version + variant
```

### Additional Tags
```
ghcr.io/mohlsen/check-engine:edge         # Latest from main branch
ghcr.io/mohlsen/check-engine:sha-abc123   # Specific commit
ghcr.io/mohlsen/check-engine:pr-42        # Pull request preview
```

---

## Security Best Practices

### 1. Non-Root User
Always run as non-root user:

```dockerfile
# Create user
RUN addgroup -g 1001 -S checkengine && \
    adduser -S -D -H -u 1001 -s /sbin/nologin -G checkengine checkengine

# Switch to user
USER checkengine
```

### 2. Minimal Base Images
Use Alpine or distroless images:

```dockerfile
# Alpine (small, has shell)
FROM node:20-alpine

# Distroless (no shell, most secure)
FROM gcr.io/distroless/nodejs20-debian12
```

### 3. Security Scanning
Integrate security scanning in CI/CD:

```yaml
- name: Run Trivy scanner
  uses: aquasecurity/trivy-action@master
  with:
    image-ref: ghcr.io/mohlsen/check-engine:latest
    format: 'sarif'
    output: 'trivy-results.sarif'

- name: Upload Trivy results
  uses: github/codeql-action/upload-sarif@v2
  with:
    sarif_file: 'trivy-results.sarif'
```

### 4. No Secrets in Images
- Never bake secrets into images
- Use build secrets for private packages:

```dockerfile
# Mount secret during build
RUN --mount=type=secret,id=npmrc,target=/root/.npmrc \
    npm ci --only=production
```

### 5. Vulnerability Patching
- Regular base image updates
- Automated dependency updates via Dependabot
- Monitor CVE databases

---

## Docker Compose Integration

### Development Environment

```yaml
# docker-compose.yml
version: '3.8'

services:
  check-engine:
    image: ghcr.io/mohlsen/check-engine:latest
    volumes:
      - .:/workspace:ro
    working_dir: /workspace
    command: ["/workspace/package.json"]
    environment:
      - NODE_ENV=development

  # With custom package.json
  check-custom:
    image: ghcr.io/mohlsen/check-engine:latest
    volumes:
      - ./custom-package.json:/app/package.json:ro
    command: ["/app/package.json"]

  # Full variant for complex projects
  check-full:
    image: ghcr.io/mohlsen/check-engine:full
    volumes:
      - .:/workspace:ro
    working_dir: /workspace
```

### CI/CD Integration

```yaml
# docker-compose.ci.yml
version: '3.8'

services:
  validate:
    image: ghcr.io/mohlsen/check-engine:standard
    volumes:
      - .:/workspace:ro
    working_dir: /workspace
    command: ["/workspace/package.json"]
    
  # Run in CI
  ci-check:
    image: ghcr.io/mohlsen/check-engine:standard
    volumes:
      - ./package.json:/package.json:ro
    command: ["/package.json", "--ignore"]
    exit_code_from: 0
```

---

## Usage Examples

### Basic Usage

```bash
# Pull image
docker pull ghcr.io/mohlsen/check-engine:latest

# Run with current directory mounted
docker run --rm -v $(pwd):/workspace \
  ghcr.io/mohlsen/check-engine:latest \
  /workspace/package.json

# Run with specific variant
docker run --rm -v $(pwd):/workspace \
  ghcr.io/mohlsen/check-engine:full \
  /workspace/package.json
```

### CI/CD Integration

#### GitHub Actions
```yaml
jobs:
  validate:
    runs-on: ubuntu-latest
    container:
      image: ghcr.io/mohlsen/check-engine:standard
    steps:
      - uses: actions/checkout@v4
      - name: Validate environment
        run: check-engine package.json
```

#### GitLab CI
```yaml
validate:
  image: ghcr.io/mohlsen/check-engine:standard
  script:
    - check-engine package.json
```

#### Jenkins
```groovy
pipeline {
  agent {
    docker {
      image 'ghcr.io/mohlsen/check-engine:standard'
    }
  }
  stages {
    stage('Validate') {
      steps {
        sh 'check-engine package.json'
      }
    }
  }
}
```

### Local Development

```bash
# Create alias for convenience
alias check-engine='docker run --rm -v $(pwd):/workspace ghcr.io/mohlsen/check-engine:latest /workspace/package.json'

# Use like native command
check-engine

# With options
check-engine --ignore
```

---

## Kubernetes Integration

### Job for One-Time Validation

```yaml
apiVersion: batch/v1
kind: Job
metadata:
  name: environment-validation
spec:
  template:
    spec:
      restartPolicy: Never
      containers:
      - name: check-engine
        image: ghcr.io/mohlsen/check-engine:standard
        command: ["check-engine"]
        args: ["/config/package.json"]
        volumeMounts:
        - name: config
          mountPath: /config
          readOnly: true
      volumes:
      - name: config
        configMap:
          name: package-json
```

### InitContainer for Pre-Deployment Validation

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: my-app
spec:
  template:
    spec:
      initContainers:
      - name: validate-environment
        image: ghcr.io/mohlsen/check-engine:standard
        command: ["check-engine"]
        args: ["/config/package.json"]
        volumeMounts:
        - name: config
          mountPath: /config
          readOnly: true
      
      containers:
      - name: app
        image: my-app:latest
        # ... app configuration
      
      volumes:
      - name: config
        configMap:
          name: package-json
```

### CronJob for Periodic Validation

```yaml
apiVersion: batch/v1
kind: CronJob
metadata:
  name: environment-check
spec:
  schedule: "0 */6 * * *"  # Every 6 hours
  jobTemplate:
    spec:
      template:
        spec:
          restartPolicy: OnFailure
          containers:
          - name: check-engine
            image: ghcr.io/mohlsen/check-engine:standard
            command: ["check-engine"]
            args: ["/config/package.json"]
            volumeMounts:
            - name: config
              mountPath: /config
              readOnly: true
          volumes:
          - name: config
            configMap:
              name: package-json
```

---

## Performance Optimization

### 1. Layer Caching
Order Dockerfile commands from least to most frequently changing:

```dockerfile
# Base layers (change rarely)
FROM node:20-alpine
RUN apk add --no-cache git

# Dependencies (change occasionally)
COPY package*.json ./
RUN npm ci --only=production

# Application code (changes frequently)
COPY . .
```

### 2. .dockerignore
Exclude unnecessary files:

```
node_modules
npm-debug.log
.git
.github
.vscode
.DS_Store
*.md
!README.md
test
*.test.js
*.spec.js
coverage
.nyc_output
dist
build
```

### 3. Build Cache
Use BuildKit cache mounts:

```dockerfile
RUN --mount=type=cache,target=/root/.npm \
    npm ci --only=production
```

### 4. Parallel Builds
Use GitHub Actions matrix for parallel builds:

```yaml
strategy:
  matrix:
    variant: [base, standard, full]
    platform: [linux/amd64, linux/arm64]
```

---

## Monitoring and Debugging

### Health Check
Add health check to Dockerfile:

```dockerfile
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD check-engine --version || exit 1
```

### Logging
Configure for container environments:

```dockerfile
ENV NODE_ENV=production
ENV LOG_LEVEL=info
ENV LOG_FORMAT=json
```

### Debugging
Enable debug mode:

```bash
# Run with debug
docker run --rm -e DEBUG=check-engine:* \
  ghcr.io/mohlsen/check-engine:latest \
  package.json

# Interactive shell for debugging
docker run --rm -it --entrypoint /bin/sh \
  ghcr.io/mohlsen/check-engine:latest
```

---

## Distribution Strategy

### Primary: GitHub Container Registry (GHCR)
```
ghcr.io/mohlsen/check-engine
```

**Advantages:**
- Free for public repositories
- Integrated with GitHub
- Automatic authentication
- Good performance

### Secondary: Docker Hub
```
docker.io/mohlsen/check-engine
```

**Advantages:**
- Most popular registry
- Better discoverability
- Broader compatibility

### Image Synchronization
Sync images between registries:

```yaml
- name: Push to Docker Hub
  uses: akhilerm/tag-push-action@v2.1.0
  with:
    src: ghcr.io/mohlsen/check-engine:${{ github.ref_name }}
    dst: docker.io/mohlsen/check-engine:${{ github.ref_name }}
```

---

## Testing Strategy

### 1. Build Testing
Test that images build successfully:

```bash
docker build --target base -t check-engine:base .
docker build --target standard -t check-engine:standard .
docker build --target full -t check-engine:full .
```

### 2. Functionality Testing
Test that check-engine works in containers:

```bash
# Test basic functionality
docker run --rm check-engine:standard --version

# Test with sample package.json
docker run --rm -v ./test:/workspace check-engine:standard /workspace/package.json
```

### 3. Security Testing
Scan images for vulnerabilities:

```bash
# Trivy scan
trivy image ghcr.io/mohlsen/check-engine:latest

# Grype scan
grype ghcr.io/mohlsen/check-engine:latest
```

### 4. Size Testing
Monitor image sizes:

```bash
docker images | grep check-engine
```

Target sizes:
- Base: <50MB
- Standard: <200MB
- Full: <500MB

---

## Documentation Requirements

### README Additions
- Container usage section
- Quick start with Docker
- Links to image registry
- Common use cases

### Separate Container Docs
Create `docs/container-usage.md`:
- Detailed usage examples
- Kubernetes integration
- CI/CD examples
- Troubleshooting
- Custom image building

---

## Migration Path

### Phase 1: Create Basic Images
1. Create Dockerfile for base variant
2. Set up GitHub Actions for building
3. Push to GHCR
4. Document basic usage

### Phase 2: Add Variants
1. Create standard variant
2. Create full variant
3. Add multi-arch support
4. Improve documentation

### Phase 3: Advanced Features
1. Add Kubernetes manifests
2. Create Helm chart
3. Add cloud platform examples
4. Create comprehensive docs

### Phase 4: Optimization
1. Optimize build times
2. Reduce image sizes
3. Improve caching
4. Performance tuning

---

## Success Metrics

### Build Metrics
- ✅ Build time <5 minutes per variant
- ✅ All variants build successfully
- ✅ Multi-arch support working

### Size Metrics
- ✅ Base image <50MB
- ✅ Standard image <200MB
- ✅ Full image <500MB

### Security Metrics
- ✅ Zero high/critical vulnerabilities
- ✅ Running as non-root
- ✅ No secrets in images

### Usage Metrics
- ✅ Documentation complete
- ✅ Examples working
- ✅ Community feedback positive

---

## Conclusion

This containerization strategy provides a comprehensive approach to making check-engine container-ready. By offering multiple variants, supporting multiple architectures, and following security best practices, we ensure that check-engine can be used effectively in modern containerized and cloud-native environments.

The phased approach allows for incremental implementation while maintaining quality and security standards. The resulting container images will be secure, efficient, and easy to use across a variety of platforms and use cases.

