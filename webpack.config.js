module.exports = {
    entry: './client/client.jsx',
    module: {
        rules: [
            {
                test: /\.(js|jsx)$/,
                exclude: /node_modules/,
                use: {
                    loader: "babel-loader",
                },
            },
        ],
    },
    mode: 'production',
    watchOptions: {
        aggregateTimeout: 200,
    },
    output: {
        path: require('path').resolve(__dirname, 'hosted'),
        filename: 'bundle.js',
    },
};