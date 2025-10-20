import info from "../../public/info.json";
import { useState } from "react";
import { useFetchingEffect } from "../hooks/useFetchingEffect";
import Tree from "./Tree";

interface RepoData {
  label: string;
  path: string;
}

interface RepoInfo {
  id: number;
  name: string;
  html_url: string;
  data: RepoData;
}

export interface TreeNode {
  name: string;
  children?: Record<string, TreeNode>;
  repos: RepoInfo[];
}

export default function RepoBrowser() {
    const [reposInfo, setReposInfo] = useState(info.repos)
    const [repos, setRepos] = useState<RepoInfo[]>([])
    const [tree, setTree] = useState<TreeNode>({ name: "", children: {}, repos: [] });
    
    const image_url = `https://avatars.githubusercontent.com/u/${info.owner.id}?s=48&v=4`;
    const profile_url = `https://github.com/${info.owner.login}`;

    const handleRefresh = async () => {
        const response = await fetch(`https://api.github.com/users/${info.owner.login}/repos`);
        const data = await response.json();
        setReposInfo(data)
    }


    useFetchingEffect(async () => {
        const processed_info: RepoInfo[] = await Promise.all(
        reposInfo.map(async (i) => {
          const url = `https://raw.githubusercontent.com/${info.owner.login}/${i.name}/main/repoinfo/config.json`;
          const response = await fetch(url);
          if (!response.ok)
            return { ...i, data: { label: i.name, path: "" } };
          const result: RepoData = await response.json();
          return { ...i, data: result };
        })
      );
      setRepos(processed_info)
    }, [reposInfo])
    

    useFetchingEffect(async () => {
        const root: TreeNode = { name: "", children: {}, repos: [] };

        repos.forEach((repo) => {
            const parts = repo.data.path.split("/")
            let current = root;
            parts.forEach(part => {
            if (!current.children) current.children = {};
            if (!current.children[part])
                current.children[part] = { name: part, children: {}, repos: [] };
            current = current.children[part];
            });
            current.repos.push(repo);
        });

        setTree(root);
        }, [repos]);


  return (
    <div>
      <div className="flex items-center gap-5 text-xl mb-4">
        <img className="rounded-full w-16 h-16" src={image_url} />
        <a href={profile_url} title="перейти в профиль">
          <div className="hover:underline hover:cursor-pointer">{info.owner.login}</div>
        </a>
      </div>


        <button onClick={handleRefresh}>Обновить</button>
      <Tree node={tree} level={0}/>
    </div>
  );
}
