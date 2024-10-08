import { loadOml2d } from 'oh-my-live2d';

loadOml2d({
  initialStatus: "sleep",
  models: [
    {
      path: '/live2d/ots14_3001/normal.model3.json',
      position: [-50, 120],
      scale: 0.07,
      stageStyle: {
        height: 500
      }
    },
    {
      path: '/live2d/ots14_5602/normal.model3.json',
      position: [-100, -50],
      scale: 0.06,
      stageStyle: {
        height: 500
      }
    },
  ]
});