import type { ActionFunctionArgs, LinksFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import {
  Form,
  NavLink,
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
} from "@remix-run/react";
import { Divider, Spacer, Button, Input } from "@nextui-org/react";
import React from "react";
import { getProjects, createProjects } from "app/data";
import SearchIcon from "@mui/icons-material/Search";
import AddIcon from "@mui/icons-material/Add";
import styles from "./tailwind.css";
import previewStyles from "app/styles/preview.css";

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: styles },
  { rel: "stylesheet", href: previewStyles },
];

export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData();
  const updates = Object.fromEntries(formData);
  const project_name = updates.project_name.toString();
  if (project_name === "") {
    return redirect(encodeURI("/"));
  }
  createProjects(project_name);
  return redirect(encodeURI(`projects/${project_name}`));
};

export const loader = async () => {
  const projects = await getProjects();
  return json({ projects });
};

export default function App() {
  const { projects } = useLoaderData<typeof loader>();
  const [project_name, setProjectName] = React.useState("");
  const [search, setSearch] = React.useState("");

  return (
    <html lang="en" className="m-0 p-0">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body className="m-0 p-0 flex">
        <div
          id="default-sidebar"
          className="fixed top-0 left-0 z-40 h-screen transition-transform -translate-x-full sm:translate-x-0
          hidden md:block md:w-40 lg:w-64
          "
          aria-label="Sidebar"
        >
          <div className="h-full px-3 py-4 overflow-y-auto bg-gray-50 dark:bg-gray-800">
            <div className="flex flex-col sticky top-0 p-4                                                                                                                                                            ">
              <div className="flex w-full">
                <NavLink className="text-xl font-bold" to="/">
                  <div>Home</div>
                </NavLink>
              </div>

              <Divider className="my-4" />

              <Form method="post">
                <div className="flex flex-col gap-1.5">
                  <Input
                    color="primary"
                    name="project_name"
                    className="w-full"
                    variant="faded"
                    placeholder="PROJECT_NAME"
                    classNames={{
                      inputWrapper: "bg-white",
                    }}
                    onChange={(event) => {
                      const value = event.currentTarget.value;
                      setProjectName(value);
                    }}
                  ></Input>
                  <div className="flex flex-row-reverse w-full">
                    <Button
                      type="submit"
                      color="primary"
                      isDisabled={project_name === ""}
                      variant="bordered"
                      startContent={<AddIcon />}
                      className="capitalize text-base font-semibold"
                    >
                      New Project
                    </Button>
                  </div>
                </div>
              </Form>

              <Divider className="my-4" />

              <div>
                <Input
                  color="primary"
                  name="search"
                  className="w-full"
                  variant="faded"
                  classNames={{
                    inputWrapper: "bg-white",
                  }}
                  value={search}
                  onValueChange={setSearch}
                  startContent={<SearchIcon />}
                  placeholder="search"
                  isClearable
                ></Input>
              </div>

              <Spacer className="my-2" />
              {projects.map((project) => (
                <NavLink
                  key={project}
                  to={`projects/${project}`}
                  className={({ isActive, isPending }) =>
                    isActive
                      ? "text-lg font-semibold rounded-md p-1 my-1 bg-gray-200"
                      : project.toLowerCase().includes(search.toLowerCase())
                      ? "text-lg font-semibold rounded-md p-1 my-1 hover:bg-gray-100"
                      : "hidden"
                  }
                >
                  {project ? <>{project}</> : <i>No Name</i>}{" "}
                </NavLink>
              ))}
            </div>
          </div>
        </div>
        <div className="ml-0 md:ml-40 lg:ml-64 w-full md:w-[calc(100%-10rem)] lg:w-[calc(100%-16rem)]">
          <Outlet />
          <ScrollRestoration />
          <Scripts />
          <LiveReload />
        </div>
      </body>
    </html>
  );
}
