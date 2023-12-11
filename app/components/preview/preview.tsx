import type { LinksFunction } from "@remix-run/node";
import React from "react";

import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import remarkToc from "remark-toc";
import remarkGfm from "remark-gfm";
import rehypeSlug from "./custom_slug";
import imgLinks from "@pondorasti/remark-img-links";
import lazyLoadPlugin from "rehype-plugin-image-native-lazy-loading";
// import imageLazyload from "./image_lazy_load";
import styles from "app/styles/preview.css";
export const links: LinksFunction = () => [{ rel: "stylesheet", href: styles }];

type PreviewMarkdownProps = {
  markdown: string;
  projectId: string;
};

export default function PreviewMarkdown(props: PreviewMarkdownProps) {
  const markdown = React.useMemo(() => {
    return headeringUrl(numberedHeaders(colorize(inlineList(props.markdown))));
  }, [props.markdown]);

  return (
    <div className="markdown-preview">
      <ReactMarkdown
        rehypePlugins={[rehypeRaw, rehypeSlug, lazyLoadPlugin]}
        remarkPlugins={[
          [remarkGfm, { singleTilde: false }],
          [remarkToc, { tight: true, maxDepth: 5, heading: "目次" }],
          [
            imgLinks,
            {
              absolutePath:
                process.env.NODE_ENV == "development"
                  ? `http://localhost:3000/projects/${props.projectId}/`
                  : `https://markdown-previewer.hblocal.net/projects/${props.projectId}/`,
            },
          ],
        ]}
      >
        {markdown}
      </ReactMarkdown>
    </div>
  );
}

export function CreateJSX(props: PreviewMarkdownProps): React.ReactElement {
  headeringUrl(numberedHeaders(colorize(inlineList(props.markdown))));

  return (
    <ReactMarkdown
      rehypePlugins={[rehypeRaw, rehypeSlug]}
      remarkPlugins={[
        [remarkGfm, { singleTilde: false }],
        [remarkToc, { tight: true, maxDepth: 5, heading: "目次" }],
        [
          imgLinks,
          {
            absolutePath:
              process.env.NODE_ENV == "development"
                ? `http://localhost:3000/projects/${props.projectId}/`
                : `https://markdown-previewer.hblocal.net/projects/${props.projectId}/`,
          },
        ],
      ]}
    >
      {props.markdown}
    </ReactMarkdown>
  );
}

// hbfmから移植
function inlineList(markdown: string): string {
  const HEADER_REGEX = /\{\{inline\(list\)::\n([\s\S]*?)\n\}\}/g;
  const replace = (match: string, group: string) => {
    const lines = group.split("\n");
    const listItems = lines.map((line) => {
      const listItem = line.replace(/^\s*[-*+]\s*/, "");
      return `<li>${listItem}</li>`;
    });
    const list = listItems.join("");
    return `<ul>${list}</ul>`;
  };

  const newMarkdown = markdown.replace(HEADER_REGEX, replace);
  return newMarkdown;
}

function colorize(text: string): string {
  const HEADER_REGEX = /\{\{color\(([^:]+)\)::([^\}]+)\}\}/g;
  const replace = (match: string, color: string, text: string) => {
    return `<font color="${color}">${text}</font>`;
  };

  const new_text = text.replace(HEADER_REGEX, replace);
  return new_text;
}

function numberedHeaders(text: string): string {
  const HEADER_REGEX = /^(#+)(.*)/;
  const NUM_HEADERS = 6;
  const counter = [0, 0, 0, 0, 0, 0];
  const section_number: { [key: string]: string } = {};

  const new_lines = text.split("\n").map((line) => {
    const m = HEADER_REGEX.exec(line);
    if (m) {
      const header_spec = m[1];
      let header_num = header_spec.length;
      const header_text = m[2].trim();
      header_num = header_num - 2;
      // h1 は除外
      if (header_num < 0) {
        return line;
      } else {
        for (let i = header_num + 1; i < NUM_HEADERS; i++) {
          counter[i] = 0;
        }
        counter[header_num] += 1;

        const section = counter.filter((x) => x !== 0).map(String);
        const section_text = section.join(".");

        const new_line = `${header_spec} ${section_text}. ${header_text}`;
        section_number[header_text] = section_text;
        return new_line;
      }
    } else {
      return line;
    }
  });

  const CROSS_REFERENCE_REGEX = /\[([^\]]+)\]\(#([^\)]+)\)/g;

  const replace = (match: string, text: string, link: string) => {
    if (!(text in section_number)) {
      console.error(`ERROR: Section title ${text} not found`);
    }
    return `[${section_number[text]}. ${text}](#${section_number[text]}. ${link})`;
  };

  const renew_lines = new_lines.map((line) => {
    if (CROSS_REFERENCE_REGEX.test(line)) {
      line = line.replace(CROSS_REFERENCE_REGEX, replace);
    }
    return line;
  });

  return renew_lines.join("\n");
}

function headeringUrl(lines: string) {
  const HEADER_REGEX = /\]\(#([^\)]+)\)/g;

  const uriquote = (match: string, value: string) => {
    const replacedValue = value
      .replaceAll(".", "")
      .replaceAll(" ", "-")
      .replaceAll("・", "")
      .toLowerCase();
    return `](#${replacedValue})`;
  };

  const new_lines = lines.split("\n").map((line) => {
    if (HEADER_REGEX.test(line)) {
      line = line.replace(HEADER_REGEX, uriquote);
    }
    return line;
  });
  return new_lines.join("\n");
}
