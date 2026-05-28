const { Octokit } = require("@octokit/rest");

const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });
const OWNER = process.env.GITHUB_OWNER;
const REPO = process.env.GITHUB_REPO;
const PATH = "HOMELINK-JS/houselisting.json";
const PASSWORD = process.env.ADMIN_PASSWORD;

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  try {
    const { id, password } = JSON.parse(event.body);

    if (password !== PASSWORD) {
      return { statusCode: 401, body: JSON.stringify({ error: "Wrong password" }) };
    }

    if (!id) {
      return { statusCode: 400, body: JSON.stringify({ error: "House ID is required" }) };
    }

    const { data: fileData } = await octokit.repos.getContent({
      owner: OWNER,
      repo: REPO,
      path: PATH,
    });

    const content = Buffer.from(fileData.content, "base64").toString();
    const data = JSON.parse(content);
    let houses = data.houselisting || [];

    const initialLength = houses.length;
    houses = houses.filter(h => h.id !== id);

    if (houses.length === initialLength) {
      return { statusCode: 404, body: JSON.stringify({ error: "House not found" }) };
    }

    await octokit.repos.createOrUpdateFileContents({
      owner: OWNER,
      repo: REPO,
      path: PATH,
      message: `Delete house ID: ${id}`,
      content: Buffer.from(JSON.stringify({ houselisting: houses }, null, 2)).toString("base64"),
      sha: fileData.sha,
    });

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
      },
      body: JSON.stringify({ success: true }),
    };
  } catch (error) {
    console.error(error);
    return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
  }
};