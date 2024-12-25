import type { Config } from '@svgr/core'
import { transform as SVGTransform } from '@svgr/core'
import fs from 'fs'
import type { Plugin } from 'vite'
import { transformWithEsbuild } from 'vite'
type Options = {
  svgrOptions?: Config
  esbuildOptions?: Parameters<typeof transformWithEsbuild>[2]
  localStyle?: boolean
}

export default function svgrPlugin({
  svgrOptions,
  esbuildOptions,
  localStyle,
}: Options = {}): Plugin {
  return {
    name: 'vite:svgr',
    async transform(code, id) {
      if (id.endsWith('.svg')) {
        let svgCode = await fs.promises.readFile(id, 'utf8')

        if (localStyle) {
          const regex = new RegExp(/[>|}]\s*\.([^{]+){/gm)
          let match: RegExpExecArray | null
          let classMap: Record<string, string> = {}
          while ((match = regex.exec(svgCode)) !== null) {
            let groups = match[1].split('.')
            let classes: string[] = []
            for (let i = 0; i < groups.length; i++) {
              let current = groups[i].replace(/\s+/gm, '')
              if (!current) continue
              current = current.replace(/,/gm, '')
              classes.push(current)
            }
            classes.forEach(c => {
              let uid = Math.random().toString(16).substr(2)
              classMap[c] = uid
            })
          }
          let keys = Object.keys(classMap)
          keys.forEach(key => {
            svgCode = svgCode.replace(
              new RegExp(key, 'g'),
              `__svg__${classMap[key]}`,
            )
          })
        }

        const componentCode = await SVGTransform(svgCode, svgrOptions, {
          componentName: 'ReactComponent',
          filePath: id,
        }).then(res => {
          return res.replace(
            'export default ReactComponent',
            `export { ReactComponent }`,
          )
        })
        const res = await transformWithEsbuild(
          componentCode + '\n' + code,
          id,
          { loader: 'jsx', ...esbuildOptions },
        )
        return {
          code: res.code,
          map: res.map, // TODO:
        }
      }
    },
  }
}
