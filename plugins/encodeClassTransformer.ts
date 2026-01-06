// import type { SourceCodeTransformer } from '@unocss/core'
// import { escapeRegExp, expandVariantGroup } from '@unocss/core'

import { SourceCodeTransformer, escapeRegExp, expandVariantGroup } from 'unocss'
export const defaultChars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'

export function charCombinations(chars: string = defaultChars) {
  const combination = [-1]
  const charsLastIdx = chars.length - 1

  const resetFromIndex = (idx: number) => {
    for (let i = idx; i < combination.length; i++)
      combination[i] = 0
  }

  return () => {
    for (let i = combination.length - 1; i >= 0; i--) {
      if (combination[i] !== charsLastIdx) {
        combination[i] += 1
        resetFromIndex(i + 1)
        break
      }
      if (i === 0) {
        resetFromIndex(0)
        combination.push(0)
        break
      }
    }

    return "_"+combination.map(i => chars[i]).join('')
  }
}

export interface CompileClassOptions {
  /**
   * Special prefix to avoid UnoCSS transforming your code.
   * @default ':uno:'
   */
  trigger?: string

  /**
   * Hash function
   */
  hashFn?: () => string

  /**
   * The layer name of generated rules
   */
  layer?: string
}

export default function transformerClassnamesMinifier(options: CompileClassOptions = {}): SourceCodeTransformer {
  const {
    trigger = ':uno:',
    hashFn = charCombinations(),
  } = options

  const compiledClass = new Map()

  const regexp = RegExp(`(["'\`])${escapeRegExp(trigger)}${trigger ? '\\s' : ''}(.*?)\\1`, 'g')

  return {
    name: 'name',
    enforce: 'pre',
    async transform(s, _id, { uno }) {
      if(s.original.includes('p-button') || s.original.includes('p-component') || s.original.includes('p-button-secondary')) {
        console.log("transforming:", _id);
      }
      const matches = [...s.original.matchAll(regexp)]
      if (!matches.length)
        return
      // console.log("s.original", s.original)

      for (const match of matches) {
        const body = match.length ? expandVariantGroup(match[2].trim()) : ''

        const start = match.index!
        const replacements = []

        const result = await Promise.all(body.split(/\s+/).filter(Boolean).map(async i => [i, !!await uno.parseToken(i)] as const))
        const known = result.filter(([, matched]) => matched).map(([i]) => i)
        const unknown = result.filter(([, matched]) => !matched).map(([i]) => i)

        replacements.push(...unknown)

        known.forEach((i) => {
          const compiled = compiledClass.get(i)

          if (compiled)
            return replacements.push(compiled)

          const className = hashFn()

          compiledClass.set(i, className)

          if (options.layer)
            uno.config.shortcuts.push([className, i, { layer: options.layer }])
          else
            uno.config.shortcuts.push([className, i])

          replacements.push(className)
        })

        s.overwrite(start + 1, start + match[0].length - 1, replacements.join(' '))
      }
    },
  }
}