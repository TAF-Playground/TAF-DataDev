export const DEFAULT_SQL = `-- learn more on https://docs.project.co/guides/tables/
--js type('table')
SELECT country as country,
       device_type as device_type,
       sum(revenue) as revenue,
       sum(sessions) as sessions,
       sum(pageviews) as pageviews
FROM my_table
WHERE country = 'FRANCE'
GROUP BY 1, 2`;

export const DEFAULT_FILE_PATH = 'models/1_simple_examples/dataset_2_with_ref';

export const FILE_TREE = [
  {
    name: 'dataform',
    type: 'file' as const,
    badge: 'config',
  },
  {
    name: 'package-lock',
    type: 'file' as const,
    badge: 'config',
  },
  {
    name: 'package',
    type: 'file' as const,
    badge: 'config',
  },
  {
    name: 'models',
    type: 'folder' as const,
    children: [
      {
        name: '1_simple_examples',
        type: 'folder' as const,
        children: [
          { name: 'dataset_1', type: 'file' as const },
          { name: 'dataset_2_with_ref', type: 'file' as const },
        ],
      },
      {
        name: '2_advanced_examples',
        type: 'folder' as const,
        children: [
          { name: 'dataset_3_increa...', type: 'file' as const },
          { name: 'dataset_4_increase...', type: 'file' as const },
        ],
      },
      {
        name: '3_operations_and_as...',
        type: 'folder' as const,
        children: [
          { name: 'grant_access', type: 'file' as const },
          { name: 'simple_assertion', type: 'file' as const },
        ],
      },
      {
        name: 'models_2',
        type: 'folder' as const,
      },
    ],
  },
];
