import { visit } from 'unist-util-visit'

export default function imageLazyload() {
  function visitor(el) {
    // if (el.tagName !== 'img') {
    //   return
    // }
    console.log(el)
    el.loading = 'lazy'
    el.properties = {
      ...(el.properties || {}),
      loading: 'lazy'
    }
    el.properties.loading = 'lazy'

  }

  function transformer(htmlAST) {
    visit(htmlAST, 'img', visitor)
    return htmlAST
  }

  return transformer
}