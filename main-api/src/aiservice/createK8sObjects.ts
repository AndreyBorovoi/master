import * as k8s from '@kubernetes/client-node';

export const createPyDeployment = (modelId: string, port: number) => {
  const PyDeployment: k8s.V1Deployment = {
    apiVersion: 'apps/v1',
    kind: 'Deployment',
    metadata: {
      name: modelId,
    },
    spec: {
      selector: {
        matchLabels: {
          app: modelId,
        },
      },
      template: {
        metadata: {
          labels: {
            app: modelId,
          },
        },
        spec: {
          containers: [
            {
              name: 'test-container',
              image: '87625155/master-poc-py',
              command: ['gunicorn'],
              args: ['-b', `0.0.0.0:${port}`, '-w', '1', 'server:app'],
              ports: [{ containerPort: port }],
              env: [
                { name: 'PORT', value: `${port}` },
                { name: 'MODELID', value: `${modelId}` },
              ],
            },
          ],
        },
      },
    },
  };

  return PyDeployment;
};

export const createPyService = (modelId: string, port: number) => {
  const PyService: k8s.V1Service = {
    apiVersion: 'v1',
    kind: 'Service',
    metadata: {
      name: modelId,
    },
    spec: {
      ports: [
        {
          name: 'http',
          port: port,
        },
      ],
      selector: {
        app: modelId,
      },
      type: 'LoadBalancer',
    },
  };
  return PyService;
};
