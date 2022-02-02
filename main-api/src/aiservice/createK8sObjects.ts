import * as k8s from '@kubernetes/client-node';

export const createPyDeployment = (name: string, port: number) => {
  const PyDeployment: k8s.V1Deployment = {
    apiVersion: 'apps/v1',
    kind: 'Deployment',
    metadata: {
      name: name,
    },
    spec: {
      selector: {
        matchLabels: {
          app: name,
        },
      },
      template: {
        metadata: {
          labels: {
            app: name,
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
              env: [{ name: 'PORT', value: `${port}` }],
            },
          ],
        },
      },
    },
  };

  return PyDeployment;
};

export const createPyService = (name: string, port: number) => {
  const PyService: k8s.V1Service = {
    apiVersion: 'v1',
    kind: 'Service',
    metadata: {
      name: name,
    },
    spec: {
      ports: [
        {
          name: 'http',
          port: port,
        },
      ],
      selector: {
        app: name,
      },
      type: 'LoadBalancer',
    },
  };
  return PyService;
};
