import type { LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData, Await } from "@remix-run/react";
import { defer } from "@remix-run/node";
import invariant from "tiny-invariant";
import { getMarkdownContain } from "app/data";
import PreviewMarkdown from "app/components/preview/preview";
import React from "react";

export const loader = async ({ params }: LoaderFunctionArgs) => {
  invariant(params.markdownId, "Missing markdownId param");
  invariant(params.projectId, "Missing projectId param");

  const contact = getMarkdownContain(params.projectId, params.markdownId);
  return defer({ contact, params });
};

export default function Markdown() {
  const { contact, params } = useLoaderData<typeof loader>();

  return (
    <div className="flex justify-center w-full" style={{ height: "80vh" }}>
      <div className="w-full h-full p-4 overflow-y-scroll overflow-x-auto border">
        <div className="w-full h-full">
          <React.Suspense fallback={<div>Loading...</div>}>
            <Await resolve={contact}>
              {(contact) =>
                contact?.markdown ? (
                  <PreviewMarkdown
                    projectId={params.projectId}
                    markdown={contact?.markdown}
                  />
                ) : (
                  <p>Loading...</p>
                )
              }
            </Await>
          </React.Suspense>
        </div>
      </div>
    </div>
  );
}
