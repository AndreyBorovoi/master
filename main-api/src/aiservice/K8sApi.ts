import * as k8s from '@kubernetes/client-node';
import { createPyDeployment, createPyService } from './createK8sObjects';

export class K8sApi {
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

  async createAIService(modelId: string, port: number) {
    const deployment = await this.createDeployment(modelId, port);
    const service = await this.creteService(modelId, port);
    return { deployment, service };
  }

  private async createDeployment(modelId: string, port: number) {
    const deployment = this.k8sApiApps
      .createNamespacedDeployment(
        'default',
        createPyDeployment(modelId, port),
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

  private async creteService(modelId: string, port: number) {
    const service = this.k8sApi
      .createNamespacedService(
        'default',
        createPyService(modelId, port),
        'true',
      )
      .then((value) => {
        return value.body;
      })
      .catch((error) => {
        return error;
      });
    return service;
  }
}
