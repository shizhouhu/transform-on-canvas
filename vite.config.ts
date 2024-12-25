import react from '@vitejs/plugin-react'
import path from 'path'
import { defineConfig, loadEnv, splitVendorChunkPlugin } from 'vite'
import { createHtmlPlugin } from 'vite-plugin-html'
import svgr from './build/plugins/svgr'

export default defineConfig(async ({ command, mode }) => {
    const env = loadEnv(mode, process.cwd())
    const { VITE_SDK_VERSION, VITE_CONFIG_MODE } = env
    return {
        plugins: [
            react(),
            splitVendorChunkPlugin(),
            {
                name: 'configure-response-headers',
                configureServer: server => {
                    server.middlewares.use((_req, res, next) => {
                        res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp')
                        res.setHeader('Cross-Origin-Opener-Policy', 'same-origin')
                        res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin')
                        next()
                    })
                },
                configurePreviewServer: server => {
                    server.middlewares.use((_req, res, next) => {
                        res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp')
                        res.setHeader('Cross-Origin-Opener-Policy', 'same-origin')
                        res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin')
                        next()
                    })
                },
            },
            createHtmlPlugin({
                minify: true,
                inject: {
                    data: {
                        configMode: VITE_CONFIG_MODE,
                        sdkVersion: VITE_SDK_VERSION,
                    },
                },
            }),
            svgr({
                localStyle: true,
                svgrOptions: {
                    plugins: ['@svgr/plugin-svgo', '@svgr/plugin-jsx'],
                    svgoConfig: {
                        plugins: [
                            // { name: 'removeViewBox', active: false },
                            { name: 'removeTitle', active: true },
                        ],
                    },
                },
            }),
        ],
        css: {
            preprocessorOptions: {
                less: {
                    additionalData: `
          @import "./src/assets/style/mixins.less";
          @import "./src/assets/style/variables.module.less";
          `,
                },
            },
        },
        server: {
            host: '0.0.0.0',
            port: 8086,
            proxy: {
            },
        },
        resolve: {
            alias: {
                '@': path.resolve(__dirname, 'src'),
            },
        },
        preview: {
            port: 8089,
        },
    }
})
