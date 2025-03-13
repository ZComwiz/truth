{
  test: /\.[jt]sx?$/i,
  exclude: /node_modules/,
  use: [
    {
      loader: 'babel-loader',
      options: {
        presets: [
          '@babel/preset-react',
          '@babel/preset-typescript'
        ]
      }
    }
  ]
} 
