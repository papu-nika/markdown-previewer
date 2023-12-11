const fs = require('fs');

type MarkdownMutation = {
  id?: string;
  markdown?: string;
};

const Markdowns = {
  async getAll(project: string): Promise<string[]> {
    return fs.readdirSync("data/" + project).filter((file: string) => {
      return fs.lstatSync("data/" + project + "/" + file).isFile()
    });
  },

  async get(project: string, id: string): Promise<MarkdownMutation | null> {
    const markdown = fs.readFileSync('data/' + project + "/" + id, 'utf-8', (err: any, data: any) => {
      if (err) {
        return null;
      }
      return data;
    });
    return { id, markdown };
  },

  async create(project: string, values: MarkdownMutation): Promise<MarkdownMutation> {
    if (values.id == undefined) {
      throw new Error("Can't create a contact with an ID")
    }
    fs.writeFileSync('data/' + project + "/" + values.id, values.markdown);
    return values;
  },

  destroy(project: string, filename: string): null {
    // delete Markdowns.records[id];
    fs.unlinkSync('data/' + project + "/" + filename);
    return null;
  },
};

export async function getProjects(query?: string | null): Promise<string[]> {
  const projects: string[] = fs.readdirSync("data");

  return projects.filter((project) => {
    if (!query) {
      return fs.lstatSync("data/" + project).isDirectory()
    } else {
      return project.includes(query) && fs.lstatSync("data/" + project).isDirectory();
    }
  });
}

export async function createProjects(project: string) {
  try {
    fs.mkdirSync("data/" + project);
    fs.mkdirSync("data/" + project + "/img");
  } catch (err) {
    throw new Error("Project already exists");
  }
}

export async function getMarkdownFiles(project: string | null): Promise<string[]> {
  if (project == null) {
    return [];
  }
  const contacts = await Markdowns.getAll(project);
  return contacts;
}

export async function getMarkdownContain(project: string, filename: string) {
  return Markdowns.get(project, filename);
}

export async function updateMarkdownContain(project: string, filename: string, markdown: string) {
  if (markdown == undefined) {
    throw new Error("Can't create a contact with an ID")
  }
  fs.writeFileSync('data/' + project + "/" + filename, markdown);
  // const htmlStr = markdown2HTML(CreateJSX({markdown: updates.markdown, projectId: project}));
  // fs.writeFileSync('data/' + project + "/html/" + filename + ".html", htmlStr);
  return;
}

export async function deleteMarkdown(project: string, filename: string) {
  await Markdowns.destroy(project, filename);
}

export async function deleteProject(project: string) {
    fs.rmdir('data/' + project, { recursive: true } , (err: any) => {
      if (err) {
        throw err;
        }
    }
    );
    return null;
}

export async function updateImage(project: string, filename: string, image: any) {
  try {
    fs.writeFileSync(`data/${project}/img/${filename}`, image);
  } catch (err) {
    throw new Error("Fail to update image");
  }
}

export async function deleteImage(project: string, filename: string) {
  try {
    fs.unlinkSync(`data/${project}/img/${filename}`);
  } catch (err) {
    throw new Error("Fail to delete image");
  }
}

export async function getImage(project: string, filename: string) {
  try {
    return fs.readFileSync(`data/${project}/img/${filename}`);
  } catch (err) {
    throw new Error("Fail to get image");
  }
}

export async function getImages(project: string): Promise<string[]> {
  try {
    return fs.readdirSync(`data/${project}/img`);
  } catch (err) {
    throw new Error("Fail to get images");
  }
}

// function markdown2HTML(jsx: React.ReactElement): string {
//   return ReactDOMServer.renderToStaticMarkup(jsx);
// }
