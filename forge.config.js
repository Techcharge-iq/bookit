const path = require('path');

module.exports = {
  packagerConfig: {
    asar: true,
    icon: path.join(__dirname, 'public/favicon'),
    win32metadata: {
      CompanyName: 'BookIt',
      FileDescription: 'Desktop Invoice and Accounting Management System',
      OriginalFilename: 'BookItSetup.exe',
      ProductName: 'BookIt',
      InternalName: 'BookIt',
    },
  },
  makers: [
    {
      name: '@electron-forge/maker-squirrel',
      config: {
        name: 'BookIt',
        authors: 'BookIt Team',
        exe: 'BookIt.exe',
        setupExe: 'BookItSetup.exe',
        setupIcon: path.join(__dirname, 'public/favicon.ico'),
      },
      platforms: ['win32'],
    },
    {
      name: '@electron-forge/maker-zip',
      platforms: ['darwin', 'linux'],
    },
    {
      name: '@electron-forge/maker-deb',
      config: {
        options: {
          maintainer: 'BookIt Team',
          homepage: 'https://bookit.local',
        },
      },
      platforms: ['linux'],
    },
  ],
  publishers: [],
  build: {
    resourcesUrl: '../resources/',
  },
};
