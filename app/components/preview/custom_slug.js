import GithubSlugger from 'github-slugger'
import { headingRank } from 'hast-util-heading-rank'
import { toString } from 'hast-util-to-string'
import { visit } from 'unist-util-visit'

/** @type {Options} */
const emptyOptions = {}
const slugs = new GithubSlugger()

/**
 * Add `id`s to headings.
 *
 * @param {Options | null | undefined} [options]
 *   Configuration (optional).
 * @returns
 *   Transform.
 */
export default function rehypeSlug(options) {
    const settings = options || emptyOptions
    const prefix = settings.prefix || ''

    /**
     * @param {Root} tree
     *   Tree.
     * @returns {undefined}
     *   Nothing.
     */
    return function (tree) {
        slugs.reset()

        visit(tree, 'element', function (node) {
            if (headingRank(node) && !node.properties.id) {
                // replace toc number. ex) 1. 1.1. 1.1.1.
                const SanitizedSlug = slugs.slug(toString(node)).replace(".", '').replace(" ", "-")
                node.properties.id = prefix + SanitizedSlug
            }
        })
    }
}