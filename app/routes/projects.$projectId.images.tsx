import type { ActionFunctionArgs } from "@remix-run/node";
import { Form, useRouteLoaderData, useFetcher } from "@remix-run/react";
import React from "react";
import { redirect } from "@remix-run/node";
import { createWorkerFactory } from "@shopify/web-worker";
import invariant from "tiny-invariant";
import { useWorker } from "@shopify/react-web-worker";
import { deleteImage, updateMarkdownContain } from "app/data";
import {
  Popover,
  PopoverTrigger,
  Divider,
  PopoverContent,
  Button,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
} from "@nextui-org/react";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import PageviewIcon from "@mui/icons-material/Pageview";

export const action = async ({ params, request }: ActionFunctionArgs) => {
  invariant(params.projectId, "Missing projectId param");
  const formData = await request.formData();
  const updates = Object.fromEntries(formData);

  if (updates.image_id !== undefined) {
    const image_id: string = updates.image_id.toString();
    await updateMarkdownContain(params.projectId, image_id, "");
  } else if (updates.delete_image_id !== undefined) {
    const delete_image_id: string = updates.delete_image_id.toString();
    await deleteImage(params.projectId, delete_image_id);
  }
  return redirect(encodeURI(`/projects/${params.projectId}/images`));
};

const createWorker = createWorkerFactory(() => import("app/worker"));

export default function Images() {
  const { images, params } = useRouteLoaderData("routes/projects.$projectId");
  const [fileList, setFileList] = React.useState<FileList | null>(null);
  const worker = useWorker(createWorker);
  const fetcher = useFetcher();

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (fileList == null) {
      return;
    }
    const result = await worker.uploads(params.projectId, fileList);
    if (result?.success) {
      fetcher.submit(null, { method: "post" });
    } else {
      alert(`アップロードに失敗しました。\n ${result?.message}`);
    }
    setFileList(null);
  }
  const inputRef = React.useRef<HTMLInputElement>(null);
  const handleButtonClick = () => {
    inputRef.current?.click();
  };

  return (
    <div className="flex flex-col justify-center w-4/5 p-4">
      <div className="flex gap-4 w-full h-full p-4">
        <form method={"POST"} encType="multipart/form-data" onSubmit={onSubmit}>
          <div className="flex gap-4">
            <Button
              color="primary"
              type="submit"
              variant="flat"
              className="text-base font-semibold"
              startContent={<UploadFileIcon />}
              onClick={() => handleButtonClick()}
            >
              Select File
            </Button>
            <input
              ref={inputRef}
              type="file"
              name="file"
              className="hidden m-0 p-0"
              onChange={(e) => {
                setFileList(e.target.files);
              }}
              multiple
            />
            <Button
              color="primary"
              type="submit"
              variant="bordered"
              className="text-base font-semibold"
              isDisabled={fileList === null}
            >
              Send
            </Button>
          </div>
        </form>
        {fileList == null || fileList.length === 0 ? (
          <></>
        ) : (
          Array.from(fileList).map((file) => (
            <>
              <div key={file.name} className="flex justify-between w-full">
                <div className="flex items-center h-full">
                  <p className="font-bold text-lg m-0">{file.name}</p>
                </div>
              </div>
            </>
          ))
        )}
      </div>
      <div className="flex flex-col gap-2 p-4">
        {images == null || images.length === 0 ? (
          <div className="flex justify-center w-full">
            <p className="font-bold text-lg m-0">No markdown files</p>
          </div>
        ) : (
          Array.from(images).map((image) => (
            <>
              <div key={image} className="flex justify-between w-full">
                <div className="flex items-center h-full">
                  <p className="font-bold text-lg m-0">{image}</p>
                </div>
                <div className="flex flex-row gap-4">
                  <ImagePreviewButton
                    projectId={params.projectId}
                    image={image}
                  />
                  <DeleteButton image={image} />
                </div>
              </div>
              <Divider className="my-0" />
            </>
          ))
        )}
      </div>
    </div>
  );
}

type ImagePrecireProps = {
  projectId: string;
  image: string;
};

function ImagePreviewButton(props: ImagePrecireProps) {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  return (
    <>
      <Button
        color="primary"
        variant="flat"
        onPress={onOpen}
        startContent={<PageviewIcon />}
        className="text-base font-semibold"
      >
        Preview
      </Button>
      <Modal
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        size="3xl"
        classNames={{
          backdrop: "bg-blue-100/50 backdrop-opacity-40",
        }}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                {props.image}
              </ModalHeader>
              <ModalBody>
                <img
                  alt=""
                  key={props.image}
                  src={`/projects/${props.projectId}/img/${props.image}`}
                ></img>
              </ModalBody>
              <ModalFooter>
                <Button color="primary" variant="light" onPress={onClose}>
                  Close
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}

function DeleteButton({ image }: { image: string }) {
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
          color="danger"
          type="submit"
          variant="flat"
          className="text-base font-semibold"
          startContent={<DeleteForeverIcon />}
        >
          Delete
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[240px] bg-white border">
        <div className="px-1 py-2 w-full">
          <p className="text-small font-bold text-foreground">
            {image}を削除します。
          </p>
          <Divider className="my-2" />
          <div className="mt-2 flex flex-row-reverse w-full">
            <Form method="post">
              <Button
                color="danger"
                type="submit"
                name="delete_image_id"
                value={image}
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
