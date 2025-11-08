# check-engine Cloud-Native Deployment Guide

**Document Version:** 1.0  
**Date:** 2025-11-08  
**Status:** Planning Phase

## Overview

This guide provides comprehensive strategies for deploying and using check-engine in cloud-native environments, including Kubernetes, serverless platforms, and major cloud providers (AWS, Google Cloud, Azure).

---

## Table of Contents

1. [Kubernetes Deployment](#kubernetes-deployment)
2. [Helm Charts](#helm-charts)
3. [AWS Deployment](#aws-deployment)
4. [Google Cloud Deployment](#google-cloud-deployment)
5. [Azure Deployment](#azure-deployment)
6. [Serverless Deployment](#serverless-deployment)
7. [CI/CD Integration](#cicd-integration)
8. [Best Practices](#best-practices)

---

## Kubernetes Deployment

### Use Cases in Kubernetes

1. **Pre-deployment Validation** - InitContainer to validate environment before app starts
2. **Periodic Audits** - CronJob to regularly check environment compliance
3. **One-time Checks** - Job for ad-hoc validation
4. **Admission Control** - Webhook to validate deployments

---

### 1. Job - One-Time Validation

**Purpose:** Run environment validation as a one-time task

```yaml
apiVersion: batch/v1
kind: Job
metadata:
  name: check-engine-validation
  namespace: default
  labels:
    app: check-engine
    type: validation
spec:
  backoffLimit: 3
  completions: 1
  parallelism: 1
  template:
    metadata:
      labels:
        app: check-engine
        type: validation
    spec:
      restartPolicy: Never
      
      containers:
      - name: check-engine
        image: ghcr.io/mohlsen/check-engine:latest
        imagePullPolicy: IfNotPresent
        
        command: ["check-engine"]
        args: ["/config/package.json"]
        
        volumeMounts:
        - name: package-config
          mountPath: /config
          readOnly: true
        
        resources:
          requests:
            memory: "64Mi"
            cpu: "100m"
          limits:
            memory: "128Mi"
            cpu: "200m"
      
      volumes:
      - name: package-config
        configMap:
          name: package-json-config
```

**ConfigMap for package.json:**
```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: package-json-config
  namespace: default
data:
  package.json: |
    {
      "name": "my-app",
      "engines": {
        "node": ">=18",
        "npm": ">=8",
        "git": ">=2.30"
      }
    }
```

**Usage:**
```bash
# Create ConfigMap
kubectl apply -f configmap.yaml

# Run Job
kubectl apply -f job.yaml

# Check status
kubectl get jobs
kubectl logs job/check-engine-validation

# Cleanup
kubectl delete job check-engine-validation
```

---

### 2. InitContainer - Pre-Deployment Validation

**Purpose:** Validate environment before starting application containers

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: my-application
  namespace: default
spec:
  replicas: 3
  selector:
    matchLabels:
      app: my-application
  template:
    metadata:
      labels:
        app: my-application
    spec:
      # Environment validation before app starts
      initContainers:
      - name: validate-environment
        image: ghcr.io/mohlsen/check-engine:standard
        imagePullPolicy: IfNotPresent
        
        command: ["check-engine"]
        args: ["/config/package.json", "--ignore"]
        
        volumeMounts:
        - name: package-config
          mountPath: /config
          readOnly: true
        
        resources:
          requests:
            memory: "64Mi"
            cpu: "100m"
          limits:
            memory: "128Mi"
            cpu: "200m"
      
      # Main application container
      containers:
      - name: app
        image: my-application:latest
        ports:
        - containerPort: 8080
        
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
      
      volumes:
      - name: package-config
        configMap:
          name: package-json-config
```

**Benefits:**
- App only starts if environment is valid
- Fast failure feedback
- Prevents invalid deployments
- No performance impact on running app

---

### 3. CronJob - Periodic Validation

**Purpose:** Regularly audit environment compliance

```yaml
apiVersion: batch/v1
kind: CronJob
metadata:
  name: environment-audit
  namespace: default
spec:
  # Run every 6 hours
  schedule: "0 */6 * * *"
  
  # Keep last 3 successful and 1 failed job
  successfulJobsHistoryLimit: 3
  failedJobsHistoryLimit: 1
  
  jobTemplate:
    spec:
      template:
        metadata:
          labels:
            app: check-engine
            type: audit
        spec:
          restartPolicy: OnFailure
          
          containers:
          - name: check-engine
            image: ghcr.io/mohlsen/check-engine:standard
            imagePullPolicy: IfNotPresent
            
            command: ["check-engine"]
            args: ["/config/package.json"]
            
            volumeMounts:
            - name: package-config
              mountPath: /config
              readOnly: true
            
            # Send results to monitoring system
            env:
            - name: SLACK_WEBHOOK
              valueFrom:
                secretKeyRef:
                  name: monitoring-secrets
                  key: slack-webhook
            
            resources:
              requests:
                memory: "64Mi"
                cpu: "100m"
              limits:
                memory: "128Mi"
                cpu: "200m"
          
          volumes:
          - name: package-config
            configMap:
              name: package-json-config
```

**With Notification Script:**
```yaml
# Add notification sidecar
containers:
- name: notifier
  image: curlimages/curl:latest
  command: ["/bin/sh"]
  args:
  - -c
  - |
    RESULT=$(cat /shared/result.json)
    curl -X POST $SLACK_WEBHOOK -d "{\"text\": \"Environment Audit: $RESULT\"}"
  volumeMounts:
  - name: shared-data
    mountPath: /shared

volumes:
- name: shared-data
  emptyDir: {}
```

---

### 4. DaemonSet - Node Validation

**Purpose:** Validate environment on every node

```yaml
apiVersion: apps/v1
kind: DaemonSet
metadata:
  name: node-validator
  namespace: kube-system
spec:
  selector:
    matchLabels:
      name: node-validator
  template:
    metadata:
      labels:
        name: node-validator
    spec:
      tolerations:
      # Run on all nodes including master
      - effect: NoSchedule
        key: node-role.kubernetes.io/master
      
      hostNetwork: true
      hostPID: true
      
      containers:
      - name: validator
        image: ghcr.io/mohlsen/check-engine:full
        imagePullPolicy: IfNotPresent
        
        command: ["/bin/sh"]
        args:
        - -c
        - |
          while true; do
            check-engine /config/package.json
            sleep 3600
          done
        
        volumeMounts:
        - name: package-config
          mountPath: /config
          readOnly: true
        
        resources:
          requests:
            memory: "128Mi"
            cpu: "100m"
          limits:
            memory: "256Mi"
            cpu: "200m"
        
        securityContext:
          privileged: true
      
      volumes:
      - name: package-config
        configMap:
          name: node-requirements
```

---

## Helm Charts

### Chart Structure

```
check-engine-chart/
├── Chart.yaml
├── values.yaml
├── templates/
│   ├── _helpers.tpl
│   ├── configmap.yaml
│   ├── job.yaml
│   ├── cronjob.yaml
│   ├── serviceaccount.yaml
│   └── NOTES.txt
└── README.md
```

### Chart.yaml

```yaml
apiVersion: v2
name: check-engine
description: Environment validation for Kubernetes workloads
version: 1.0.0
appVersion: "1.14.0"
keywords:
  - validation
  - environment
  - nodejs
maintainers:
  - name: Mike Ohlsen
    url: https://github.com/mohlsen
sources:
  - https://github.com/mohlsen/check-engine
```

### values.yaml

```yaml
# Default values for check-engine

image:
  repository: ghcr.io/mohlsen/check-engine
  tag: latest
  pullPolicy: IfNotPresent
  variant: standard  # base, standard, or full

packageJson:
  # Inline package.json engines configuration
  engines:
    node: ">=18"
    npm: ">=8"
    git: ">=2.30"

# Job configuration
job:
  enabled: true
  backoffLimit: 3
  restartPolicy: Never
  annotations: {}
  labels: {}

# CronJob configuration
cronjob:
  enabled: false
  schedule: "0 */6 * * *"
  successfulJobsHistoryLimit: 3
  failedJobsHistoryLimit: 1

# InitContainer configuration
initContainer:
  enabled: false
  ignoreErrors: false

# Resource limits
resources:
  requests:
    memory: "64Mi"
    cpu: "100m"
  limits:
    memory: "128Mi"
    cpu: "200m"

# Service Account
serviceAccount:
  create: true
  name: ""
  annotations: {}

# Notifications
notifications:
  enabled: false
  slack:
    webhookUrl: ""
  email:
    enabled: false
    to: ""
```

### Usage

```bash
# Install chart
helm install my-validation ./check-engine-chart

# With custom values
helm install my-validation ./check-engine-chart \
  --set image.tag=1.14.0 \
  --set cronjob.enabled=true \
  --set cronjob.schedule="0 0 * * *"

# As InitContainer
helm install my-validation ./check-engine-chart \
  --set job.enabled=false \
  --set initContainer.enabled=true

# Upgrade
helm upgrade my-validation ./check-engine-chart

# Uninstall
helm uninstall my-validation
```

---

## AWS Deployment

### 1. AWS ECS (Elastic Container Service)

**Task Definition:**
```json
{
  "family": "check-engine",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "256",
  "memory": "512",
  "containerDefinitions": [
    {
      "name": "check-engine",
      "image": "ghcr.io/mohlsen/check-engine:standard",
      "command": ["check-engine", "/config/package.json"],
      "essential": true,
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/check-engine",
          "awslogs-region": "us-east-1",
          "awslogs-stream-prefix": "check-engine"
        }
      },
      "mountPoints": [
        {
          "sourceVolume": "config",
          "containerPath": "/config",
          "readOnly": true
        }
      ]
    }
  ],
  "volumes": [
    {
      "name": "config",
      "efsVolumeConfiguration": {
        "fileSystemId": "fs-12345678",
        "rootDirectory": "/config"
      }
    }
  ]
}
```

**Run Task:**
```bash
aws ecs run-task \
  --cluster my-cluster \
  --task-definition check-engine \
  --launch-type FARGATE \
  --network-configuration "awsvpcConfiguration={subnets=[subnet-12345],securityGroups=[sg-12345]}"
```

---

### 2. AWS EKS (Elastic Kubernetes Service)

Use standard Kubernetes manifests or Helm charts (see above).

**EKS-specific configuration:**
```yaml
apiVersion: v1
kind: ServiceAccount
metadata:
  name: check-engine
  annotations:
    eks.amazonaws.com/role-arn: arn:aws:iam::123456789:role/check-engine-role

---
apiVersion: batch/v1
kind: Job
metadata:
  name: check-engine
spec:
  template:
    spec:
      serviceAccountName: check-engine
      containers:
      - name: check-engine
        image: ghcr.io/mohlsen/check-engine:standard
        # ... rest of configuration
```

---

### 3. AWS Lambda

**For serverless validation:**

```javascript
// lambda-handler.js
const { checkEngine } = require('check-engine');

exports.handler = async (event) => {
  const packageJson = event.packageJson || '/var/task/package.json';
  
  try {
    const result = await checkEngine(packageJson);
    
    return {
      statusCode: result.status === 0 ? 200 : 500,
      body: JSON.stringify(result),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};
```

**Deploy with SAM:**
```yaml
# template.yaml
AWSTemplateFormatVersion: '2010-09-09'
Transform: AWS::Serverless-2016-10-31

Resources:
  CheckEngineFunction:
    Type: AWS::Serverless::Function
    Properties:
      Handler: lambda-handler.handler
      Runtime: nodejs20.x
      MemorySize: 512
      Timeout: 30
      Events:
        Api:
          Type: Api
          Properties:
            Path: /validate
            Method: post
```

---

## Google Cloud Deployment

### 1. Google Cloud Run

**Deploy container:**
```bash
# Build and push
gcloud builds submit --tag gcr.io/PROJECT_ID/check-engine

# Deploy to Cloud Run
gcloud run deploy check-engine \
  --image gcr.io/PROJECT_ID/check-engine \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --memory 512Mi \
  --cpu 1 \
  --max-instances 10
```

**With Cloud Build:**
```yaml
# cloudbuild.yaml
steps:
  # Build container
  - name: 'gcr.io/cloud-builders/docker'
    args: ['build', '-t', 'gcr.io/$PROJECT_ID/check-engine', '.']
  
  # Push to Container Registry
  - name: 'gcr.io/cloud-builders/docker'
    args: ['push', 'gcr.io/$PROJECT_ID/check-engine']
  
  # Deploy to Cloud Run
  - name: 'gcr.io/google.com/cloudsdktool/cloud-sdk'
    entrypoint: gcloud
    args:
      - 'run'
      - 'deploy'
      - 'check-engine'
      - '--image'
      - 'gcr.io/$PROJECT_ID/check-engine'
      - '--region'
      - 'us-central1'
      - '--platform'
      - 'managed'
```

---

### 2. Google Kubernetes Engine (GKE)

Use standard Kubernetes manifests or Helm charts.

**GKE-specific Workload Identity:**
```yaml
apiVersion: v1
kind: ServiceAccount
metadata:
  name: check-engine
  annotations:
    iam.gke.io/gcp-service-account: check-engine@PROJECT_ID.iam.gserviceaccount.com
```

---

### 3. Google Cloud Functions

```javascript
// index.js
const { checkEngine } = require('check-engine');

exports.validateEnvironment = async (req, res) => {
  try {
    const result = await checkEngine('./package.json');
    
    res.status(result.status === 0 ? 200 : 500).json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
```

**Deploy:**
```bash
gcloud functions deploy validateEnvironment \
  --runtime nodejs20 \
  --trigger-http \
  --allow-unauthenticated \
  --memory 512MB \
  --timeout 60s
```

---

## Azure Deployment

### 1. Azure Container Instances (ACI)

```bash
# Create container group
az container create \
  --resource-group myResourceGroup \
  --name check-engine \
  --image ghcr.io/mohlsen/check-engine:standard \
  --cpu 1 \
  --memory 1 \
  --restart-policy Never \
  --command-line "check-engine /config/package.json"
```

**With ARM Template:**
```json
{
  "$schema": "https://schema.management.azure.com/schemas/2019-04-01/deploymentTemplate.json#",
  "contentVersion": "1.0.0.0",
  "resources": [
    {
      "type": "Microsoft.ContainerInstance/containerGroups",
      "apiVersion": "2021-09-01",
      "name": "check-engine",
      "location": "eastus",
      "properties": {
        "containers": [
          {
            "name": "check-engine",
            "properties": {
              "image": "ghcr.io/mohlsen/check-engine:standard",
              "command": ["check-engine", "/config/package.json"],
              "resources": {
                "requests": {
                  "cpu": 1.0,
                  "memoryInGB": 1.0
                }
              }
            }
          }
        ],
        "osType": "Linux",
        "restartPolicy": "Never"
      }
    }
  ]
}
```

---

### 2. Azure Kubernetes Service (AKS)

Use standard Kubernetes manifests or Helm charts.

---

### 3. Azure Functions

```javascript
// index.js
const { checkEngine } = require('check-engine');

module.exports = async function (context, req) {
  try {
    const result = await checkEngine('./package.json');
    
    context.res = {
      status: result.status === 0 ? 200 : 500,
      body: result,
    };
  } catch (error) {
    context.res = {
      status: 500,
      body: { error: error.message },
    };
  }
};
```

---

## CI/CD Integration

### GitHub Actions

```yaml
name: Validate Environment

on: [push, pull_request]

jobs:
  validate:
    runs-on: ubuntu-latest
    
    # Use container
    container:
      image: ghcr.io/mohlsen/check-engine:standard
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Validate environment
        run: check-engine package.json
      
      - name: Upload results
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: validation-results
          path: ./validation-results.json
```

---

### GitLab CI

```yaml
validate:
  image: ghcr.io/mohlsen/check-engine:standard
  stage: test
  script:
    - check-engine package.json
  artifacts:
    when: always
    paths:
      - validation-results.json
    reports:
      junit: validation-results.xml
```

---

### Jenkins

```groovy
pipeline {
  agent {
    kubernetes {
      yaml '''
apiVersion: v1
kind: Pod
spec:
  containers:
  - name: check-engine
    image: ghcr.io/mohlsen/check-engine:standard
    command: ['cat']
    tty: true
      '''
    }
  }
  
  stages {
    stage('Validate') {
      steps {
        container('check-engine') {
          sh 'check-engine package.json'
        }
      }
    }
  }
}
```

---

## Best Practices

### 1. Resource Management

**Set appropriate limits:**
```yaml
resources:
  requests:
    memory: "64Mi"
    cpu: "100m"
  limits:
    memory: "128Mi"
    cpu: "200m"
```

### 2. Security

**Run as non-root:**
```yaml
securityContext:
  runAsNonRoot: true
  runAsUser: 1001
  allowPrivilegeEscalation: false
  capabilities:
    drop:
      - ALL
```

### 3. Monitoring

**Add health checks:**
```yaml
livenessProbe:
  exec:
    command: ["check-engine", "--version"]
  initialDelaySeconds: 5
  periodSeconds: 10
```

### 4. Configuration Management

**Use ConfigMaps for package.json:**
```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: package-json
data:
  package.json: |
    {
      "engines": {
        "node": ">=18"
      }
    }
```

### 5. Secrets Management

**Never bake secrets into images:**
```yaml
env:
- name: API_KEY
  valueFrom:
    secretKeyRef:
      name: api-secrets
      key: key
```

---

## Troubleshooting

### Common Issues

**1. Permission Denied**
```yaml
securityContext:
  fsGroup: 1001
```

**2. Out of Memory**
```yaml
resources:
  limits:
    memory: "256Mi"  # Increase limit
```

**3. Timeout**
```yaml
spec:
  activeDeadlineSeconds: 300  # 5 minutes
```

---

## Conclusion

This guide provides comprehensive patterns for deploying check-engine in cloud-native environments. Key takeaways:

1. **Flexibility:** Multiple deployment patterns for different use cases
2. **Cloud Agnostic:** Works across AWS, GCP, Azure, and bare-metal Kubernetes
3. **Integration:** Easy CI/CD integration
4. **Best Practices:** Security, resource management, and monitoring built-in

Choose the deployment pattern that best fits your use case and infrastructure.

