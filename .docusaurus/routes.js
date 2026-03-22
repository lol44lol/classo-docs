import React from 'react';
import ComponentCreator from '@docusaurus/ComponentCreator';

export default [
  {
    path: '/classo-docs/blog',
    component: ComponentCreator('/classo-docs/blog', 'ed6'),
    exact: true
  },
  {
    path: '/classo-docs/blog/archive',
    component: ComponentCreator('/classo-docs/blog/archive', '6f0'),
    exact: true
  },
  {
    path: '/classo-docs/blog/authors',
    component: ComponentCreator('/classo-docs/blog/authors', 'cdc'),
    exact: true
  },
  {
    path: '/classo-docs/blog/authors/all-sebastien-lorber-articles',
    component: ComponentCreator('/classo-docs/blog/authors/all-sebastien-lorber-articles', '9cb'),
    exact: true
  },
  {
    path: '/classo-docs/blog/authors/yangshun',
    component: ComponentCreator('/classo-docs/blog/authors/yangshun', '97a'),
    exact: true
  },
  {
    path: '/classo-docs/blog/first-blog-post',
    component: ComponentCreator('/classo-docs/blog/first-blog-post', '691'),
    exact: true
  },
  {
    path: '/classo-docs/blog/long-blog-post',
    component: ComponentCreator('/classo-docs/blog/long-blog-post', 'a6a'),
    exact: true
  },
  {
    path: '/classo-docs/blog/mdx-blog-post',
    component: ComponentCreator('/classo-docs/blog/mdx-blog-post', '9f3'),
    exact: true
  },
  {
    path: '/classo-docs/blog/tags',
    component: ComponentCreator('/classo-docs/blog/tags', '74f'),
    exact: true
  },
  {
    path: '/classo-docs/blog/tags/docusaurus',
    component: ComponentCreator('/classo-docs/blog/tags/docusaurus', '5c8'),
    exact: true
  },
  {
    path: '/classo-docs/blog/tags/facebook',
    component: ComponentCreator('/classo-docs/blog/tags/facebook', '4cc'),
    exact: true
  },
  {
    path: '/classo-docs/blog/tags/hello',
    component: ComponentCreator('/classo-docs/blog/tags/hello', 'ef3'),
    exact: true
  },
  {
    path: '/classo-docs/blog/tags/hola',
    component: ComponentCreator('/classo-docs/blog/tags/hola', 'ad2'),
    exact: true
  },
  {
    path: '/classo-docs/blog/welcome',
    component: ComponentCreator('/classo-docs/blog/welcome', 'cfe'),
    exact: true
  },
  {
    path: '/classo-docs/markdown-page',
    component: ComponentCreator('/classo-docs/markdown-page', '780'),
    exact: true
  },
  {
    path: '/classo-docs/docs',
    component: ComponentCreator('/classo-docs/docs', '7bd'),
    routes: [
      {
        path: '/classo-docs/docs',
        component: ComponentCreator('/classo-docs/docs', 'e94'),
        routes: [
          {
            path: '/classo-docs/docs',
            component: ComponentCreator('/classo-docs/docs', '7b1'),
            routes: [
              {
                path: '/classo-docs/docs/databases/crud',
                component: ComponentCreator('/classo-docs/docs/databases/crud', '2f2'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/classo-docs/docs/dataclass/intro',
                component: ComponentCreator('/classo-docs/docs/dataclass/intro', '313'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/classo-docs/docs/dataclass/validates & transformers',
                component: ComponentCreator('/classo-docs/docs/dataclass/validates & transformers', '7ab'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/classo-docs/docs/intro',
                component: ComponentCreator('/classo-docs/docs/intro', 'd79'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/classo-docs/docs/migration/intro',
                component: ComponentCreator('/classo-docs/docs/migration/intro', '1ab'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/classo-docs/docs/query/intro',
                component: ComponentCreator('/classo-docs/docs/query/intro', '0a3'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/classo-docs/docs/relations/intro',
                component: ComponentCreator('/classo-docs/docs/relations/intro', '34b'),
                exact: true,
                sidebar: "tutorialSidebar"
              }
            ]
          }
        ]
      }
    ]
  },
  {
    path: '/classo-docs/',
    component: ComponentCreator('/classo-docs/', 'a6a'),
    exact: true
  },
  {
    path: '*',
    component: ComponentCreator('*'),
  },
];
