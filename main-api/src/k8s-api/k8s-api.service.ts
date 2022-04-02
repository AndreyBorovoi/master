import { Injectable } from '@nestjs/common';
import * as k8s from '@kubernetes/client-node';
import { createPyDeploymentConfig } from './createK8sObjects';

@Injectable()
export class K8sApiService {
  private k8sApi: k8s.CoreV1Api;
  private k8sApiApps: k8s.AppsV1Api;
  private k8sApiNode: k8s.NodeV1Api;
  private kc: k8s.KubeConfig;

  constructor() {
    this.kc = new k8s.KubeConfig();
    this.kc.loadFromDefault();

    this.k8sApi = this.kc.makeApiClient(k8s.CoreV1Api);
    this.k8sApiApps = this.kc.makeApiClient(k8s.AppsV1Api);
    this.k8sApiNode = this.kc.makeApiClient(k8s.NodeV1Api);
  }

  async createAIService(modelId: string) {
    const deployment = await this.createDeployment(modelId);
    return { deployment };
  }

  private async createDeployment(modelId: string) {
    const deployment = this.k8sApiApps
      .createNamespacedDeployment(
        'default',
        createPyDeploymentConfig(modelId),
        'true',
      )
      .then((value) => {
        return value.body;
      })
      .catch((error) => {
        return error;
      });
    return deployment;
  }

  private async getDeploymentStatus(modelId: string) {
    return {};
  }

  private async deleteDeployment(modelId: string) {
    return {};
  }
}
