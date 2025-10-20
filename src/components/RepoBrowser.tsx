import data from "../../public/repo_info.json"
import info from "../../public/info.json"
import { useEffect, useState } from "react"

const image_url   = `https://avatars.githubusercontent.com/u/${data.owner.id}?s=48&v=4`
const profile_url = `https://github.com/${data.owner.name}`

interface RepoInfo {
    id: number,
    name: string,
    html_url: string
}


export default function RepoBrowser() {
    const [repos, setRepos] = useState<RepoInfo[]>(info);

    return (
        <div>
            <div className="flex items-center gap-5 text-xl">
                <img className="rounded-full" src={image_url}/>
                <a href={profile_url} title="перейти в профиль">
                <div
                    
                    className="hover:underline hover:cursor-pointer"
                    >{data.owner.name}</div>
                </a>
            </div>

            <div>
                {repos.map((repo, id) => (
                    <a href={repo.html_url} className="hover:underline">
                        <div>{id + 1}. {repo.name}</div>
                    </a>
                ))}
            </div>

        </div>
    );
}
