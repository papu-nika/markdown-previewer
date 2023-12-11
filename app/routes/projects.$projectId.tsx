import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { redirect, json } from "@remix-run/node";
import { Outlet, useLoaderData, Form, NavLink } from "@remix-run/react";
import { deleteProject, getImages, getMarkdownFiles } from "app/data";
import invariant from "tiny-invariant";
import {
  Popover,
  PopoverTrigger,
  Divider,
  PopoverContent,
  Button,
} from "@nextui-org/react";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";

export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData();
  const updates = Object.fromEntries(formData);

  if (updates.delete_project !== undefined || updates.delete_project !== "") {
    deleteProject(updates.delete_project.toString());
  }
  return redirect(encodeURI(`/`));
};

export const loader = async ({ params }: LoaderFunctionArgs) => {
  invariant(params.projectId, "Missing projectId param");

  const markdowns = await getMarkdownFiles(params.projectId);
  const images = await getImages(params.projectId);
  return json({ params, markdowns, images });
};

export default function Project() {
  const { params, markdowns, images } = useLoaderData<typeof loader>();

  return (
    <div className="flex flex-col p-6 pb-2 w-full h-full">
      <div className="flex justify-between">
        <div className="flex p-0 m-0 gap-2">
          <div className="text-2xl font-bold mx-4 text-end">
            {params.projectId}
          </div>
          <NavLink
            defaultChecked={true}
            to={`/projects/${params.projectId}/markdowns`}
            className={({ isActive, isPending }) =>
              isActive
                ? "text-lg font-semibold rounded-t-md px-4 py-2 m-0 bg-gray-200"
                : "text-lg font-semibold rounded-t-md px-4 py-2 m-0 hover:bg-gray-100"
            }
          >
            Markdowns
          </NavLink>
          <NavLink
            to={`/projects/${params.projectId}/images`}
            className={({ isActive, isPending }) =>
              isActive
                ? "text-lg font-semibold rounded-t-md px-4 py-2 m-0 bg-gray-200"
                : "text-lg font-semibold rounded-t-md px-4 py-2 m-0 hover:bg-gray-100"
            }
          >
            Images
          </NavLink>
        </div>
        <div className="mr-8">
          <DeleteProject
            projectId={params.projectId}
            markdowns={markdowns}
            images={images}
          />
        </div>
      </div>
      <Divider className="p-0 m-0" />

      <Outlet />
    </div>
  );
}

function DeleteProject({
  projectId,
  markdowns,
  images,
}: {
  projectId: string;
  markdowns: string[];
  images: string[];
}) {
  return (
    <Popover
      showArrow={false}
      offset={10}
      placement="left"
      backdrop="opaque"
      classNames={{
        backdrop: "bg-danger-100/30 backdrop-opacity-40",
      }}
    >
      <PopoverTrigger>
        <Button
          color="danger"
          type="submit"
          variant="flat"
          className="capitalize text-base font-semibold"
          isDisabled={projectId === undefined || projectId === ""}
          startContent={<DeleteForeverIcon />}
        >
          Delete Project
        </Button>
      </PopoverTrigger>
      <PopoverContent className="min-w-[360px] bg-white border">
        <div className="px-1 py-2 w-full">
          <p className="text-lg font-bold text-foreground">
            {projectId}を削除します。
          </p>
          <p className="text-small text-foreground">
            すべてのマークダウンと画像が削除されます。
          </p>
          <Divider className="my-2" />
          <div className="text-base font-bold text-foreground pb-1">
            マークダウン
          </div>
          <div className="pl-4">
            {markdowns.length > 0 ? (
              markdowns.map((markdown) => (
                <li key={markdown} className="text-small text-foreground">
                  {markdown}
                </li>
              ))
            ) : (
              <></>
            )}
          </div>
          <Divider className="my-2" />
          <div className="text-base font-bold text-foreground pb-1">画像</div>
          <div className="pl-4">
            {images.length > 0 ? (
              images.map((image) => (
                <li key={image} className="text-small text-foreground">
                  {image}
                </li>
              ))
            ) : (
              <></>
            )}
          </div>
          <div className="flex flex-row-reverse w-full">
            <Form method="post">
              <Button
                name="delete_project"
                color="danger"
                type="submit"
                value={projectId}
                isDisabled={projectId === undefined || projectId === ""}
              >
                Delete Project
              </Button>
            </Form>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
