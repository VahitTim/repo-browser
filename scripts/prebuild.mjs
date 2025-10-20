import fs from "fs";

const GITHUB_USER = process.env.GITHUB_USER;
if (!GITHUB_USER) {
  console.error("❌ Please set GITHUB_USER environment variable");
  process.exit(1);
}

const INFO_JSON_PATH = "./public/info.json";
const OVER_JSON_PATH = "./public/over.json";

async function main() {
    console.log(`Fetching repositories for ${GITHUB_USER}...`);

    const [responseRepos, responseUser] = await Promise.all([
        fetch(`https://api.github.com/users/${GITHUB_USER}/repos?per_page=100`),
        fetch(`https://api.github.com/users/${GITHUB_USER}`)
    ]);

    if (!responseRepos.ok || !responseUser.ok) {
        console.error(`GitHub API error: ${response.status}`);
        process.exit(1);
    }

    const repos = await responseRepos.json();
    const owner = await responseUser.json();

    fs.writeFileSync(INFO_JSON_PATH, JSON.stringify({owner, repos}, null, 2));
    // fs.writeFileSync(OVER_JSON_PATH, JSON.stringify(repos.map(repo => ({name: repo.name})), null, 2));
    console.log(`Saved repo info to ${INFO_JSON_PATH}`);
}

main();
