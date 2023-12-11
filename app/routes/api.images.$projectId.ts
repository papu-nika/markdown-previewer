import {
  type ActionFunctionArgs,
  unstable_createMemoryUploadHandler,
  unstable_parseMultipartFormData,
  json,
} from "@remix-run/node";
import invariant from "tiny-invariant";
import { getImages } from "app/data"

const fs = require('fs');
  
export async function action({ params, request, context }: ActionFunctionArgs) {
  invariant(params.projectId, "Missing projectId param");  
  if (request.method === "GET") {
    const images = await getImages(params.projectId)
    return json({ images });
  }
  if (request.method === "POST") {
    const uploadHandler = unstable_createMemoryUploadHandler({
        maxPartSize: 1024 * 1024 * 10,
      });
      const form = await unstable_parseMultipartFormData(request, uploadHandler);
      const file = form.get("file") as Blob;
  
      const imgData = await file.arrayBuffer()
      var data = new Uint8Array(imgData);
      var buffer = Buffer.from(data);
  
      const err = fs.writeFile(`data/${params.projectId}/img/${file.name}`, buffer, (err: any) => {
        if (err) {
          console.error(err)
          return json({ result: "error", message: "Error writing file" }, { status: 500 });
        }
        console.log("file written: ", file.name)
      });
      if (err) {
        console.error(err)
        return json({ result: "error", message: "Error writing file" }, { status: 500 });
      }
      return json({ result: "success"});
  }
  return json({ result: "error", message: "Method not allowed" }, { status: 405 });
}