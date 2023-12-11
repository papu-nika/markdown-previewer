import type { LoaderFunctionArgs, ActionFunctionArgs } from "@remix-run/node";
import {
  Form,
  useFetcher,
  useNavigation,
  useRouteLoaderData,
  Outlet,
  NavLink,
} from "@remix-run/react";
import React from "react";
import { redirect } from "@remix-run/node";
import invariant from "tiny-invariant";
import { updateMarkdownContain, deleteMarkdown } from "app/data";
import {
  Popover,
  PopoverTrigger,
  Divider,
  PopoverContent,
  Button,
  Tooltip,
  Input,
  Spinner,
} from "@nextui-org/react";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import EditIcon from "@mui/icons-material/Edit";
import PageviewIcon from "@mui/icons-material/Pageview";
import AddIcon from "@mui/icons-material/Add";

export const action = async ({ params, request }: ActionFunctionArgs) => {
  invariant(params.projectId, "Missing projectId param");
  const formData = await request.formData();
  const updates = Object.fromEntries(formData);
  if (updates.markdown_id !== undefined && updates.markdown_id !== "") {
    console.log(updates.markdown_id);
    const markdown_id: string = updates.markdown_id.toString();
    await updateMarkdownContain(params.projectId, markdown_id, "");
  } else if (
    updates.delete_markdown_id !== undefined &&
    updates.delete_markdown_id !== ""
  ) {
    const delete_markdown_id: string = updates.delete_markdown_id.toString();
    await deleteMarkdown(params.projectId, delete_markdown_id);
  }
  return redirect(encodeURI(`/projects/${params.projectId}/markdowns`));
};

export default function Markdowns() {
  const { markdowns } = useRouteLoaderData("routes/projects.$projectId");
  const fetcher = useFetcher();
  const [markdownName, setMarkdownName] = React.useState<string>("");

  return (
    <div className="flex flex-col w-full p-8">
      <div className="w-full">
        <fetcher.Form method="POST">
          <div className="flex flex-row gap-4 w-fit">
            <Input
              type="text"
              name="markdown_id"
              variant="bordered"
              placeholder="markdown name"
              className="text-base w-80"
              onChange={(e) => setMarkdownName(e.target.value)}
            />
            <Button
              type="submit"
              color="primary"
              variant="bordered"
              startContent={<AddIcon />}
              className="text-base font-semibold"
              isDisabled={markdownName === ""}
            >
              Create Markdown
            </Button>
          </div>
        </fetcher.Form>
      </div>

      <div className="flex w-full">
        <div className="w-1/4 h-full py-4 pr-2">
          <MarkdownList markdowns={markdowns} />
        </div>
        <div className="w-3/4 h-full py-4 pl-2">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

function MarkdownList({ markdowns }: { markdowns: string[] }) {
  return (
    <div className="flex flex-col gap-3 overflow-auto">
      {markdowns.length === 0 ? (
        <div className="flex justify-center w-full">
          <p className="font-bold text-lg m-0">No markdown files</p>
        </div>
      ) : (
        markdowns.map((markdownFile) => (
          <div key={markdownFile}>
            <div className="flex justify-between w-full gap-4">
              <div className="flex items-center h-full w-full">
                <NavLink to={markdownFile}>
                  {({ isActive, isPending }) =>
                    isActive ? (
                      <div className="flex text-base font-semibold rounded-md px-4 py-2 m-0 bg-gray-200">
                        {markdownFile}
                        <Tooltip content="Preview">
                          <PageviewIcon className="m-0 p-0 ml-2" />
                        </Tooltip>
                      </div>
                    ) : isPending ? (
                      <div className="flex text-base font-semibold rounded-md px-4 py-2 m-0 bg-gray-200">
                        {markdownFile}
                        <Tooltip content="Preview">
                          <Spinner size="sm" className="m-0 p-0 ml-2" />
                        </Tooltip>
                      </div>
                    ) : (
                      <div className="flex text-base font-semibold rounded-md px-4 py-2 m-0 hover:bg-gray-100">
                        {markdownFile}
                        <Tooltip content="Preview">
                          <PageviewIcon className="m-0 p-0 ml-2" />
                        </Tooltip>
                      </div>
                    )
                  }
                </NavLink>
              </div>
              <div className="flex flex-row gap-1">
                <EditButton markdown={markdownFile} />
                <DeleteButton markdownFile={markdownFile} />
              </div>
            </div>
            <Divider className="my-1" />
          </div>
        ))
      )}
    </div>
  );
}

function EditButton({ markdown }: { markdown: string }) {
  const navigation = useNavigation();
  return (
    <Form action={`${markdown}/edit`}>
      <Tooltip content="Edit">
        <Button
          type="submit"
          color="primary"
          variant="flat"
          className="text-sm font-semibold px-3"
          isIconOnly
          isDisabled={navigation.state === "loading"}
        >
          <EditIcon />
        </Button>
      </Tooltip>
    </Form>
  );
}

function DeleteButton({ markdownFile }: { markdownFile: string }) {
  const buttonRef = React.useRef<HTMLButtonElement>(null);
  const handleButtonClick = () => {
    buttonRef.current?.click();
  };
  const navigation = useNavigation();

  return (
    <Popover
      showArrow={false}
      offset={10}
      placement="right"
      backdrop="opaque"
      classNames={{
        backdrop: "bg-danger-100/30 backdrop-opacity-40",
      }}
    >
      <PopoverTrigger>
        <Button
          ref={buttonRef}
          // itemRef={buttonRef}
          color="danger"
          type="submit"
          variant="flat"
          className="text-sm font-semibold px-3"
          isIconOnly
          isDisabled={navigation.state === "loading"}
        >
          <Tooltip content="Delete">
            <DeleteForeverIcon onClick={() => handleButtonClick()} />
          </Tooltip>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[240px] bg-white border">
        <div className="px-1 py-2 w-full">
          <p className="text-small font-bold text-foreground">
            {markdownFile}を削除します。
          </p>
          <Divider className="my-2" />
          <div className="mt-2 flex flex-row-reverse w-full">
            <Form method="post">
              <Button
                color="danger"
                type="submit"
                name="delete_markdown_id"
                value={markdownFile}
                className="capitalize"
              >
                Delete
              </Button>
            </Form>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
