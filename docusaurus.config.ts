import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';
import path from 'path';
import webpack from 'webpack';

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

const config: Config = {
  title: 'AbsoluteTruth.io',
  tagline: 'Timeless Catholic Wisdom for Modern Times',
  favicon: 'img/favicon.ico',

  // Set the production url of your site here
  url: 'https://absolutetruth.io',
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: '/',

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: 'absolutetruth', // Usually your GitHub org/user name.
  projectName: 'absolutetruth.io', // Usually your repo name.

  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',

  // Even if you don't use internationalization, you can use this field to set
  // useful metadata like html lang. For example, if your site is Chinese, you
  // may want to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      {
        docs: {
          path: 'docs',
          sidebarPath: require.resolve('./sidebars.ts'),
        },
        blog: {
          showReadingTime: true,
          editUrl: 'https://github.com/absolutetruth/absolutetruth.io/edit/main/blog/',
        },
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
      },
    ],
  ],

  stylesheets: [
    {
      href: 'https://fonts.googleapis.com/css2?family=Cinzel:wght@400;500;600;700&family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500;1,600&display=swap',
      type: 'text/css',
    },
  ],

  themeConfig: {
    // Replace with your project's social card
    image: 'img/AbsoluteLogo.png',
    navbar: {
      title: 'AbsoluteTruth.io',
      logo: {
        alt: 'AbsoluteTruth.io Logo',
        src: 'img/AbsoluteLogo.png',
        srcDark: 'img/AbsoluteLogo.png',
        width: 32,
        height: 32,
      },
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'tutorialSidebar',
          position: 'left',
          label: 'Library',
        },
        {to: '/blog', label: 'Articles', position: 'left'},
        {
          type: 'html',
          position: 'right',
          value: `<button class="navbar__link" id="support-us-button">Support Us</button>`,
        },
        {
          href: 'https://github.com/absolutetruth/absolutetruth.io',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      logo: {
        alt: 'AbsoluteTruth.io Logo',
        src: 'img/AbsoluteLogo.png',
        width: 60,
        height: 60,
        style: { filter: 'brightness(0) invert(1)' }, // Makes logo white
      },
      links: [
        {
          title: 'Resources',
          items: [
            {
              label: 'Catholic Library',
              to: '/docs/intro',
            },
            {
              label: 'Articles',
              to: '/blog',
            },
            {
              label: 'Prayer Resources',
              to: '/prayers',
            },
          ],
        },
        {
          title: 'Community',
          items: [
            {
              label: 'Discord',
              href: 'https://discord.gg/absolutetruth',
            },
            {
              label: 'Twitter',
              href: 'https://twitter.com/absolutetruthio',
            },
            {
              label: 'Newsletter',
              to: '/newsletter',
            },
          ],
        },
        {
          title: 'Support',
          items: [
            {
              label: 'Donate',
              to: '/donate',
            },
            {
              label: 'GitHub',
              href: 'https://github.com/absolutetruth/absolutetruth.io',
            },
            {
              label: 'Contact Us',
              to: '/contact',
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} AbsoluteTruth.io - Spreading Catholic Truth in the Digital Age`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
    },
    docs: {
      sidebar: {
        hideable: true,
        autoCollapseCategories: true,
      },
    },
  } satisfies Preset.ThemeConfig,

  staticDirectories: ['static'],

  customFields: {},

  plugins: [
    function customWebpackConfig() {
      return {
        name: 'custom-webpack-config',
        configureWebpack(config, isServer, utils) {
          return {
            resolve: {
              fallback: {
                path: require.resolve('path-browserify'),
                fs: false,
              }
            }
          };
        }
      };
    }
  ],
};

export default config;