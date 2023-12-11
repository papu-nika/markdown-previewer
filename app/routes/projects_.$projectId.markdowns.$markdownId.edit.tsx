import React from "react";
import type { LoaderFunctionArgs, ActionFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import {
  useLoaderData,
  useNavigate,
  useFetcher,
  isRouteErrorResponse,
  useRouteError,
} from "@remix-run/react";
import invariant from "tiny-invariant";
import { getMarkdownContain, updateMarkdownContain } from "app/data";
import PreviewMarkdown from "app/components/preview/preview";
import { Button, ButtonGroup } from "@nextui-org/react";
import { Editor, DiffEditor } from "@monaco-editor/react";
import PageviewIcon from "@mui/icons-material/Pageview";
import DifferenceIcon from "@mui/icons-material/Difference";

export const action = async ({ params, request }: ActionFunctionArgs) => {
  invariant(params.markdownId, "Missing markdownId param");
  invariant(params.projectId, "Missing projectId param");
  const formData = await request.formData();
  const updates = Object.fromEntries(formData);
  await updateMarkdownContain(
    params.projectId,
    params.markdownId,
    updates.markdown.toString()
  );
  return redirect(
    encodeURI(`/projects/${params.projectId}/markdowns/${params.markdownId}`)
  );
};

export const loader = async ({ params }: LoaderFunctionArgs) => {
  invariant(params.markdownId, "Missing markdownId param");
  invariant(params.projectId, "Missing projectId param");

  const contact = await getMarkdownContain(params.projectId, params.markdownId);
  if (!contact) {
    throw new Response("Not Found", { status: 404 });
  }
  return json({ contact, params });
};

export default function EditContact() {
  const { contact, params } = useLoaderData<typeof loader>();
  const navigate = useNavigate();
  const fetcher = useFetcher();
  const [markdown, setMarkdown] = React.useState(contact.markdown);
  const [markdownPreview, setMarkdownPreview] = React.useState(
    contact.markdown
  );
  const [isPreview, setIsPreview] = React.useState(true);
  const diffEditorRef = React.useRef(null);
  if (markdown === undefined || markdownPreview === undefined) {
    return null;
  }

  function handleEditorDidMount(editor: any, monaco: any) {
    diffEditorRef.current = editor;
  }

  function setMarkdownOnMount() {
    if (diffEditorRef.current === null) {
      return;
    }
    const m = diffEditorRef.current.getModifiedEditor().getValue();
    setMarkdown(m);
    setMarkdownPreview(m);
  }

  return (
    <div className="flex flex-col w-full h-screen">
      <div className="flex flex-row justify-between py-4 px-8 pb-2 w-full">
        <div className="flex flex-row w-1/2 gap-4">
          <div className="flex text-end align-bottom items-end">
            <p className="font-bold text-xl m-0">{params.markdownId}</p>
          </div>
          <fetcher.Form method="post" onClick={() => setMarkdownOnMount()}>
            <Button
              type="submit"
              color="primary"
              variant="solid"
              className="capitalize text-base font-semibold"
            >
              Save
            </Button>
            <textarea
              name="markdown"
              value={markdownPreview}
              className="hidden"
            />
          </fetcher.Form>
          <div>
            <Button
              type="submit"
              color="primary"
              variant="bordered"
              className="capitalize text-base font-semibold"
              onClick={() => navigate(-1)}
            >
              Cancel
            </Button>
          </div>
        </div>
        <div className="flex flex-row w-1/2 gap-2">
          <ButtonGroup>
            <Button
              type="submit"
              color="secondary"
              variant={isPreview ? "solid" : "ghost"}
              className="capitalize text-base font-semibold"
              onClick={() => {
                setIsPreview(true);
                setMarkdownOnMount();
                setMarkdownPreview(markdown);
              }}
              startContent={<PageviewIcon />}
            >
              Preview
            </Button>
            <Button
              type="submit"
              color="secondary"
              variant={isPreview ? "ghost" : "solid"}
              className="capitalize text-base font-semibold"
              onClick={() => {
                setIsPreview(false);
                setMarkdown(markdownPreview);
              }}
              endContent={<DifferenceIcon />}
            >
              Diff
            </Button>
          </ButtonGroup>
        </div>
      </div>
      <div className="flex flex-row w-full h-[calc(100vh-80px)]">
        {isPreview ? (
          <>
            <div className="w-1/2 h-full p-4 pb-0 flex flex-col">
              <p>Modified</p>
              <div className="border h-full">
                <MarkdownEditor
                  markdown={markdown}
                  setMarkdownPreview={setMarkdownPreview}
                />
              </div>
            </div>
            <div className="w-1/2 h-full p-4 pb-0 flex flex-col">
              <p>Preview</p>
              <div className="h-full overflow-y-scroll p-4 border">
                <PreviewMarkdown
                  markdown={markdownPreview}
                  projectId={params.projectId}
                />
              </div>
            </div>
          </>
        ) : (
          <div className="w-full p-4">
            <div className="flex flex-col h-full">
              <div className="flex flex-row">
                <div className="w-1/2">
                  <p>Original</p>
                </div>
                <div className="w-1/2">
                  <p>Modified</p>
                </div>
              </div>
              <DiffEditor
                original={contact.markdown}
                modified={markdown}
                language="markdown"
                width={"100%"}
                loading={"Loading..."}
                onMount={handleEditorDidMount}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

type PreviewMarkdownProps = {
  markdown: string;
  setMarkdownPreview?: React.Dispatch<React.SetStateAction<string | undefined>>;
};

function MarkdownEditor(props: PreviewMarkdownProps) {
  const [draftTimer, setDraftTimer] = React.useState<
    NodeJS.Timeout | undefined
  >();

  const handleChange = (value: string | undefined, event: any) => {
    if (value === undefined) {
      return;
    }
    handleCheck(value);
  };

  const handleCheck = (markdown: string) => {
    clearTimeout(draftTimer);
    setDraftTimer(
      setTimeout(() => {
        props.setMarkdownPreview && props.setMarkdownPreview(markdown);
      }, 500)
    );
  };

  return (
    <Editor
      defaultLanguage="markdown"
      language="markdown"
      value={props.markdown}
      onChange={handleChange}
      width={"100%"}
      loading={"Loading..."}
    />
  );
}

export function ErrorBoundary() {
  const error = useRouteError();

  if (isRouteErrorResponse(error)) {
    return (
      <div>
        <h1>
          {error.status} {error.statusText}
        </h1>
        <p>{error.data}</p>
      </div>
    );
  } else if (error instanceof Error) {
    return (
      <div>
        <h1>ごめんなさい。</h1>
        <p>{error.message}</p>
        <p>The stack trace is:</p>
        <pre>{error.stack}</pre>
      </div>
    );
  } else {
    return <h1>Unknown Error</h1>;
  }
}
