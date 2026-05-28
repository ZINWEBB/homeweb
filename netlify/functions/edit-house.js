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
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  try {
    const fields = await parseMultipartForm(event);

    if (fields.password !== PASSWORD) {
      return { statusCode: 401, body: JSON.stringify({ error: "Wrong password" }) };
    }

    if (!fields.id || !fields.title || !fields.price || !fields.location) {
      return { statusCode: 400, body: JSON.stringify({ error: "Missing required fields" }) };
    }

    // Upload new images
    const newImageUrls = [];
    for (const file of fields.files) {
      const result = await uploadToCloudinary(file);
      newImageUrls.push(result.secure_url);
    }

    const { data: fileData } = await octokit.repos.getContent({
      owner: OWNER,
      repo: REPO,
      path: PATH,
    });

    const content = Buffer.from(fileData.content, "base64").toString();
    let houses = JSON.parse(content);

    const houseIndex = houses.findIndex(h => h.id === fields.id);
    if (houseIndex === -1) {
      return { statusCode: 404, body: JSON.stringify({ error: "House not found" }) };
    }

    houses[houseIndex] = {
      ...houses[houseIndex],
      title: fields.title,
      price: fields.price,
      location: fields.location,
      description: fields.description || houses[houseIndex].description,
      whatsapp: fields.whatsapp || houses[houseIndex].whatsapp,
      images: [...(houses[houseIndex].images || []), ...newImageUrls],
    };

    await octokit.repos.createOrUpdateFileContents({
      owner: OWNER,
      repo: REPO,
      path: PATH,
      message: `Edit house: ${fields.title}`,
      content: Buffer.from(JSON.stringify(houses, null, 2)).toString("base64"),
      sha: fileData.sha,
    });

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
      },
      body: JSON.stringify({ success: true, house: houses[houseIndex] }),
    };
  } catch (error) {
    console.error(error);
    return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
  }
};

// Same helper functions as in add-house.js
function parseMultipartForm(event) { /* ... copy from add-house.js ... */ }
function uploadToCloudinary(file) { /* ... copy from add-house.js ... */ }