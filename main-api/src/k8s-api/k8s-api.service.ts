import { Injectable } from '@nestjs/common';
import * as k8s from '@kubernetes/client-node';
import {
  createPyDeploymentConfig,
  createHorizontalPodAutoscalerConfig,
} from './createK8sObjects';

@Injectable()
export class K8sApiService {
  private k8sApi: k8s.CoreV1Api;
  private k8sApiApps: k8s.AppsV1Api;
  private k8sApiNode: k8s.NodeV1Api;
  private k8sApiAutoscaling: k8s.AutoscalingV2beta1Api;
  private kc: k8s.KubeConfig;

  constructor() {
    this.kc = new k8s.KubeConfig();
    this.kc.loadFromDefault();

    this.k8sApi = this.kc.makeApiClient(k8s.CoreV1Api);
    this.k8sApiApps = this.kc.makeApiClient(k8s.AppsV1Api);
    this.k8sApiNode = this.kc.makeApiClient(k8s.NodeV1Api);
    this.k8sApiAutoscaling = this.kc.makeApiClient(k8s.AutoscalingV2beta1Api);
  }

  async createAIService(modelId: string) {
    const deployment = await this.createDeployment(modelId);
    return { deployment };
  }

  private async createDeployment(modelId: string) {
    const deployment = await this.k8sApiApps.createNamespacedDeployment(
      'default',
      createPyDeploymentConfig(modelId),
      'true',
    );
    const autoScaling =
      await this.k8sApiAutoscaling.createNamespacedHorizontalPodAutoscaler(
        'default',
        createHorizontalPodAutoscalerConfig(modelId),
        'true',
      );
    return { deployment, autoScaling };
  }

  async getDeploymentStatus(modelId: string) {
    const response = await this.k8sApiApps.readNamespacedDeploymentStatus(
      modelId,
      'default',
      'true',
    );
    return response;
  }

  async deleteDeployment(modelId: string) {
    const response = await this.k8sApiApps.deleteNamespacedDeployment(
      modelId,
      'default',
    );
    return response;
  }
}
