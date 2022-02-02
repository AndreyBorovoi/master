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

  async createAIService(name: string, port: number) {
    const deployment = await this.createDeployment(name, port);
    const service = await this.creteService(name, port);
    return { deployment, service };
  }

  private async createDeployment(name: string, port: number) {
    const deployment = this.k8sApiApps
      .createNamespacedDeployment(
        'default',
        createPyDeployment(name, port),
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

  private async creteService(name: string, port: number) {
    const service = this.k8sApi
      .createNamespacedService('default', createPyService(name, port), 'true')
      .then((value) => {
        return value.body;
      })
      .catch((error) => {
        return error;
      });
    return service;
  }
}
