import * as k8s from '@kubernetes/client-node';

export const createPyDeployment = (modelId: string) => {
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
                { name: 'REDIS_URL', value: `${process.env.REDIS_SERVICE_SERVICE_HOST}` },
                { name: 'REDIS_PORT', value: `${process.env.REDIS_SERVICE_SERVICE_PORT}` },
              ],
            },
          ],
        },
      },
    },
  };

  return PyDeployment;
};

// export const createPyService = (modelId: string, port: number) => {
//   const PyService: k8s.V1Service = {
//     apiVersion: 'v1',
//     kind: 'Service',
//     metadata: {
//       name: modelId,
//     },
//     spec: {
//       ports: [
//         {
//           name: 'http',
//           port: port,
//         },
//       ],
//       selector: {
//         app: modelId,
//       },
//       type: 'LoadBalancer',
//     },
//   };
//   return PyService;
// };
