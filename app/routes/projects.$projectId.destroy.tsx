import type { ActionFunctionArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import invariant from "tiny-invariant";

import { deleteProject } from "app/data";

export const action = async ({
  params,
}: ActionFunctionArgs) => {
  invariant(params.projectId, "Missing projectId param");
  await deleteProject(params.projectId);
  return redirect("/");
};