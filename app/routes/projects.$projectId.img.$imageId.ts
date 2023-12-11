import {
  type ActionFunctionArgs,
} from "@remix-run/node";
import invariant from "tiny-invariant";
import { getImage } from "app/data"

export async function loader({ params, request, context }: ActionFunctionArgs) {
  invariant(params.projectId, "Missing projectId param");
  invariant(params.imageId, "Missing imageIdId param");
  const image = await getImage(params.projectId, params.imageId)  
  
  return new Response(image, {
    headers: {
      "Content-Type": "image/png",
    },
  });
}