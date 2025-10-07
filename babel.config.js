// module.exports = {
//   presets: ['module:@react-native/babel-preset'],
// };
module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    [
      'module-resolver',
      {
        root: ['./src'],
        alias: {
          navigation: './src/Navigation',
          res: './src/Constants',
          screens: './src/Screens',
          assets: './src/Assets',
          components: './src/Components',
          utiles: './src/Utils',
        },
      },
    ],
  ],
};