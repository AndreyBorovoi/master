import * as k8s from '@kubernetes/client-node';

export const createPyDeploymentConfig = (modelId: string) => {
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
              name: 'python-server',
              image: '87625155/python-server',
              command: ['python'],
              args: ['server.py'],
              env: [
                { name: 'MODELID', value: `${modelId}` },
                { name: 'MONGODB', value: `${process.env.MONGODB}` },
                {
                  name: 'REDIS_URL',
                  value: `${process.env.REDIS_SERVICE_SERVICE_HOST}`,
                },
                {
                  name: 'REDIS_PORT',
                  value: `${process.env.REDIS_SERVICE_SERVICE_PORT}`,
                },
              ],
            },
          ],
        },
      },
    },
  };

  return PyDeployment;
};

export const createHorizontalPodAutoscalerConfig = (deploymetName: string) => {
  const HorizontalPodAutoscaler: k8s.V2beta1HorizontalPodAutoscaler = {
    apiVersion: 'autoscaling/v2beta1',
    kind: 'HorizontalPodAutoscaler',
    metadata: {
      name: deploymetName,
    },
    spec: {
      scaleTargetRef: {
        apiVersion: 'apps/v1',
        kind: 'Deployment',
        name: deploymetName,
      },
      minReplicas: 2,
      maxReplicas: 10,
      metrics: [
        {
          type: 'Resource',
          resource: {
            name: 'cpu',
            targetAverageUtilization: 50,
          },
        },
      ],
    },
  };

  return HorizontalPodAutoscaler;
};
