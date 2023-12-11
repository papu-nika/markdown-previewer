export async function uploads(project: string, files: FileList) {
    for (const [, file] of Object.entries(files)) {
      const result = await upload(project, file);
      if (result.result == "error") {
        return { success: false, message: result.message };
      }
    }
    return { success: true};
  }
  
  export async function upload(project: string, file: File) {
    const data = new FormData();
    data.append("file", file);
    const response = await fetch(`/api/images/${project}`, {
      method: "POST",
      body: data,
    });
    return await response.json();
  }