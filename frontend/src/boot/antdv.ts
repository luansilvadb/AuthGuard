import { defineBoot } from '#q-app/wrappers';
import Antd from 'ant-design-vue';
// Remover import do CSS, pois já está global via app.scss

export default defineBoot(({ app }) => {
  app.use(Antd);
});
