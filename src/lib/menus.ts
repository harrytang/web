export interface Menu {
  name: string
  path: string
}

export function getMenus(): Menu[] {
  return [
    {
      name: 'Home',
      path: '/',
    },
    {
      name: 'About',
      path: '/about',
    },
    {
      name: 'Articles',
      path: '/articles',
    },
    {
      name: 'Projects',
      path: '/projects',
    },
    {
      name: 'Expertise',
      path: '/expertise',
    },
    {
      name: 'Uses',
      path: '/uses',
    },
  ]
}
