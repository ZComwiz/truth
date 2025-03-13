import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

const sidebars: SidebarsConfig = {
  tutorialSidebar: [
    {
      type: 'category',
      label: 'Library',
      items: [
        {
          type: 'category',
          label: 'God is Real: Here\'s the Proof',
          items: [
            'god-is-real/v1.0.0',
          ],
        },
      ],
    },
  ],
};

export default sidebars;
