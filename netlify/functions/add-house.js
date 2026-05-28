const { Octokit } = require("@octokit/rest");
const cloudinary = require("cloudinary").v2;
const busboy = require("busboy");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });
const OWNER = process.env.GITHUB_OWNER;
const REPO = process.env.GITHUB_REPO;
const PATH = "data.json";
const PASSWORD = process.env.ADMIN_PASSWORD;

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { 
      statusCode: 405, 
      body: "Method Not Allowed" 
    };
  }

  try {
    const fields = await parseMultipartForm(event);

    if (fields.password !== PASSWORD) {
      return { 
        statusCode: 401, 
        body: JSON.stringify({ error: "Wrong password" }) 
      };
    }

    // Basic validation
    if (!fields.title || !fields.price || !fields.location || !fields.whatsapp) {
      return { 
        statusCode: 400, 
        body: JSON.stringify({ error: "Missing required fields" }) 
      };
    }

    // Upload images to Cloudinary
    const imageUrls = [];
    for (const file of fields.files) {
      const result = await uploadToCloudinary(file);
      imageUrls.push(result.secure_url);
    }

    // Get current data
    const { data: fileData } = await octokit.repos.getContent({
      owner: OWNER,
      repo: REPO,
      path: PATH,
    });

    const content = Buffer.from(fileData.content, "base64").toString();
    const houses = JSON.parse(content);

    const newHouse = {
      id: Date.now().toString(),
      title: fields.title,
      price: fields.price,
      location: fields.location,
      description: fields.description || "",
      whatsapp: fields.whatsapp,
      images: imageUrls,
      posted: new Date().toISOString(),
    };

    houses.unshift(newHouse);

    await octokit.repos.createOrUpdateFileContents({
      owner: OWNER,
      repo: REPO,
      path: PATH,
      message: `Add new house: ${fields.title}`,
      content: Buffer.from(JSON.stringify(houses, null, 2)).toString("base64"),
      sha: fileData.sha,
    });

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
      },
      body: JSON.stringify({ success: true, house: newHouse }),
    };
  } catch (error) {
    console.error(error);
    return { 
      statusCode: 500, 
      body: JSON.stringify({ error: error.message }) 
    };
  }
};

function parseMultipartForm(event) {
  return new Promise((resolve, reject) => {
    const bb = busboy({
      headers: event.headers,
      limits: { fileSize: 10 * 1024 * 1024, files: 8 } // 10MB, max 8 files
    });

    const fields = { files: [] };

    bb.on("file", (name, file, info) => {
      const chunks = [];
      file.on("data", (chunk) => chunks.push(chunk));
      file.on("end", () => {
        fields.files.push({
          filename: info.filename,
          content: Buffer.concat(chunks),
          contentType: info.mimeType,
        });
      });
    });

    bb.on("field", (name, val) => (fields[name] = val));
    bb.on("close", () => resolve(fields));
    bb.on("error", reject);

    bb.end(Buffer.from(event.body, "base64"));
  });
}

function uploadToCloudinary(file) {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream(
      { folder: "jos-homelisting" },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    ).end(file.content);
  });
}